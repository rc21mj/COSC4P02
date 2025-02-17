import os
import random
import string
import hashlib
import base64
import requests
from flask import Flask, redirect, request, session, url_for, render_template, jsonify
from dotenv import load_dotenv

# Load environment variables from the .env file.
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY')

###############################
# LinkedIn OAuth Configuration
###############################
LINKEDIN_CLIENT_ID = os.getenv('LINKEDIN_CLIENT_ID')
LINKEDIN_CLIENT_SECRET = os.getenv('LINKEDIN_CLIENT_SECRET')
LINKEDIN_REDIRECT_URI = os.getenv('LINKEDIN_REDIRECT_URI')
LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_SCOPE = "openid profile email w_member_social"

from linkedinAPI import get_linkedin_user_data, make_linkedin_post


#################################
# Helper Functions
#################################
def generate_state(length=16):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def generate_code_verifier(length=64):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def generate_code_challenge(verifier):
    digest = hashlib.sha256(verifier.encode('utf-8')).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b'=').decode('utf-8')
    return challenge

ALLOWED_PLATFORMS = ["twitter", "linkedin"]
ALLOWED_TONES = ["relaxed", "professional", "funny", "serious"]

def get_default_tone(platform):
    """
    Returns the default tone based on the platform:
      - Twitter: 'relaxed'
      - LinkedIn: 'professional'
    """
    if platform.lower() == "twitter":
        return "relaxed"
    elif platform.lower() == "linkedin":
        return "professional"
    else:
        raise ValueError(f"Unsupported platform: {platform}. Allowed platforms are: {ALLOWED_PLATFORMS}")

def generate_prompt(platform, information, tone=None):
    """
    Generates a prompt string to feed into an LLM with the following format:
      "Make a post catered to <platform>, with a <tone> tone, about <information>"
    """
    platform = platform.lower()
    if platform not in ALLOWED_PLATFORMS:
        raise ValueError(f"Unsupported platform: {platform}. Allowed platforms are: {ALLOWED_PLATFORMS}")

    # Use the default tone if none is provided.
    if tone is None:
        tone = get_default_tone(platform)
    else:
        tone = tone.lower()
        if tone not in ALLOWED_TONES:
            raise ValueError(f"Invalid tone: {tone}. Allowed tones are: {ALLOWED_TONES}")

    prompt = f"Make a post catered to {platform.capitalize()}, with a {tone} tone, about {information}"
    return prompt


def call_chatgpt(prompt):

    return "Something about: " + prompt

#################################
# Routes
#################################
@app.route('/')
def index():
    return render_template('index.html')

#################################
# LinkedIn OAuth & API Routes
#################################
@app.route('/login')
def login():
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

@app.route('/callback')
def callback():
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
    session['linkedin_access_token'] = access_token

    return """
    <!DOCTYPE html>
    <html>
      <head>
        <title>LinkedIn OAuth Successful</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 50px auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          a { text-decoration: none; color: #0073b1; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>LinkedIn OAuth Successful</h1>
          <p>Your access token has been saved. You can now make posts.</p>
          <p><a href="/">Back to Home</a></p>
        </div>
      </body>
    </html>
    """
#################################
# Prompt Generation Endpoint
#################################
@app.route('/generate_prompt', methods=['POST'])
def prompt_endpoint():
    data = request.get_json()
    platform = data.get("platform")
    tone = data.get("tone")
    information = data.get("information")
    try:
        prompt = generate_prompt(platform, information, tone)
        return jsonify({"prompt": prompt})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

#################################
# ChatGPT Post Generation Endpoint
#################################
@app.route('/generate_chatgpt_post', methods=['POST'])
def generate_chatgpt_post():
    data = request.get_json()
    prompt = data.get("prompt")
    if not prompt:
        return jsonify({"error": "Missing prompt."}), 400
    try:
        final_post = call_chatgpt(prompt)
        return jsonify({"final_post": final_post})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#################################
# Make Post Endpoint
#################################
@app.route('/make_post', methods=['POST'])
def make_post():
    access_token = session.get('linkedin_access_token')
    if not access_token:
        return jsonify({"error": "User not authenticated."}), 403
    text = request.form.get('text') or (request.json or {}).get('text')
    if not text:
        return jsonify({"error": "Missing post text."}), 400
    try:
        result = make_linkedin_post(access_token, text)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#if __name__ == '__main__':
#    app.run(debug=True)
