import requests
from bs4 import BeautifulSoup

def get_bbc_headlines():
    url = "https://feeds.bbci.co.uk/news/rss.xml" #pulling from the rss feed for convenience
    headers = {"User-Agent": "Mozilla/5.0"}
    
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print("Failed to retrieve the webpage.")
        return []
    
    soup = BeautifulSoup(response.text, "html.parser")
    headlines = []
    
    for item in soup.find_all("title"):
        headline = item.get_text(strip=True)
        if headline and headline not in headlines:
            headlines.append(headline)
    
    return headlines

if __name__ == "__main__":
    bbc_headlines = get_bbc_headlines()
    for idx, headline in enumerate(bbc_headlines, start=1):
        print(f"{idx}. {headline}")