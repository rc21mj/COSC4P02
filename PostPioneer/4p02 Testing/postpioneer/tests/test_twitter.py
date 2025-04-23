import pytest
from unittest.mock import patch, MagicMock
from flask import session

@pytest.fixture
def client():
    from mergedApp import app  # Delay import to avoid early Firebase init
    app.testing = True
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['username'] = 'testuser'
        yield client

@patch('mergedApp.OAuth1Session')
def test_twitter_login(mock_oauth, client):
    mock_oauth_instance = mock_oauth.return_value
    mock_oauth_instance.fetch_request_token.return_value = {'oauth_token': 'test_token'}

    response = client.get('/twitter_login?user_id=testuser')

    assert response.status_code == 302
    assert 'oauth_token=test_token' in response.headers['Location']
    with client.session_transaction() as sess:
        assert sess['twitter_oauth_token'] == 'test_token'
        assert sess['username'] == 'testuser'

@patch('mergedApp.save_twitter_token')
@patch('mergedApp.OAuth1Session')
def test_twitter_callback(mock_oauth, mock_save_token, client):
    mock_oauth_instance = mock_oauth.return_value
    mock_oauth_instance.fetch_access_token.return_value = {
        'oauth_token': 'access_token',
        'oauth_token_secret': 'secret_token'
    }

    response = client.get('/twitter_callback?oauth_token=token&oauth_verifier=verifier')

    assert response.status_code == 302
    assert response.headers['Location'] == 'http://localhost:3000/settings'
    with client.session_transaction() as sess:
        assert sess['twitter_token'] == 'access_token'
        assert sess['twitter_token_secret'] == 'secret_token'
    mock_save_token.assert_called_once_with('testuser', 'access_token', 'secret_token')

@patch('mergedApp.db.reference')
def test_remove_twitter(mock_ref, client):
    mock_ref.return_value.child.return_value.child.return_value.update = MagicMock()

    response = client.get('/remove_twitter?user_id=testuser')

    assert response.status_code == 302
    assert response.headers['Location'] == 'http://localhost:3000/settings'
    mock_ref.return_value.child.return_value.child.return_value.update.assert_called_once_with({
        'TwitterToken': None,
        'TwitterTokenSecret': None
    })

@patch('mergedApp.db.reference')
def test_save_twitter_token(mock_ref):
    from mergedApp import save_twitter_token
    mock_ref.return_value.child.return_value.child.return_value = MagicMock()

    save_twitter_token('testuser', 'token', 'secret')
    mock_ref.return_value.child.return_value.child.return_value.update.assert_called_once_with({
        'TwitterToken': 'token',
        'TwitterTokenSecret': 'secret'
    })

@patch('mergedApp.db.reference')
def test_remove_twitter_token(mock_ref):
    from mergedApp import remove_twitter_token
    mock_ref.return_value.child.return_value.child.return_value = MagicMock()

    remove_twitter_token('testuser')
    mock_ref.return_value.child.return_value.child.return_value.update.assert_called_once_with({
        'TwitterToken': None,
        'TwitterTokenSecret': None
    })

@patch('mergedApp.db.reference')
def test_get_twitter_token(mock_ref):
    from mergedApp import get_twitter_token
    mock_get = MagicMock(return_value='mock_token')
    mock_ref.return_value.child.return_value.child.return_value.child.return_value.get = mock_get

    result = get_twitter_token('testuser')
    assert result == 'mock_token'

@patch('mergedApp.db.reference')
def test_get_twitter_token_secret(mock_ref):
    from mergedApp import get_twitter_token_secret
    mock_get = MagicMock(return_value='mock_secret')
    mock_ref.return_value.child.return_value.child.return_value.child.return_value.get = mock_get

    result = get_twitter_token_secret('testuser')
    assert result == 'mock_secret'

@patch('mergedApp.OAuth1Session')
def test_make_twitter_post_success(mock_oauth):
    from mergedApp import make_twitter_post
    mock_instance = mock_oauth.return_value
    mock_instance.post.return_value.status_code = 201

    result = make_twitter_post('token', 'secret', 'Hello!')
    assert result == {"message": "Tweet successfully posted!"}

@patch('mergedApp.OAuth1Session')
def test_make_twitter_post_failure(mock_oauth):
    from mergedApp import make_twitter_post
    mock_instance = mock_oauth.return_value
    mock_instance.post.return_value.status_code = 400
    mock_instance.post.return_value.text = "Bad Request"

    with pytest.raises(Exception, match="Failed to post tweet: Bad Request"):
        make_twitter_post('token', 'secret', 'Hello!')
