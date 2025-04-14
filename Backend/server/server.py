from flask import Flask, request, send_from_directory, jsonify
from flask_cors import CORS
import os
import sys

root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(root_path)

from src.Video_to_Text import video_to_text

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "send_wildcard": "False"}})
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Make sure upload folder exists so videos can be uploaded to it
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Post method to allow frontend to send videos to the server and for the model to process it
@app.route('/upload', methods=['POST'])
def upload_video():
    # If no video is sent, throw an error
    if 'video' not in request.files:
        return {"error": "No video file provided"}, 400

    # If no filename, throw an error
    video = request.files['video']
    if video.filename == '':
        return {"error": "Empty filename"}, 400

    # Upload video to uploads folder
    video_path = os.path.join(app.config['UPLOAD_FOLDER'], video.filename)
    video.save(video_path)

    # Run video_to_text on the uploaded video
    results = video_to_text(video_path)

    # Send results as a json message to the frontend
    return jsonify({"message": "Video uploaded successfully", 'result': results})

@app.route('/videos/<filename>')
def serve_video(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
