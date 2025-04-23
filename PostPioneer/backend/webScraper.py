import requests
from bs4 import BeautifulSoup

def scrape_data(topic):
    # Define headers to mimic a real browser request
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    }

    if topic == 'sports':
        url = 'https://www.bbc.com/sport'

        # Send the HTTP request
        response = requests.get(url, headers=headers)

        # Check if the request was successful
        if response.status_code != 200:
            return f"Failed to retrieve data. HTTP Status Code: {response.status_code}"

        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract sports headlines
        headlines = soup.find_all('h3')

        # Format extracted sports headlines
        formatted_news = ""
        for headline in headlines[:10]:  # Limit to 10 headlines
            formatted_news += f"{headline.get_text(strip=True)}\n\n"

        return formatted_news.strip()

    elif topic == 'news':
        url = 'https://www.bbc.com/news'

        # Send the HTTP request
        response = requests.get(url, headers=headers)

        # Check if the request was successful
        if response.status_code != 200:
            return f"Failed to retrieve data. HTTP Status Code: {response.status_code}"

        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract headlines and summaries
        news_items = []
        headlines = soup.find_all('h2', class_='sc-87075214-3 hxmZpj')
        summaries = soup.find_all('p', class_='sc-914f79f9-0 doqbJm')

        for headline, summary in zip(headlines, summaries):
            news_items.append({
                'headline': headline.get_text(strip=True),
                'summary': summary.get_text(strip=True)
            })

        # Format extracted news data
        formatted_news = ""
        for item in news_items:
            formatted_news += f"{item['headline']}\n{item['summary']}\n\n"

        return formatted_news.strip()
    
    elif topic == 'business':
        url = 'https://www.bbc.com/business'

        # Send the HTTP request
        response = requests.get(url, headers=headers)

        # Check if the request was successful
        if response.status_code != 200:
            return f"Failed to retrieve data. HTTP Status Code: {response.status_code}"

        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        business_items = []
        headlines = soup.find_all('h2', {'data-testid': 'card-headline'})
        paragraphs = soup.find_all('p')

        for headline, paragraph in zip(headlines[:10], paragraphs):
            business_items.append({
                'headline': headline.get_text(strip=True),
                'summary': paragraph.get_text(strip=True)
            })

        # Format extracted business data
        formatted_news = ""
        for item in business_items:
            formatted_news += f"{item['headline']}\n{item['summary']}\n\n"

        return formatted_news.strip()

    elif topic == 'arts':
        url = 'https://www.bbc.com/arts'

        # Send the HTTP request
        response = requests.get(url, headers=headers)

        # Check if the request was successful
        if response.status_code != 200:
            return f"Failed to retrieve data. HTTP Status Code: {response.status_code}"

        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        business_items = []
        headlines = soup.find_all('h2', {'data-testid': 'card-headline'})
        paragraphs = soup.find_all('p')

        for headline, paragraph in zip(headlines[:10], paragraphs):
            business_items.append({
                'headline': headline.get_text(strip=True),
                'summary': paragraph.get_text(strip=True)
            })

        # Format extracted business data
        formatted_news = ""
        for item in business_items:
            formatted_news += f"{item['headline']}\n{item['summary']}\n\n"

        return formatted_news.strip()
    
    elif topic == 'travel':
        url = 'https://www.bbc.com/travel'

        # Send the HTTP request
        response = requests.get(url, headers=headers)

        # Check if the request was successful
        if response.status_code != 200:
            return f"Failed to retrieve data. HTTP Status Code: {response.status_code}"

        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        business_items = []
        headlines = soup.find_all('h2', {'data-testid': 'card-headline'})
        paragraphs = soup.find_all('p')

        for headline, paragraph in zip(headlines[:10], paragraphs):
            business_items.append({
                'headline': headline.get_text(strip=True),
                'summary': paragraph.get_text(strip=True)
            })

        # Format extracted business data
        formatted_news = ""
        for item in business_items:
            formatted_news += f"{item['headline']}\n{item['summary']}\n\n"

        return formatted_news.strip()
    
    else:
        None

def generate_post_from_llm(prompt):
    # Placeholder function to generate a post from the LLM
    # Replace this with actual LLM API call
    return f"Generated post based on the prompt: {prompt}"

