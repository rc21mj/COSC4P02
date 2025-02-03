import csv
import sys

# Ensure we have the correct number of arguments
if len(sys.argv) != 4:
    print("Usage: python save.py <tone> <topic> <schedule>")
    sys.exit(1)

# Get form values from command-line arguments
tone = sys.argv[1]
topic = sys.argv[2]
schedule = sys.argv[3]

# Define CSV file path
csv_file = "responses.csv"

# Append data to CSV file
with open(csv_file, mode="a", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    
    # Write header if the file is empty
    if file.tell() == 0:
        writer.writerow(["Tone", "Topic", "Schedule"])
    
    # Write the response data
    writer.writerow([tone, topic, schedule])

print(f"Data saved: {tone}, {topic}, {schedule}")
