from flask import Flask, request, jsonify
from flask_cors import CORS
import csv
import os

app = Flask(__name__)
CORS(app)  # Allow requests from React frontend

CSV_FILE = "responses.csv"

@app.route("/submit", methods=["POST"])
def submit():
    data = request.json
    tone = data.get("tone")
    topic = data.get("topic")
    schedule = data.get("schedule")

    if not (tone and topic and schedule):
        return jsonify({"error": "Missing fields"}), 400

    # Save data to CSV
    file_exists = os.path.exists(CSV_FILE)

    with open(CSV_FILE, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        # Write header if file is new
        if not file_exists:
            writer.writerow(["Tone", "Topic", "Schedule"])

        writer.writerow([tone, topic, schedule])

    return jsonify({"message": f"Saved: Tone={tone}, Topic={topic}, Schedule={schedule}"}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)  # Run Flask on port 5000
