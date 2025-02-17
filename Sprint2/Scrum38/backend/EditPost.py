from flask import Flask, render_template, request, jsonify
import csv

app = Flask(__name__)

# Function to read CSV data
def read_csv():
    posts = []
    with open('responses.csv', 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            posts.append(row)
    return posts

# Function to save updated CSV data
def save_csv(posts):
    fieldnames = ['Tone', 'Topic', 'Schedule', 'Edit', 'Generated_Post']
    with open('responses.csv', 'w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(posts)

@app.route('/')
def index():
    posts = read_csv()
    return render_template('index.html', posts=posts)

@app.route('/edit', methods=['POST'])
def edit_post():
    new_post = request.form['post']
    index = int(request.form['index'])  # Get the row index from the request
    posts = read_csv()

    if posts[index]['Edit'].lower() == 'true':  # Ensure editing is allowed
        posts[index]['Generated_Post'] = new_post
        save_csv(posts)
        return jsonify({'status': 'success', 'post': new_post})
    else:
        return jsonify({'status': 'error', 'message': 'Editing not allowed'}), 403

if __name__ == "__main__":
    app.run(debug=True)
