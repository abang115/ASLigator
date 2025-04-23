import io
import sys
import os
import pytest
from unittest.mock import patch

root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(root_path)

from server import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

# Test if you can successfully upload a video
@patch('server.video_to_text')
def test_upload_success(mock_video_to_text, client):
    mock_video_to_text.return_value = "test"

    mock_video = io.BytesIO(b"test")
    mock_video.name = 'test_video.mp4'

    data = {
        'video': (mock_video, mock_video.name)
    }

    response = client.post('/upload', data=data, content_type='multipart/form-data')

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['message'] == "Video uploaded successfully"
    assert json_data['result'] == "test"

# Test if trying to upload with no video fails
@patch('server.video_to_text')
def test_no_video(mock_video_to_text, client):
    mock_video_to_text.return_value = "test"

    data = {}

    response = client.post('/upload', data=data, content_type='multipart/form-data')

    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data['error'] == "No video file provided"

# Test if trying to upload video with no filename fails
@patch('server.video_to_text')
def test_no_filename(mock_video_to_text, client):
    mock_video_to_text.return_value = "test"

    mock_video = io.BytesIO(b"test")
    mock_video.name = ''

    data = {
        'video': (mock_video, mock_video.name)
    }

    response = client.post('/upload', data=data, content_type='multipart/form-data')

    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data['error'] == "Empty filename"





