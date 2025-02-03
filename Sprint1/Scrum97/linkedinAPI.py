import requests

def get_linkedin_user_data(access_token):
    """
    Retrieve the current LinkedIn user's data.
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get("https://api.linkedin.com/v2/me", headers=headers)
    response.raise_for_status()  # Raise an error if the call fails
    return response.json()

def make_linkedin_post(access_token, text):
    """
    Posts a simple text update on behalf of the user.
    """
    # Retrieve user data to build the author URN
    user_data = get_linkedin_user_data(access_token)
    person_urn = f"urn:li:person:{user_data['id']}"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    post_data = {
        "author": person_urn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }
    response = requests.post("https://api.linkedin.com/v2/ugcPosts",
                             headers=headers, json=post_data)
    response.raise_for_status()
    return response.json()
