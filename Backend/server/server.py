from flask import Flask, request, render_template, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

#temporary html page to view video
@app.route('/')
def index():
    videos = os.listdir(UPLOAD_FOLDER)
    return render_template('video_player.html', videos=videos)

@app.route('/upload', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return {"error": "No video file provided"}, 400

    video = request.files['video']
    if video.filename == '':
        return {"error": "Empty filename"}, 400

    video_path = os.path.join(app.config['UPLOAD_FOLDER'], video.filename)
    video.save(video_path)

    return {"message": "Video uploaded successfully", "video_path": video.filename}

@app.route('/videos/<filename>')
def serve_video(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
