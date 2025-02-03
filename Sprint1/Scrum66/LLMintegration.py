import pandas as pd
import os
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

# Define the CSV file
csv_file = "responses.csv"

# Function to read the last entry using pandas
def get_last_response():
    try:
        df = pd.read_csv(csv_file)
        if df.empty:
            print("CSV file is empty.")
            return None
        last_row = df.iloc[-1]  # Get the last row
        return last_row["Tone"], last_row["Topic"], last_row["Schedule"]
    except FileNotFoundError:
        print("CSV file not found.")
        return None
    except KeyError:
        print("CSV file does not contain the required columns.")
        return None

# Function to generate text using OpenAI's LLM
def generate_text(tone, topic, schedule):
    prompt = f"Write a {tone} email about {topic} with a schedule of {schedule}."

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",  # Changed to gpt-3.5-turbo
            messages=[{"role": "system", "content": "You are a helpful assistant."},
                      {"role": "user", "content": prompt}]
        )
        return response["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"Error generating text: {e}")
        return None

# Main function
if __name__ == "__main__":
    last_response = get_last_response()
    if last_response:
        tone, topic, schedule = last_response
        generated_text = generate_text(tone, topic, schedule)

        if generated_text:
            print("\n🔹 AI-Generated Response:\n")
            print(generated_text)
