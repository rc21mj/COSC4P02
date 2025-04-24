import pytest
from unittest.mock import patch, MagicMock
import sys, os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from webScraper import scrape_data 

# Mock HTML content for each topic
mock_html_sports = """
<html>
    <body>
        <h3>Sports Headline 1</h3>
        <h3>Sports Headline 2</h3>
        <h3>Sports Headline 3</h3>
        <h3>Sports Headline 4</h3>
        <h3>Sports Headline 5</h3>
    </body>
</html>
"""

mock_html_news = """
<html>
    <body>
        <h2 class="sc-87075214-3 hxmZpj">News Headline 1</h2>
        <p class="sc-914f79f9-0 doqbJm">News Summary 1</p>
        <h2 class="sc-87075214-3 hxmZpj">News Headline 2</h2>
        <p class="sc-914f79f9-0 doqbJm">News Summary 2</p>
    </body>
</html>
"""

mock_html_business = """
<html>
    <body>
        <h2 data-testid="card-headline">Business Headline 1</h2>
        <p>Business Summary 1</p>
        <h2 data-testid="card-headline">Business Headline 2</h2>
        <p>Business Summary 2</p>
    </body>
</html>
"""

# Mocking the failed response
def mock_failed_request(*args, **kwargs):
    mock_response = MagicMock()
    mock_response.status_code = 404
    return mock_response

# Test for `scrape_data` with topic 'sports'
@patch('requests.get')
def test_scrape_sports(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.content = mock_html_sports
    
    result = scrape_data('sports')
    
    assert "Sports Headline 1" in result
    assert "Sports Headline 5" in result
    assert len(result.split("\n\n")) == 5  # There should be 5 headlines

# Test for `scrape_data` with topic 'news'
@patch('requests.get')
def test_scrape_news(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.content = mock_html_news
    
    result = scrape_data('news')
    
    assert "News Headline 1" in result
    assert "News Summary 1" in result
    assert "News Headline 2" in result
    assert "News Summary 2" in result

# Test for `scrape_data` with topic 'business'
@patch('requests.get')
def test_scrape_business(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.content = mock_html_business
    
    result = scrape_data('business')
    
    assert "Business Headline 1" in result
    assert "Business Summary 1" in result
    assert "Business Headline 2" in result
    assert "Business Summary 2" in result

# Test for `scrape_data` with a failed HTTP request (404)
@patch('requests.get', side_effect=mock_failed_request)
def test_scrape_failed_request(mock_get):
    result = scrape_data('sports')
    
    assert result == "Failed to retrieve data. HTTP Status Code: 404"

# Test for `scrape_data` with topic 'arts'
@patch('requests.get')
def test_scrape_arts(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.content = mock_html_business  # Reusing business HTML for simplicity
    
    result = scrape_data('arts')
    
    assert "Business Headline 1" in result
    assert "Business Summary 1" in result
    assert "Business Headline 2" in result
    assert "Business Summary 2" in result

# Test for `scrape_data` with topic 'travel'
@patch('requests.get')
def test_scrape_travel(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.content = mock_html_business  # Reusing business HTML for simplicity
    
    result = scrape_data('travel')
    
    assert "Business Headline 1" in result
    assert "Business Summary 1" in result
    assert "Business Headline 2" in result
    assert "Business Summary 2" in result
