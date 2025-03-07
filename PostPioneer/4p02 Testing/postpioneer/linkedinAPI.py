import requests
import random
import string
import csv
def generate_state(length=16):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def get_linkedin_user_data(access_token):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "X-Restli-Protocol-Version": "2.0.0"
    }
    # Use the /v2/userinfo endpoint which returns the "sub" field
    response = requests.get("https://api.linkedin.com/v2/userinfo", headers=headers)

    if response.status_code != 200:
        print("Status Code:", response.status_code)
        print("Response Headers:", response.headers)
        print("Response Body:", response.text)
    response.raise_for_status()
    return response.json()


def make_linkedin_post(access_token, text):
    """
    Creates a simple text update using LinkedIn's UGC Posts API.
    """
    # Retrieve user data to build the author URN
    user_data = get_linkedin_user_data(access_token)
    # Try to use the "sub" field (from /v2/userinfo) if available; fall back to "id" (from /v2/me)
    user_id = user_data.get('sub') or user_data.get('id')
    if not user_id:
        raise ValueError("User ID not found in LinkedIn user data.")
    person_urn = f"urn:li:person:{user_id}"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
    }

    # Build payload according to the UGC Posts API format.
    post_data = {
        "author": person_urn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": text
                },
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }

    response = requests.post("https://api.linkedin.com/v2/ugcPosts", headers=headers, json=post_data)
    response.raise_for_status()

    if response.content:
        return response.json()
    else:
        return {"id": response.headers.get("x-restli-id")}

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

