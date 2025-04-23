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

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your_default_secret_key')  # Set a default secret key if not provided in .env
load_dotenv()

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

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/how_it_works')
def how_it_works():
    return render_template('how_it_works.html')

@app.route('/sample_posts')
def sample_posts():
    return render_template('sample_posts.html')

@app.route('/user_login', methods=['GET', 'POST'])
def user_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        # Verify the user's credentials
        with open('users.csv', mode='r', newline='') as file:
            reader = csv.reader(file)
            for row in reader:
                if row[0] == username and row[1] == password:
                    session['username'] = username
                    session['linkedin_token'] = row[2] if len(row) > 2 else None
                    session['twitter_token'] = row[3] if len(row) > 3 else None
                    session['twitter_token_secret'] = row[4] if len(row) > 4 else None
                    return redirect(url_for('settings'))
            flash('Invalid username or password. Please try again.')
            return redirect(url_for('user_login'))
    return render_template('user_login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        # Check if the username already exists
        with open('users.csv', mode='r', newline='') as file:
            reader = csv.reader(file)
            for row in reader:
                if row[0] == username:
                    flash('Username already exists. Please choose a different username.')
                    return redirect(url_for('register'))
        # Save the new user
        with open('users.csv', mode='a', newline='') as file:
            writer = csv.writer(file)
            writer.writerow([username, password, '', '', ''])
        return redirect(url_for('register_success'))
    return render_template('register.html')

@app.route('/register_success')
def register_success():
    return render_template('register_success.html')

@app.route('/dashboard')
def dashboard():
    if 'username' not in session:
        return redirect(url_for('user_login'))
    # Placeholder functions to fetch user-specific data
    recent_posts = fetch_user_posts(session['username'])
    user_stats = fetch_user_stats(session['username'])
    return render_template('dashboard.html', recent_posts=recent_posts, user_stats=user_stats)

@app.route('/settings', methods=['GET', 'POST'])
def settings():
    if 'username' not in session:
        return redirect(url_for('user_login'))
    if request.method == 'POST':
        if 'connect_linkedin' in request.form:
            return redirect(url_for('linkedin_login'))
        elif 'remove_linkedin' in request.form:
            remove_linkedin_token(session['username'])
            session['linkedin_token'] = None
            flash('LinkedIn token removed successfully.')
            return redirect(url_for('settings'))
        elif 'connect_twitter' in request.form:
            return redirect(url_for('twitter_login'))
        elif 'remove_twitter' in request.form:
            remove_twitter_token(session['username'])
            session['twitter_token'] = None
            session['twitter_token_secret'] = None
            flash('Twitter token removed successfully.')
            return redirect(url_for('settings'))
    linkedin_token = get_linkedin_token(session['username'])
    linkedin_connected = linkedin_token is not None
    twitter_token = get_twitter_token(session['username'])
    twitter_connected = twitter_token is not None
    return render_template('settings.html', linkedin_connected=linkedin_connected, twitter_connected=twitter_connected)

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

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.')
    return redirect(url_for('index'))

#################################
# LinkedIn OAuth & API Routes
#################################
@app.route('/linkedin_login')
def linkedin_login():
    state = generate_state()
    session['linkedin_oauth_state'] = state
    params = {
        'response_type': 'code',
        'client_id': LINKEDIN_CLIENT_ID,
        'redirect_uri': LINKEDIN_REDIRECT_URI,
        'state': state,
        'scope': LINKEDIN_SCOPE
    }
    auth_request = requests.Request('GET', LINKEDIN_AUTH_URL, params=params).prepare()
    return redirect(auth_request.url)

@app.route('/linkedin_callback')
def linkedin_callback():
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

    return redirect(url_for('settings'))

#################################
# Twitter OAuth & API Routes
#################################
@app.route('/twitter_login')
def twitter_login():
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

    return redirect(url_for('settings'))

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

def remove_linkedin_token(username):
    # Remove the LinkedIn token for the user
    users = []
    with open('users.csv', mode='r', newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            if row[0] == username:
                row[2] = ''
            users.append(row)
    with open('users.csv', mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(users)

def get_linkedin_token(username):
    # Retrieve the LinkedIn token for the user
    with open('users.csv', mode='r', newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            if row[0] == username:
                return row[2] if len(row) > 2 and row[2] else None
    return None

def save_twitter_token(username, token, token_secret):
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

def get_twitter_token(username):
    # Retrieve the Twitter token for the user
    with open('users.csv', mode='r', newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            if row[0] == username:
                return row[3] if len(row) > 3 and row[3] else None
    return None

def get_twitter_token_secret(username):
    # Retrieve the Twitter token secret for the user
    with open('users.csv', mode='r', newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            if row[0] == username:
                return row[4] if len(row) > 4 and row[4] else None
    return None

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