import firebase_admin
import json
from flask import Flask, render_template, request, redirect
from requests_oauthlib import OAuth1Session
from firebase_admin import credentials,db,auth

app = Flask(__name__)
app.secret_key = '2Qo10WC9WZQmFxvOAHxuJtkkS7NbYVWGQlb0qtO2oPcBFyCZ0y'
CONSUMER_KEY = 'mro9ar4cp1p6HdQKTxcDwVlxI'
CONSUMER_SECRET = 'd0foSxJ7ozzWJtS4BqZIeQ4ttZGJx4lYxrHtq2S5Q3qM5NjoF3'
CLIENT_ID = 'VXYwMmU2S2ZET0xxZzdEUVVVbWk6MTpjaQ'
CLIENT_SECRET = 'FOeOYwSPu7yjWiHg0aM276UAbuC2AfmQ6wHyfzjEohPIQFGFb5'
REDIRECT_URI = 'http://localhost:5000/oauth/callback'
MAIN_PAGE_URL = 'http://localhost:5000'
URL = 'https://api.x.com/'
AUTH_URL = 'https://api.x.com/oauth/authenticate'

default_app = firebase_admin.initialize_app(cred,{'databaseURL':'https://postpioneer-e82d3-default-rtdb.firebaseio.com/' })

@app.route('/')
def index():
    return "Login to X <a href='/oauth/request_token'>Login with X API<a>"


@app.route('/oauth/request_token')
def request_token():

    oauth = OAuth1Session(
        client_key=CONSUMER_KEY,
        client_secret=CONSUMER_SECRET,
        callback_uri=REDIRECT_URI
    )
    fetch_response = oauth.fetch_request_token("https://api.x.com/oauth/request_token")
    oauth_token = fetch_response['oauth_token']
    "if r.status_code != 200:"
    auth_url = f"{AUTH_URL}?oauth_token={oauth_token}"
    return redirect(auth_url)


@app.route('/oauth/callback')
def callBack_page():
    oauth_token = request.args.get('oauth_token')
    oauth_token_secret = request.args.get('oauth_token_secret')
    oauth_verifier = request.args.get('oauth_verifier')

    oauth = OAuth1Session(
        client_key=CONSUMER_KEY,
        client_secret=CONSUMER_SECRET,
        resource_owner_key=oauth_token,
        resource_owner_secret=oauth_token_secret
        )
    access_token_response = oauth.fetch_access_token("https://api.x.com/oauth/access_token",
    verifier=oauth_verifier)

    auth_token = access_token_response['oauth_token']
    auth_token_secret = access_token_response['oauth_token_secret']

    cred = credentials.Certificate("/Users/karanarora/Desktop/Brock COSC Courses/4P02/Scrum96/postpioneer-e82d3-firebase-adminsdk-fbsvc-98eebf34ad.json")

    

    ref = db.reference("Users").child("userid").child("UserTokens")
    ref.push({
        "xToken": auth_token,
        "xTokenSecret": auth_token_secret
    })

    return REDIRECT_URI

@app.route('/2/tweets', methods=["GET", 'POST'])
def get_tweet():

    if request.method == "POST":
        tweet = request.form['tweet']
        
        

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
            return "Successfuly Tweeted"
        else:
            return f"Post failed: {response.text}"
    
    return '''
        <form method="post">
            Tweet: <input type="text" name="tweet">
            <input type="submit" value="Submit">
        </form>
    '''

if __name__ == '__main__':
    app.run()