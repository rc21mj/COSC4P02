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
    # Using /v2/userinfo endpoint to get the "sub" field
    response = requests.get("https://api.linkedin.com/v2/userinfo", headers=headers)
    if response.status_code != 200:
        print("Status Code:", response.status_code)
        print("Response Headers:", response.headers)
        print("Response Body:", response.text)
    response.raise_for_status()
    return response.json()

def upload_linkedin_image(access_token, image_path):
    """
    Registers and uploads an image to LinkedIn.
    Returns the asset URN which will be referenced in the post.
    """
    user_data = get_linkedin_user_data(access_token)
    user_id = user_data.get('sub') or user_data.get('id')
    if not user_id:
        raise ValueError("User ID not found in LinkedIn user data.")
    person_urn = f"urn:li:person:{user_id}"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
    }
    
    # Step 1: Register the image upload
    register_payload = {
        "registerUploadRequest": {
            "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
            "owner": person_urn,
            "serviceRelationships": [
                {
                    "relationshipType": "OWNER",
                    "identifier": "urn:li:userGeneratedContent"
                }
            ]
        }
    }
    
    reg_response = requests.post("https://api.linkedin.com/v2/assets?action=registerUpload", 
                                 headers=headers, json=register_payload)
    reg_response.raise_for_status()
    reg_data = reg_response.json()
    
    asset = reg_data.get("value", {}).get("asset")
    upload_url = reg_data.get("value", {}).get("uploadMechanism", {}) \
                    .get("com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest", {}) \
                    .get("uploadUrl")
    
    if not asset or not upload_url:
        raise Exception("Failed to register image upload")
    
    # Step 2: Upload the image file
    with open(image_path, 'rb') as f:
        image_data = f.read()
        
    upload_headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/octet-stream"
    }
    
    upload_response = requests.put(upload_url, data=image_data, headers=upload_headers)
    upload_response.raise_for_status()
    
    return asset

def make_linkedin_post(access_token, text, image_path=None):
    """
    Creates a LinkedIn post with optional image.
    If image_path is provided, the image is uploaded and included in the post.
    """
    user_data = get_linkedin_user_data(access_token)
    user_id = user_data.get('sub') or user_data.get('id')
    if not user_id:
        raise ValueError("User ID not found in LinkedIn user data.")
    person_urn = f"urn:li:person:{user_id}"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
    }
    
    if image_path:
        # Upload image and get the asset URN
        asset = upload_linkedin_image(access_token, image_path)
        media_category = "IMAGE"
        media_content = [{
            "status": "READY",
            "description": {
                "text": "Optional image description"  # Customize if needed
            },
            "media": asset,
            "title": {
                "text": "Optional title"  # Customize if needed
            }
        }]
    else:
        media_category = "NONE"
        media_content = None
    
    # Build payload for the post
    post_payload = {
        "author": person_urn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": text
                },
                "shareMediaCategory": media_category
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }
    
    # If an image was uploaded, include the media content details
    if media_content:
        post_payload["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = media_content
    
    response = requests.post("https://api.linkedin.com/v2/ugcPosts", headers=headers, json=post_payload)
    response.raise_for_status()
    
    if response.content:
        return response.json()
    else:
        return {"id": response.headers.get("x-restli-id")}
