import pytest
from flask import session
from unittest.mock import patch, MagicMock
import sys, os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import mergedApp  # Import the full module, not individual functions

@pytest.fixture
def client():
    mergedApp.app.testing = True
    with mergedApp.app.test_client() as client:
        with client.session_transaction() as sess:
            sess['username'] = 'testuser'
        yield client

@patch('mergedApp.requests.Request')
def test_linkedin_login(mock_request, client):
    mock_request.return_value.prepare.return_value.url = 'https://www.linkedin.com/oauth/v2/authorization?state=teststate'

    response = client.get('/linkedin_login?user_id=testuser')

    assert response.status_code == 302
    assert 'https://www.linkedin.com/oauth/v2/authorization' in response.headers['Location']
    with client.session_transaction() as sess:
        assert 'linkedin_oauth_state' in sess
        assert sess['username'] == 'testuser'

@patch('mergedApp.requests.post')
@patch('mergedApp.save_linkedin_token')
def test_linkedin_callback_success(mock_save_token, mock_post, client):
    with client.session_transaction() as sess:
        sess['linkedin_oauth_state'] = 'valid_state'

    token_data = {'access_token': 'mock_access_token'}
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = token_data
    mock_post.return_value = mock_response

    response = client.get('/linkedin_callback?code=abc123&state=valid_state')

    assert response.status_code == 302
    assert response.headers['Location'] == 'http://localhost:3000/settings'
    with client.session_transaction() as sess:
        assert sess['linkedin_token'] == 'mock_access_token'
    mock_save_token.assert_called_once()

def test_linkedin_callback_missing_code(client):
    with client.session_transaction() as sess:
        sess['linkedin_oauth_state'] = 'valid_state'

    response = client.get('/linkedin_callback?state=valid_state')
    assert response.status_code == 400
    assert "Missing code or state" in response.get_data(as_text=True)

def test_linkedin_callback_invalid_state(client):
    with client.session_transaction() as sess:
        sess['linkedin_oauth_state'] = 'valid_state'

    response = client.get('/linkedin_callback?code=abc123&state=wrong_state')
    assert response.status_code == 400
    assert "Invalid state" in response.get_data(as_text=True)

@patch('mergedApp.db.reference')
def test_remove_linkedin(mock_ref, client):
    mock_ref.return_value.child.return_value.child.return_value.update = MagicMock()
    
    response = client.get('/remove_linkedin?user_id=testuser')

    mock_ref.return_value.child.return_value.child.return_value.update.assert_called_once_with({'LinkedIn': None})
    assert response.status_code == 302
    assert response.headers['Location'] == 'http://localhost:3000/settings'

@patch('mergedApp.db.reference')
def test_save_linkedin_token(mock_db_reference):
    mock_user_ref = MagicMock()
    mock_db_reference.return_value.child.return_value.child.return_value = mock_user_ref

    mergedApp.save_linkedin_token('testuser', 'mock_token')

    mock_user_ref.update.assert_called_once_with({'LinkedIn': 'mock_token'})

@patch('mergedApp.db.reference')
def test_remove_linkedin_token(mock_db_reference):
    mock_user_ref = MagicMock()
    mock_db_reference.return_value.child.return_value.child.return_value = mock_user_ref

    mergedApp.remove_linkedin_token('testuser')

    mock_user_ref.update.assert_called_once_with({'LinkedIn': None})

@patch('mergedApp.db.reference')
def test_get_linkedin_token(mock_db_reference):
    mock_token = 'retrieved_token'
    mock_get = MagicMock(return_value=mock_token)
    mock_db_reference.return_value.child.return_value.child.return_value.child.return_value.get = mock_get

    result = mergedApp.get_linkedin_token('testuser')

    assert result == mock_token
    mock_get.assert_called_once()
