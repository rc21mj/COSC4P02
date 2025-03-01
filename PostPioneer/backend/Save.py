from flask import Flask, request, jsonify
from flask_cors import CORS
import csv
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from firebase_admin import auth
from ollama import chat
from ollama import ChatResponse

app = Flask(__name__)
CORS(app)  # Allow requests from React frontend

CSV_FILE = "responses.csv"
cred = credentials.Certificate("credentials.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://postpioneer-e82d3-default-rtdb.firebaseio.com/'
    })
@app.route("/submit", methods=["POST"])
def submit():
    data = request.json
    tone = data.get("tone")
    topic = data.get("topic")
    schedule = data.get("schedule")
    edit = data.get("edit")
    language = data.get("language")
    userid = data.get("userid")
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
    # Save data to CSV
    file_exists = os.path.exists(CSV_FILE)


    with open(CSV_FILE, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        # Write header if file is new
        if not file_exists:
            writer.writerow(["Tone", "Topic", "Schedule", "Edit", "Generated_Post"])

        writer.writerow([tone, topic, schedule, edit, ""])
    return jsonify({"message": f"Saved: Tone={tone}, Topic={topic}, Schedule={schedule}, Edit={edit}, Language={language}, Data={data},"}), 200
def generatePostText(tone, topic, language):
    initial_prompt = f"Write a {tone} social media post about {topic} in the {language} language. It must be in {language}."
    print("Post Pioneer Deepseek Test")
    model = "deepseek-r1:1.5b"
    messages = [{"role": "system", "content": initial_prompt}];
    response= chat(model=model, messages=messages)
    messages.append({"role": "assistant", "content": response['message']['content']})
    print(response['message']['content'])
    return response['message']['content'].split("</think>",1)[1]
if __name__ == "__main__":
    app.run(debug=True, port=3000)  # Run Flask on port 3000
