import os
import random
import string
import hashlib
import stripe
import base64
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
import datetime
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

app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your_default_secret_key')  # Set a default secret key if not provided in .env
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
TWITTER_REDIRECT_URI = os.getenv('TWITTER_REDIRECT_URI')
TWITTER_AUTH_URL = "https://api.twitter.com/oauth/authenticate"
TWITTER_REQUEST_TOKEN_URL = "https://api.twitter.com/oauth/request_token"
TWITTER_ACCESS_TOKEN_URL = "https://api.twitter.com/oauth/access_token"

@app.route('/make_post', methods=['GET', 'POST'])
def make_post():
    if 'username' not in session:
        return redirect(url_for('user_login'))
    
    if request.method == 'POST':
        if 'generate_post' in request.form:
            platform = request.form.get('platform')
            tone = request.form.get('tone')
            topic = request.form.get('topic')
            
            # Scrape data based on the topic
            scraped_data = scrape_data(topic)
            
            # Generate the prompt for the LLM
            prompt = f"Create a post for {platform} in a {tone} tone, using this summarized data: {scraped_data}"
            
            return render_template('make_post.html', platform=platform, prompt=prompt)
        
        elif 'generate_summary' in request.form:
            platform = request.form.get('platform')
            prompt = request.form.get('prompt')
            
            # Get the generated post from the LLM
            generated_post = generate_post_from_llm(prompt)
            
            return render_template('make_post.html', platform=platform, generated_post=generated_post)
        
        elif 'submit_post' in request.form:
            platform = request.form.get('platform')
            generated_post = request.form.get('generated_post')
            
            if platform == 'linkedin':
                access_token = get_linkedin_token(session['username'])
                if not access_token:
                    flash('User not authenticated with LinkedIn.')
                    return redirect(url_for('settings'))
                try:
                    result = make_linkedin_post(access_token, generated_post)
                    flash('Post created successfully on LinkedIn!')
                except Exception as e:
                    flash(f"Error posting to LinkedIn: {str(e)}")
            elif platform == 'twitter':
                access_token = get_twitter_token(session['username'])
                access_token_secret = get_twitter_token_secret(session['username'])
                if not access_token or not access_token_secret:
                    flash('User not authenticated with Twitter.')
                    return redirect(url_for('settings'))
                try:
                    result = make_twitter_post(access_token, access_token_secret, generated_post)
                    flash('Post created successfully on Twitter!')
                except Exception as e:
                    flash(f"Error posting to Twitter: {str(e)}")
            
            return redirect(url_for('dashboard'))
    
    return render_template('make_post.html')


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
        callback_uri=TWITTER_REDIRECT_URI
    )
    fetch_response = oauth.fetch_request_token(TWITTER_REQUEST_TOKEN_URL)
    oauth_token = fetch_response['oauth_token']
    session['twitter_oauth_token'] = oauth_token
    auth_url = f"{TWITTER_AUTH_URL}?oauth_token={oauth_token}"
    return redirect(auth_url)

@app.route('/twitter_callback')
def twitter_callback():
    oauth_token = request.args.get('oauth_token')
    oauth_verifier = request.args.get('oauth_verifier')

    oauth = OAuth1Session(
        client_key=TWITTER_CONSUMER_KEY,
        client_secret=TWITTER_CONSUMER_SECRET,
        resource_owner_key=oauth_token,
        verifier=oauth_verifier
    )
    access_token_response = oauth.fetch_access_token(TWITTER_ACCESS_TOKEN_URL)

    auth_token = access_token_response['oauth_token']
    auth_token_secret = access_token_response['oauth_token_secret']
    session['twitter_token'] = auth_token
    session['twitter_token_secret'] = auth_token_secret
    save_twitter_token(session['username'], auth_token, auth_token_secret)
    return redirect('http://localhost:3000/settings')

@app.route('/remove_twitter')
def remove_twitter():
    user_id = request.args.get('user_id')
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

def make_twitter_post(token, token_secret, post):
    oauth = OAuth1Session(
        client_key=TWITTER_CONSUMER_KEY,
        client_secret=TWITTER_CONSUMER_SECRET,
        resource_owner_key=token,
        resource_owner_secret=token_secret
    )

    response = oauth.post(
        "https://api.twitter.com/2/tweets",
        json={"text": post}
    )

    if response.status_code == 201:
        return {"message": "Tweet successfully posted!"}
    else:
        raise Exception(f"Failed to post tweet: {response.text}")

#################################
# Preference Form Logic
#################################
@app.route("/submit", methods=["POST"])
def submit():
    data = request.json
    tone = data.get("tone")
    topic = data.get("topic")
    schedule = data.get("schedule")
    edit = data.get("edit")
    language = data.get("language")
    userid = data.get("userid")
    hashtags = data.get("customHashtags")
    print(userid)
    if not (tone and topic and schedule and edit and userid and language):
        return jsonify({"error": "Missing fields"}), 400
    data = generatePostText(tone,topic,language);
    ref = db.reference("Users").child(userid).child("UserPosts")
    postID = ref.push({
        "topic": topic,
        "tone": tone,
        #"data": data,
        "data": "placeholder", #keep placeholder data for now so as to not fill up the database too fast
        "schedule": schedule,
        "language": language,
        "edit": edit})
    postID =  postID.key
    
    # Save data to CSV
    file_exists = os.path.exists(CSV_FILE)


    with open(CSV_FILE, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        # Write header if file is new
        if not file_exists:
            writer.writerow(["Tone", "Topic", "Schedule", "Edit", "Generated_Post"])

        writer.writerow([tone, topic, schedule, edit, ""])
    base64_image = generatepostImage(tone,topic)
    return jsonify(
        {"message": f"{data}", "image": f"data:image/png;base64,{base64_image}", "postID": postID}), 200

#################################
# Post Generation Logic
#################################

def generatePostText(tone, topic, language):
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
    return response['message']['content'].split("</think>",1)[1]

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

@scheduler.task('interval', id='job_2', seconds=15)
def test_scheduler():
    print("This job runs every 15 seconds to show scheduling is working!")

@scheduler.task('cron', id='job_2', hour='*', minute='0')
def hourly_trigger():
    print("This job runs every hour!")
    users_ref = db.reference("Users")
    users = users_ref.get()
    # Iterate and print each user and their posts
    current_time = datetime.datetime.now()
    if users:
        for user_id, user_data in users.items():
            print(f"User ID: {user_id}")
            if "UserPosts" in user_data:
                for post_id, post_data in user_data["UserPosts"].items(): 
                    if "schedule" in post_data:
                        if post_data["schedule"] == "hourly":
                            print("Hourly post")
                            print(generatePostText(post_data["tone"], post_data["topic"], post_data["language"]))
                            generatepostImage(post_data["tone"], post_data["topic"])
                            print("image generated")
                        elif (post_data["schedule"] == "daily") and (current_time.hour == 0):
                            print("Daily post")
                            print(generatePostText(post_data["tone"], post_data["topic"], post_data["language"]))
                            generatepostImage(post_data["tone"], post_data["topic"])
                            print("image generated")
                        elif (post_data["schedule"] == "weekly") and (current_time.weekday() == 0) and (current_time.hour == 0):
                            print("Weekly post")
                            print(generatePostText(post_data["tone"], post_data["topic"], post_data["language"]))
                            generatepostImage(post_data["tone"], post_data["topic"])
                            print("image generated")
                        elif (post_data["schedule"] == "biweekly") and (current_time.weekday() == 0) and (current_time.hour == 0) and (current_time.day % 14 == 0):
                            print("Biweekly post")
                            print(generatePostText(post_data["tone"], post_data["topic"], post_data["language"]))
                            generatepostImage(post_data["tone"], post_data["topic"])
                            print("image generated")
                        elif (post_data["schedule"] == "monthly") and (current_time.day== 1) and (current_time.hour == 0):
                            print("Monthly post")
                            print(generatePostText(post_data["tone"], post_data["topic"], post_data["language"]))
                            generatepostImage(post_data["tone"], post_data["topic"])
                            print("image generated")
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
    make_linkedin_post(access_token, generated_post)
    return jsonify({"All good": "Good"}), 200

#################################
# Dashboard Logic
#################################
@app.route("/linkedin-analytics")
def get_analytics():
    dummy_data = [
        {"date": "2024-04-01", "impressions": 120, "clicks": 30},
        {"date": "2024-04-02", "impressions": 200, "clicks": 50},
        {"date": "2024-04-03", "impressions": 180, "clicks": 45},
        {"date": "2024-04-04", "impressions": 220, "clicks": 60},
    ]
    return jsonify(dummy_data)

# START OF DASHBOARD SCHEDLUING PLACEHOLDERS #
def pause_scheduling():
    return jsonify({"message": "Scheduling paused."}), 200
def cancel_scheduling():
    return jsonify({"message": "Scheduling cancelled."}), 200
def change_scheduling():
    return jsonify({"message": "Scheduling changed."}), 200
# END OF DASHBOARD SCHEDULING PLACEHOLDERS #






# Start the scheduler
scheduler.start()


if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=False)
