import firebase_admin
import json
from flask import Flask, render_template, request, redirect, jsonify
from requests_oauthlib import OAuth1Session
from firebase_admin import credentials, db, auth
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('app.secret_key')
CONSUMER_KEY = os.getenv('CONSUMER_KEY')
CONSUMER_SECRET = os.getenv('CONSUMER_SECRET')
CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
REDIRECT_URI = 'http://localhost:5000/oauth/callback'
MAIN_PAGE_URL = 'http://localhost:5000'
URL = 'https://api.x.com/'
AUTH_URL = 'https://api.x.com/oauth/authenticate'

cred = credentials.Certificate("/Users/karanarora/Desktop/4P02 Project/postpioneer-e82d3-firebase-adminsdk-fbsvc-98eebf34ad.json")
default_app = firebase_admin.initialize_app(cred, {'databaseURL': 'https://postpioneer-e82d3-default-rtdb.firebaseio.com/'})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/oauth/request_token')
def request_token():
    oauth = OAuth1Session(
        client_key=CONSUMER_KEY,
        client_secret=CONSUMER_SECRET,
        callback_uri=REDIRECT_URI
    )
    fetch_response = oauth.fetch_request_token("https://api.x.com/oauth/request_token")
    oauth_token = fetch_response['oauth_token']
    auth_url = f"{AUTH_URL}?oauth_token={oauth_token}"
    return redirect(auth_url)

@app.route('/oauth/callback')
def callBack_page():
    oauth_token = request.args.get('oauth_token')
    oauth_verifier = request.args.get('oauth_verifier')

    oauth = OAuth1Session(
        client_key=CONSUMER_KEY,
        client_secret=CONSUMER_SECRET,
        resource_owner_key=oauth_token,
        verifier=oauth_verifier
    )
    access_token_response = oauth.fetch_access_token("https://api.x.com/oauth/access_token")

    auth_token = access_token_response['oauth_token']
    auth_token_secret = access_token_response['oauth_token_secret']

    save_twitter_token('userid', auth_token, auth_token_secret)

    return redirect('/postPage')

@app.route('/postPage')
def postPage():
    return render_template('posting.html')

@app.route('/SocialMediaLoginPage')
def social_media_login_page():
    return render_template('SocialMediaLoginPage.html')

@app.route('/ProPage')
def pro_page():
    return render_template('Pro~Page.html')

def save_twitter_token(username, token, token_secret):
    db.reference("Users").child(username).child("Credentials").update({'TwitterToken' : token,
                                                                       'TwitterTokenSecret' : token_secret})

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
        client_key=CONSUMER_KEY,
        client_secret=CONSUMER_SECRET,
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
    

@app.route('/2/tweets', methods=["GET"])
def get_User_Engadgment():
    # Retrieve the OAuth tokens from the database
    auth_token, auth_token_secret = getOauthToken()
    oauth = OAuth1Session(
        client_key=CONSUMER_KEY,
        client_secret=CONSUMER_SECRET,
        resource_owner_key=auth_token,
        resource_owner_secret=auth_token_secret
    )

    response = oauth.get(
        "https://api.x.com/2/users/me/mentions"
    )

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"message": f"Failed to retrieve mentions: {response.text}"}), response.status_code

def get_userName():
    auth_token, auth_token_secret = getOauthToken()
    oauth = OAuth1Session(
        client_key=CONSUMER_KEY,
        client_secret=CONSUMER_SECRET,
        resource_owner_key=auth_token,
        resource_owner_secret=auth_token_secret
    )
    url = f"https://api.x.com/2/users/me"
    params = {
        'user.fields': 'username' }
    response = request.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        username = data.get('data', {}).get('username')
        return username
    else:
        return None  

def get_user_id():

    username = get_userName()

    auth_token, auth_token_secret = getOauthToken()

    url = f"https://api.x.com/2/users/by/username/{username}"
    oauth = OAuth1Session(
        client_key=CONSUMER_KEY,
        client_secret=CONSUMER_SECRET,
        resource_owner_key=auth_token,
        resource_owner_secret=auth_token_secret
    )
    response = request.get(url, auth=oauth)
    response = response.get("data", {}).get("id")
    return response

def getOauthToken():
    ref = db.reference("Users").child("userid").child("UserTokens")
    tokens = ref.order_by_key().limit_to_last(1).get()
    for key, value in tokens.items():
        auth_token = value['xToken']
        auth_token_secret = value['xTokenSecret']
    return auth_token, auth_token_secret

def fetch_user_Tweets(days: int = 7):
    auth_token, auth_token_secret = getOauthToken()
    oauth = OAuth1Session(
        client_key=CONSUMER_KEY,
        client_secret=CONSUMER_SECRET,
        resource_owner_key=auth_token,
        resource_owner_secret=auth_token_secret
    )

    end = datetime.utcnow()
    start = end - timedelta(days=days)

    user_id = get_user_id()
    url = f"https://api.x.com/2/users/{user_id}/tweets"

    params = {
        'start_time': start.isoformat() + 'Z',
        'end_time': end.isoformat() + 'Z',
        'max_results': 100,
        'tweet.fields': 'created_at,public_metrics,non_public_metrics'
    }
    response = request.get(url, auth=oauth,params=params)
    if response.status_code == 200:
        data = response.json()
        tweets = data.get('data', [])
        return tweets
    else:
        print(f"Error fetching tweets: {response.status_code} - {response.text}")
        return []

def getEngadgentRate(days: int = 7):
    auth_token, auth_token_secret = getOauthToken()
    oauth = OAuth1Session(
        client_key=CONSUMER_KEY,
        client_secret=CONSUMER_SECRET,
        resource_owner_key=auth_token,
        resource_owner_secret=auth_token_secret
    )

    tweets = fetch_user_Tweets(days)
    total_eng, total_imp = 0, 0
    for t in tweets:
        pm  = t["public_metrics"]
        npm = t.get("non_public_metrics", {})
        engagements = (
            pm.get("like_count", 0)
          + pm.get("retweet_count", 0)
          + pm.get("reply_count", 0)
          + pm.get("quote_count", 0)
        )
        impressions = npm.get("impression_count", 0)
        total_eng += engagements
        total_imp += impressions

    if total_imp == 0:
        return 0.0
    return (total_eng / total_imp) * 100

if __name__ == '__main__':
    app.run(debug=True)