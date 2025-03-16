import os
import random
import string
import hashlib
import base64
import requests
import csv
from flask import Flask, redirect, request, session, url_for, render_template, jsonify, flash
from dotenv import load_dotenv
from linkedinAPI import make_linkedin_post, generate_state
from webScraper import scrape_data, generate_post_from_llm
from requests_oauthlib import OAuth1Session
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from firebase_admin import auth
app = Flask(__name__)
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

#################################
# LinkedIn OAuth & API Routes
#################################
@app.route('/linkedin_login')
def linkedin_login():
    state = generate_state()
    session['linkedin_oauth_state'] = state
    user_id = request.args.get('user_id')
    if user_id:
        session['username'] = user_id
    params = {
        'response_type': 'code',
        'client_id': LINKEDIN_CLIENT_ID,
        'redirect_uri': LINKEDIN_REDIRECT_URI,
        'state': state,
        'scope': LINKEDIN_SCOPE
    }
    auth_request = requests.Request('GET', LINKEDIN_AUTH_URL, params=params).prepare()
    print(user_id)
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
    """
    users = []
    with open('users.csv', mode='r', newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            if row[0] == username:
                row[2] = token
            users.append(row)
    with open('users.csv', mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(users)
    """
    
def remove_linkedin_token(username):
    # Remove the LinkedIn token for the user
    db.reference("Users").child(username).child("Credentials").update({'LinkedIn': None})
    """
    users = []
    with open('users.csv', mode='r', newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            if row[0] == username:
                row[2] = ''
            users.append(row)
    with open('users.csv', mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(users)"
    """

def get_linkedin_token(username):
    # Retrieve the LinkedIn token for the user
    """
    with open('users.csv', mode='r', newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            if row[0] == username:
                return row[2] if len(row) > 2 and row[2] else None"
    """
    return db.reference("Users").child(username).child("Credentials").child('LinkedIn').get()

def save_twitter_token(username, token, token_secret):
    db.reference("Users").child(username).child("Credentials").update({'TwitterToken' : token,
                                                                       'TwitterTokenSecret' : token_secret})
    # Save the Twitter token for the user
    users = []
    with open('users.csv', mode='r', newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            if row[0] == username:
                row[3] = token
                row[4] = token_secret
            users.append(row)
    with open('users.csv', mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(users)

def remove_twitter_token(username):
    # Remove the Twitter token for the user
    db.reference("Users").child(username).child("Credentials").update({'TwitterToken' : None,
                                                                       'TwitterTokenSecret' : None})
    """
    users = []
    with open('users.csv', mode='r', newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            if row[0] == username:
                row[3] = ''
                row[4] = ''
            users.append(row)
    with open('users.csv', mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(users)
    """

def get_twitter_token(username):
    # Retrieve the Twitter token for the user
    """
    with open('users.csv', mode='r', newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            if row[0] == username:
                return row[3] if len(row) > 3 and row[3] else None
    """
    return db.reference("Users").child(username).child("Credentials").child('TwitterToken').get()

def get_twitter_token_secret(username):
    # Retrieve the Twitter token secret for the user
    """
    with open('users.csv', mode='r', newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            if row[0] == username:
                return row[4] if len(row) > 4 and row[4] else None
    """
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

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)