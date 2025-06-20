import unittest
from unittest.mock import patch, MagicMock
from app import app, call_gemini_api # Import call_gemini_api
from src.project_ideate.config import settings

class TestAppEndpoints(unittest.TestCase):

    def setUp(self):
        # This method is called before each test
        self.app = app.test_client()
        self.app.testing = True

@patch('app.settings')
def test_get_gemini_api_key_configured(self, mock_settings):
    mock_settings.GEMINI_API_KEY = "fake_api_key"
    response = self.app.get('/api/key')
    self.assertEqual(response.status_code, 200)
    self.assertEqual(response.get_json(), {"apiKey": "fake_api_key"})

@patch('app.settings')
def test_get_gemini_api_key_not_configured(self, mock_settings):
    mock_settings.GEMINI_API_KEY = None
    response = self.app.get('/api/key')
    self.assertEqual(response.status_code, 500)
    self.assertEqual(response.get_json(), {"error": "API key not configured in environment variables"})

@patch('app.genai')
@patch('app.settings')
def test_call_gemini_api_success(self, mock_settings, mock_genai):
    mock_settings.google_api_key = "fake_google_key"
    mock_settings.default_model = "fake_model"
    mock_response = MagicMock()
    mock_response.text = "This is a generated response."
    mock_model = MagicMock()
    mock_model.generate_content.return_value = mock_response
    mock_genai.GenerativeModel.return_value = mock_model
    prompt = "Test prompt"
    response_text = call_gemini_api(prompt)
    self.assertEqual(response_text, "This is a generated response.")
    mock_genai.GenerativeModel.assert_called_once_with("fake_model")
    mock_model.generate_content.assert_called_once_with(prompt)

@patch('app.settings')
def test_call_gemini_api_no_key(self, mock_settings):
    mock_settings.google_api_key = None
    prompt = "Test prompt"
    response_text = call_gemini_api(prompt)
    self.assertEqual(response_text, "Error: GOOGLE_API_KEY is not configured on the backend.")

@patch('app.genai')
@patch('app.settings')
def test_call_gemini_api_exception(self, mock_settings, mock_genai):
    mock_settings.google_api_key = "fake_google_key"
    mock_settings.default_model = "fake_model"
    mock_genai.GenerativeModel.side_effect = Exception("API error")
    prompt = "Test prompt"
    response_text = call_gemini_api(prompt)
    self.assertIn("An error occurred while contacting the AI model: API error", response_text)

if __name__ == '__main__':
    unittest.main()