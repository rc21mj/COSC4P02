import os
import random
import string
import hashlib
import stripe
import base64
import time
import requests
import csv
from flask import Flask, redirect, request, session, url_for, render_template, jsonify, flash, json
from flask_cors import CORS
from flask_apscheduler import APScheduler
from dotenv import load_dotenv
from linkedinAPI import make_linkedin_post, generate_state
from webScraper import scrape_data, generate_post_from_llm
from requests_oauthlib import OAuth1Session
import firebase_admin
from datetime import datetime
from firebase_admin import credentials
from firebase_admin import db
from firebase_admin import auth
from ollama import chat
from ollama import ChatResponse
from diffusers import StableDiffusionPipeline, DDPMScheduler
import torch
from torch import autocast
from io import BytesIO
from flask import Flask, request, jsonify,json
import stripe
from flask_cors import CORS

print("Loading Stable Diffusion model...")
MODEL_ID = "CompVis/stable-diffusion-v1-4"
CURRENT_MODEL = "deepseek-r1:1.5b"
#pipe = StableDiffusionPipeline.from_pretrained(MODEL_ID, torch_dtype=torch.float16)
#pipe.to("cuda")
pipe = StableDiffusionPipeline.from_pretrained(MODEL_ID, torch_dtype=torch.float32)
pipe.to("cpu")

print("Model loaded successfully!")
CSV_FILE = "responses.csv"
app = Flask(__name__)
CORS(app)  # Allow requests from React frontend
# Initialize APScheduler
scheduler = APScheduler()
scheduler.init_app(app)

app.secret_key = os.getenv('app.secret_key', 'your_default_secret_key')  # Set a default secret key if not provided in .env
load_dotenv()
cred = credentials.Certificate("credentials.json")

firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://postpioneer-e82d3-default-rtdb.firebaseio.com/'
    })
# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID = os.getenv('LINKEDIN_CLIENT_ID')
LINKEDIN_CLIENT_SECRET = os.getenv('LINKEDIN_CLIENT_SECRET')
LINKEDIN_REDIRECT_URI = os.getenv('LINKEDIN_REDIRECT_URI')
LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_SCOPE = "openid profile email w_member_social"

# Twitter OAuth Configuration
TWITTER_CONSUMER_KEY = os.getenv('TWITTER_CONSUMER_KEY')
TWITTER_CONSUMER_SECRET = os.getenv('TWITTER_CONSUMER_SECRET')
TWITTER_AUTH_URL = "https://api.x.com/oauth/authenticate"
TWITTER_REQUEST_TOKEN_URL = "https://api.x.com/oauth/request_token"
TWITTER_ACCESS_TOKEN_URL = "https://api.x.com/oauth/access_token"


#################################
# LinkedIn OAuth & API Routes
#################################
@app.route('/linkedin_login')
def linkedin_login():
    state = generate_state()
    session['linkedin_oauth_state'] = state
    user_id = request.args.get('user_id')
    print(user_id)
    if user_id:
        session['username'] = user_id
        print(session['username'])
    params = {
        'response_type': 'code',
        'client_id': LINKEDIN_CLIENT_ID,
        'redirect_uri': LINKEDIN_REDIRECT_URI,
        'state': state,
        'scope': LINKEDIN_SCOPE
    }
    auth_request = requests.Request('GET', LINKEDIN_AUTH_URL, params=params).prepare()
    print(session['username'])
    print(f"LinkedIn Client ID: {LINKEDIN_CLIENT_ID}")
    return redirect(auth_request.url)

@app.route('/linkedin_callback')
def linkedin_callback():
    print(session['username'])
    code = request.args.get('code')
    state = request.args.get('state')
    if not code or not state:
        return "Error: Missing code or state parameter.", 400
    if state != session.get('linkedin_oauth_state'):
        return "Error: Invalid state parameter.", 400

    token_params = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': LINKEDIN_REDIRECT_URI,
        'client_id': LINKEDIN_CLIENT_ID,
        'client_secret': LINKEDIN_CLIENT_SECRET
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    token_response = requests.post(LINKEDIN_TOKEN_URL, data=token_params, headers=headers)
    if token_response.status_code != 200:
        return f"Error fetching access token: {token_response.text}", token_response.status_code
    token_data = token_response.json()
    access_token = token_data.get('access_token')
    session['linkedin_token'] = access_token
    save_linkedin_token(session['username'], access_token)

    return redirect('http://localhost:3000/settings')

@app.route('/remove_linkedin')
def remove_linkedin():
    user_id = request.args.get('user_id')
    db.reference("Users").child(user_id).child("Credentials").update({'LinkedIn': None})
    return redirect('http://localhost:3000/settings')
#################################
# Twitter OAuth & API Routes
#################################
@app.route('/twitter_login')
def twitter_login():
    user_id = request.args.get('user_id')
    if user_id:
        session['username'] = user_id
    oauth = OAuth1Session(
        client_key=TWITTER_CONSUMER_KEY,
        client_secret=TWITTER_CONSUMER_SECRET,
        callback_uri="http://localhost:5000/twitter_callback"
    )
    print("hi")
    fetch_response = oauth.fetch_request_token(TWITTER_REQUEST_TOKEN_URL)
    print(fetch_response)
    session["resource_owner_key"]    = fetch_response["oauth_token"]
    session["resource_owner_secret"] = fetch_response["oauth_token_secret"]
    auth_url = f"{TWITTER_AUTH_URL}?oauth_token={fetch_response['oauth_token']}"
    return redirect(auth_url)

@app.route('/twitter_callback')
def twitter_callback():
    user_id = session.get('username')
    if not user_id:
        return "userid", 400
    oauth_verifier = request.args.get('oauth_verifier')
    resource_owner_key = session.get("resource_owner_key")
    resource_owner_secret = session.get("resource_owner_secret")
    if not oauth_verifier:
        return "Missing oauth_verifier in callback!", 400
    if not resource_owner_key:
        return "Missing request token in session", 400
    if not resource_owner_secret:  
        return "Missing request token secret in session", 400

    oauth = OAuth1Session(
        client_key=TWITTER_CONSUMER_KEY,
        client_secret=TWITTER_CONSUMER_SECRET,
        resource_owner_key=resource_owner_key,
        resource_owner_secret=resource_owner_secret,    
        verifier=oauth_verifier
    )
    access_token_response = oauth.fetch_access_token("https://api.x.com/oauth/access_token")

    session['access_token'] = access_token_response['oauth_token']
    session['access_token_secret'] = access_token_response['oauth_token_secret']

    save_twitter_token(user_id, session['access_token'], session['access_token_secret'])

    return redirect('http://localhost:3000/settings')

@app.route('/remove_twitter')
def remove_twitter():
    user_id = session.get('user_id')
    db.reference("Users").child(user_id).child("Credentials").update({'TwitterToken' : None,
                                                                       'TwitterTokenSecret' : None})
    return redirect('http://localhost:3000/settings')

def fetch_user_posts(username):
    # Placeholder function to fetch user-specific posts
    return [
        {"content": "Post 1", "date": "2023-03-01"},
        {"content": "Post 2", "date": "2023-03-02"}
    ]

def fetch_user_stats(username):
    # Placeholder function to fetch user-specific stats
    return {
        "total_posts": 10,
        "total_likes": 50,
        "total_comments": 20
    }

def save_linkedin_token(username, token):
    # Save the LinkedIn token for the user
    db.reference("Users").child(username).child("Credentials").update({'LinkedIn' : token})


def remove_linkedin_token(username):
    # Remove the LinkedIn token for the user
    db.reference("Users").child(username).child("Credentials").update({'LinkedIn': None})


def get_linkedin_token(username):
    # Retrieve the LinkedIn token for the user

    return db.reference("Users").child(username).child("Credentials").child('LinkedIn').get()

def save_twitter_token(username, token, token_secret):
    db.reference("Users").child(username).child("Credentials").update({'TwitterToken' : token,
                                                                       'TwitterTokenSecret' : token_secret})
    # Save the Twitter token for the user

def remove_twitter_token(username):
    # Remove the Twitter token for the user
    db.reference("Users").child(username).child("Credentials").update({'TwitterToken' : None,
                                                                       'TwitterTokenSecret' : None})


def get_twitter_token(username):
    # Retrieve the Twitter token for the user

    return db.reference("Users").child(username).child("Credentials").child('TwitterToken').get()

def get_twitter_token_secret(username):
    # Retrieve the Twitter token secret for the user

    return db.reference("Users").child(username).child("Credentials").child('TwitterTokenSecret').get()

@app.route('/2/tweets', methods=["POST"])
def get_tweet():
    tweet = request.json.get('post')
    print(f"Received tweet: {tweet}")

    # Retrieve the OAuth tokens from the database
    ref = db.reference("Users").child("userid").child("UserTokens")
    tokens = ref.order_by_key().limit_to_last(1).get()
    for key, value in tokens.items():
        auth_token = value['xToken']
        auth_token_secret = value['xTokenSecret']

    oauth = OAuth1Session(
        client_key=TWITTER_CONSUMER_KEY,
        client_secret=TWITTER_CONSUMER_SECRET,
        resource_owner_key=auth_token,
        resource_owner_secret=auth_token_secret
    )

    response = oauth.post(
        "https://api.x.com/2/tweets",
        json={"text": tweet}
    )

    if response.status_code == 201:
        return jsonify({"message": "Tweet successfully posted!"})
    else:
        return jsonify({"message": f"Failed to post tweet: {response.text}"}), response.status_code

#################################
# Preference Form Logic
#################################
@app.route("/submit", methods=["POST"])
def submit():
    data = request.json
    tone = data.get("tone")
    topic = data.get("topic")
    schedule = data.get("schedule")
    language = data.get("language")
    userid = data.get("userid")
    hashtags = data.get("customHashtags")
    custom_image_option = data.get("customImageOption") 
    uploaded_image = data.get("uploadedImage")

    current_time = datetime.now()

    print(userid)
    if not (tone and topic and schedule and userid and language):
        return jsonify({"error": "Missing fields"}), 400

    # Generate post text
    post_text = generatePostText(tone, topic, language, hashtags)

    # Initialize Firebase reference
    ref = db.reference("Users").child(userid).child("UserPosts")
    postID = ref.push({
        "topic": topic,
        "tone": tone,
        "data": post_text,  # Placeholder to avoid filling up the database too fast
        "schedule": schedule,
        "language": language,
        "edit": "true",
        "timestamp": current_time.isoformat(),
        "customHashtags": hashtags
    })
    postID = postID.key
    print(f"Post ID: {postID}")

    # Handle image based on the selected option
    base64_image = None
    if custom_image_option == "generate":
        base64_image = generatepostImage(tone, topic)
    elif custom_image_option == "upload" and uploaded_image:
        base64_image = uploaded_image  # Use the uploaded image (Base64 string)

    # Save post data
    posts_ref = ref.child(postID)
    post_data = {
        "image": base64_image,
        "timestamp": current_time.isoformat()
    }
    if base64_image:
        post_data["image"] = base64_image

    posts_ref.update(post_data)

    # Return response
    response = {
        "message": post_text,
        "postID": postID
    }
    if base64_image:
        response["image"] = f"data:image/png;base64,{base64_image}"

    return jsonify(response), 200

#################################
# Post Generation Logic
#################################

def generatePostText(tone, topic, language, hashtag):
    scraped_text = scrape_data(topic)
    if scraped_text is not None:
        initial_prompt = f"Write a {tone} social media post about {topic} in the {language} language. It must be in {language}. The data is: {scraped_text}"
    else:
        initial_prompt = f"Write a {tone} social media post about {topic} in the {language} language. It must be in {language}."
    print("Post Pioneer Text Generation Test")
    model = CURRENT_MODEL
    messages = [{"role": "system", "content": initial_prompt}];
    response= chat(model=model, messages=messages)
    messages.append({"role": "assistant", "content": response['message']['content']})
    print(response['message']['content'])
    return response['message']['content'].split("</think>",1)[1]+hashtag

def generatepostImage(tone, topic):
    initial_prompt = f"Write a stable diffusion prompt about {topic}, the image tone must be {tone}. Provide just the prompt!"
    print("Post Pioneer Stable Diffusion Prompt Generation Test")
    model = CURRENT_MODEL
    messages = [{"role": "system", "content": initial_prompt}];
    response= chat(model=model, messages=messages)
    messages.append({"role": "assistant", "content": response['message']['content']})
    print(response['message']['content'])
    prompt = response['message']['content'].split("</think>",1)[1]
    print("Post Pioneer Stable Diffusion Test")
    image = pipe(prompt, num_inference_steps=20).images[0]
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

def generateTranslation(language):
    initial_prompt = f"Translate this text to {language}. It must be in {language}."
    print("Post Pioneer Prompt Translation Test")
    model = CURRENT_MODEL
    messages = [{"role": "system", "content": initial_prompt}];
    response= chat(model=model, messages=messages)
    messages.append({"role": "assistant", "content": response['message']['content']})
    print(response['message']['content'])
    return response['message']['content'].split("</think>",1)[1]

#################################
# Scheduler Logic (When Twitter posting is unbanned replace the print statements with the actual posting code)
#################################

@scheduler.task('cron', id='job_2', hour='*', minute='0')
def hourly_trigger():
    print("This job runs every hour!")
    users_ref = db.reference("Users")
    users = users_ref.get()
    # Iterate and print each user and their posts
    current_time = datetime.now()
    if users:
        for user_id, user_data in users.items():
            print(f"User ID: {user_id}")
            if "UserPosts" in user_data:
                for post_id, post_data in user_data["UserPosts"].items(): 
                    if "schedule" in post_data:
                        should_post = False
                        if post_data["schedule"] == "hourly":
                            should_post = True
                        elif post_data["schedule"] == "daily" and current_time.hour == 0:
                            should_post = True
                        elif post_data["schedule"] == "weekly" and current_time.weekday() == 0 and current_time.hour == 0:
                            should_post = True
                        elif post_data["schedule"] == "biweekly" and current_time.weekday() == 0 and current_time.hour == 0 and current_time.day % 14 == 0:
                            should_post = True
                        elif post_data["schedule"] == "monthly" and current_time.day == 1 and current_time.hour == 0:
                            should_post = True

                        if should_post:
                            print(f"{post_data['schedule'].capitalize()} post")

                            generated_text = generatePostText(post_data["tone"], post_data["topic"], post_data["language"], post_data["customHashtags"])
                            print(generated_text)

                            image_url = generatepostImage(post_data["tone"], post_data["topic"])  # <-- modify this to return a URL
                            print("Image generated")

                            # Save to Firebase
                            post_result_ref = db.reference("Users").child(user_id).child("UserPosts").child(post_id)
                            post_result_ref.set({
                                "timestamp": current_time.isoformat(),
                                "text": generated_text,
                                "image": image_url
                            })
            else:
                print("  No UserPosts found.")
    else:
        print("No users found in the database.")

stripe.api_key = "sk_test_51QuKO2KsmLUG0fTBiVvflwSJ94bwiEHx8sTnXyCHKhFNA6JKIKmLX0y9fKVohnPlmrUP86osPlZRgsubXyMMjXlY00Op5RpSJ8"  # Replace with your actual Stripe secret key.

@app.route("/process-payment", methods=["POST"])
def process_payment():
    data = request.get_json()
    payment_token_str = data.get("paymentToken")
    print(f"Receieved payment token: {payment_token_str}")
    print(f"Request payload: {data}")
    
    if not payment_token_str:
        return jsonify({"error": "Missing payment token"}), 400

    try:
        payment_token = json.loads(payment_token_str).get("id")

        charge = stripe.Charge.create(
            amount=100,  
            currency="cad",
            source=payment_token,
            description="Test payment"
        )
        return jsonify({"status": "success", "charge": charge})
    except Exception as e:
        print(f"Error processing payment: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/hil_submit", methods=["POST"])
def hil_submit():
    data = request.get_json()
    print(data)

    generated_post = data.get('generated_post')
    access_token = get_linkedin_token(data.get('userid'))
    image = data.get('user_image')
    print("new")
    make_linkedin_post(access_token, generated_post, image)
    return jsonify({"All good": "Good"}), 200

#################################
# Dashboard Logic
#################################


#If linkedin allowed analytics
@app.route('/api/dashboard-data')
def dashboard_data():
    uid = request.args.get('uid')
    if not uid:
        return jsonify({"error": "Missing UID"}), 400

    ref = db.reference("Users").child(uid).child("UserPosts")
    posts_raw = ref.get() or {}

    scheduled_posts = []
    for post_id, post_data in posts_raw.items():
        if isinstance(post_data, dict):
            scheduled_posts.append({
                "id": post_id,
                "platform": post_data.get("platform", ""),
                "frequency": post_data.get("schedule", ""),
                "content": post_data.get("data", "")
            })
    engagement_data = [
        {"date": "2025-04-20", "likes": 20, "comments": 5},
        {"date": "2025-04-21", "likes": 35, "comments": 8},
    ]
    total_engagement = sum(item["likes"] + item["comments"] for item in engagement_data)

    return jsonify({
        "scheduledPosts": scheduled_posts,
        "engagementData": engagement_data,
        "totalEngagement": total_engagement
    })

@app.route("/2/tweets/publicMetrics", methods=["GET"])
def engagement_rate():
    # 1) pull tokens from your DB/session
    token, secret = getOauthToken()  
    oauth = OAuth1Session(
      TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET,
      resource_owner_key=token,
      resource_owner_secret=secret
    )

    # 2) compute rate
    rate = publicMetric(oauth, days=7)
    return jsonify(rate=rate)


def publicMetric(oauth, days=7):
    token, secret = getOauthToken()
    
    oauth = OAuth1Session(
        client_key=TWITTER_CONSUMER_KEY,
        client_secret=TWITTER_CONSUMER_SECRET,
        resource_owner_key=token,
        resource_owner_secret=secret
    )

    # 2) who am I?
    me = oauth.get("https://api.x.com/2/users/me",
                   params={"user.fields":"username"})
    me.raise_for_status()
    username = me.json()["data"]["username"]

    # 3) resolve to numeric ID
    u = oauth.get(f"https://api.x.com/2/users/by/username/{username}")
    u.raise_for_status()
    user_id = u.json()["data"]["id"]

    
    tweets_resp = safe_get(
        oauth,
        f"https://api.x.com/2/users/{user_id}/tweets",
        params={
            "max_results": 10,
            "tweet.fields": "public_metrics",
        }
    )
    tweets_resp.raise_for_status()
    tweets = tweets_resp.json().get("data", [])

    # 5) pull out each tweet’s public_metrics
    metrics = [t["public_metrics"] for t in tweets]

    return jsonify(metrics=metrics)

def safe_get(oauth, url, params):
    resp = oauth.get(url, params=params)
    remaining = int(resp.headers.get("x-rate-limit-remaining", 0))

    if remaining <= 0:
        reset_ts = int(resp.headers.get("x-rate-limit-reset", 0))
        wait = max(0, reset_ts - time.time())
        raise RuntimeError(f"Rate limit hit—retry after {wait:.0f}s")

    resp.raise_for_status()
    return resp

def getOauthToken(userid):
    # pull from your Firebase/DB exactly as you had it
    ref = db.reference("Users").child("userid").child("UserTokens")
    tokens = ref.order_by_key().limit_to_last(1).get()
    for key, v in tokens.items():
        print("DEBUG -- token record:", v)
        # don’t crash here — return something so your app doesn’t 500
        return (
          v.get("TwitterToken")      or v.get("xToken")      or None,
          v.get("TwitterTokenSecret") or v.get("xTokenSecret") or None
        )
    return None, None

# START OF DASHBOARD SCHEDLUING API #
@app.route('/api/cancel-scheduler')
def cancel_scheduling():
    uid = request.args.get('uid')
    postid = request.args.get('postid')
    if not uid:
        return jsonify({"error": "Missing UID"}), 400
    if not postid:
        return jsonify({"error": "Missing PostID"}), 400
    db.reference("Users").child(uid).child("UserPosts").child(postid).delete()
    return jsonify({"message": "Scheduling cancelled."}), 200
@app.route('/api/change-scheduler')
def change_scheduling():
    uid = request.args.get('uid')
    postid = request.args.get('postid')
    schedule = request.args.get('schedule')
    if not uid:
        return jsonify({"error": "Missing UID"}), 400
    if not postid:
        return jsonify({"error": "Missing PostID"}), 400
    if not schedule:
        return jsonify({"error": "Missing Schedule"}), 400
    db.reference("Users").child(uid).child("UserPosts").child(postid).update({'schedule': schedule})
    return jsonify({"message": "Scheduling changed."}), 200
# END OF DASHBOARD SCHEDULING API #






# Start the scheduler
scheduler.start()


if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=False)
