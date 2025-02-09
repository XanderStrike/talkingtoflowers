# Script to convert a tumblr blog export (a pile of html files) into a useful posts.json

import os
import json
from bs4 import BeautifulSoup
from dateutil import parser  # For flexible timestamp parsing

# Define the path to the folder containing the HTML files
html_folder = 'html/'

# Initialize an empty list to hold all the posts
posts = []

# Function to parse the timestamp string into a datetime object
def parse_timestamp(timestamp_str):
    # Use dateutil.parser to handle the timestamp format, including ordinal suffixes
    return parser.parse(timestamp_str)

# Loop through all the HTML files in the folder
for filename in os.listdir(html_folder):
    if filename.endswith('.html'):
        # Construct the full file path
        file_path = os.path.join(html_folder, filename)
        
        # Open and parse the HTML file
        with open(file_path, 'r', encoding='utf-8') as file:
            soup = BeautifulSoup(file, 'html.parser')
            
            # Extract the image source
            img_tag = soup.find('img')
            img_src = img_tag['src'] if img_tag else None
            
            # Extract the timestamp
            timestamp_span = soup.find('span', id='timestamp')
            timestamp_str = timestamp_span.text if timestamp_span else None
            timestamp = parse_timestamp(timestamp_str) if timestamp_str else None
            
            # Initialize a dictionary to hold span data
            span_data = {}
            
            # Extract all spans and group them by class
            for span in soup.find_all('span'):
                if 'id' not in span.attrs or span['id'] != 'timestamp':  # Skip the timestamp span
                    span_classes = span.get('class', [])
                    if span_classes:  # Only process spans with classes
                        for span_class in span_classes:
                            if span_class not in span_data:
                                span_data[span_class] = []
                            span_data[span_class].append(span.text.strip())
            
            # Extract the caption div's HTML content
            caption_div = soup.find('div', class_='caption')
            caption = str(caption_div) if caption_div else None
            
            # Create a dictionary for the post
            post = {
                'image_src': img_src,
                'timestamp': timestamp_str,  # Keep the original timestamp string for JSON output
                'timestamp_parsed': timestamp.isoformat() if timestamp else None,  # Add parsed timestamp for sorting
                **span_data,  # Unpack the span data into the post dictionary
                'caption': caption
            }
            
            # Add the post to the list of posts
            posts.append(post)

# Sort the posts by the parsed timestamp
posts.sort(key=lambda x: parser.isoparse(x['timestamp_parsed']) if x['timestamp_parsed'] else datetime.min)

# Remove the parsed timestamp from the final JSON output (optional)
for post in posts:
    post.pop('timestamp_parsed', None)

# Convert the list of posts to a JSON object
json_output = json.dumps(posts, indent=4)

# Write the JSON object to a file
with open('posts.json', 'w', encoding='utf-8') as json_file:
    json_file.write(json_output)

print("JSON file has been created successfully.")