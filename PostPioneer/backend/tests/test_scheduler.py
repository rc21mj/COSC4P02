import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime
import json
import sys, os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import mergedApp  # Import the entire module

# Test for the `hourly_trigger` function
def test_hourly_trigger():
    # Mocking Firebase Database interaction
    mock_db_ref = MagicMock()
    mock_users = {
        "user1": {
            "UserPosts": {
                "post1": {
                    "schedule": "hourly",
                    "tone": "friendly",
                    "topic": "Test topic",
                    "language": "en"
                }
            }
        }
    }
    with patch('firebase_admin.db.reference') as mock_db_ref, patch('builtins.print') as mock_print:
        mock_db_ref.return_value.get.return_value = mock_users
        current_time = datetime(2025, 4, 23, 0, 0, 0)
        with patch('mergedApp.datetime') as mock_datetime:
            mock_datetime.now.return_value = current_time
            mergedApp.hourly_trigger()  # Run the function using the module name
            mock_print.assert_any_call("Hourly post")  # We should expect the print statement for "hourly" posts

# Test the `process_payment` function with Stripe
@patch('stripe.Charge.create')
def test_process_payment_success(mock_charge_create):
    mock_charge_create.return_value = {"status": "succeeded", "id": "ch_1"}
    
    test_data = {
        "paymentToken": json.dumps({"id": "tok_visa"})
    }
    
    with mergedApp.app.test_client() as client:
        response = client.post('/process-payment', json=test_data)
        assert response.status_code == 200
        assert b"success" in response.data

@patch('stripe.Charge.create')
def test_process_payment_failure(mock_charge_create):
    mock_charge_create.side_effect = Exception("Charge creation failed")
    test_data = {
        "paymentToken": json.dumps({"id": "tok_visa"})
    }
    
    with mergedApp.app.test_client() as client:
        response = client.post('/process-payment', json=test_data)
        assert response.status_code == 500
        assert b"Charge creation failed" in response.data

# Test the `hil_submit` function
@patch('mergedApp.make_linkedin_post')
@patch('mergedApp.get_linkedin_token')
def test_hil_submit(mock_get_linkedin_token, mock_make_linkedin_post):
    mock_get_linkedin_token.return_value = "dummy_access_token"
    mock_make_linkedin_post.return_value = None
    
    test_data = {
        'generated_post': "This is a test post",
        'userid': 'test_user'
    }
    
    with mergedApp.app.test_client() as client:
        response = client.post('/hil_submit', json=test_data)
        assert response.status_code == 200
        assert b"All good" in response.data
        mock_make_linkedin_post.assert_called_once_with("dummy_access_token", "This is a test post")
