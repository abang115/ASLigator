import json
import os
import requests
from pytubefix import YouTube, extract
from pytube.exceptions import VideoUnavailable
from moviepy.editor import VideoFileClip


def download_and_trim_videos(json_file_path, output_folder):
    count = 0
    os.makedirs(output_folder, exist_ok=True)
    with open(json_file_path, 'r') as f:
        data = json.load(f)
    for item in data:
        if count >= 30:  # this limits it if you dont want to download the entire json
            break
        url = item.get('url', '')
        if not url.startswith('http'):
            url = 'https://' + url
        file_name = item.get('clean_text', 'video')
        full_video_path = os.path.join(output_folder, file_name + '_full.mp4')
        trimmed_video_path = os.path.join(output_folder, file_name + '.mp4')
        # print(f"Downloading {file_name} from {url}")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        }
        try:
            r = requests.get(url, headers=headers)
            if r.status_code == 200 and extract.is_private(r.text):
                None
                # print(f"Private.")
                continue
            elif r.status_code != 200:
                None
                # print(f"Warning")
        except Exception as e:
            None
            # print(f"Error")
        try:
            yt = YouTube(url)
            if hasattr(yt, 'privacy_status') and yt.privacy_status == 'private':
                None
                # print(f"Skipping {file_name}: Video is private.")
                continue
        except VideoUnavailable:
            None
            # print(f"Skipping {file_name}: Video unavailable.")
            continue
        except Exception as e:
            None
            # print(f"Skipping {file_name} due to error: {e}")
            continue
        try:
            stream = yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first()
            if not stream:
                None
                # print(f"Skipping {file_name}.")
                continue
            stream.download(output_path=output_folder, filename=file_name + '_full.mp4')
        except Exception as e:
            None
            # print(f"Error downloading {file_name}: {e}")
            continue
        try:
            start_time = float(item.get('start_time', 0))
            end_time = float(item.get('end_time', 0))
            if end_time <= start_time:
                # print(f"Skipping {file_name}: Invalid time range.")
                os.remove(full_video_path)
                continue
        except Exception as e:
            # print(f"Error reading start/end times for {file_name}: {e}")
            os.remove(full_video_path)
            continue
        try:
            clip = VideoFileClip(full_video_path)
            trimmed_clip = clip.subclip(start_time, end_time)
            trimmed_clip.write_videofile(trimmed_video_path, codec="libx264", audio_codec="aac", verbose=False,
                                         logger=None)
            clip.close()
            trimmed_clip.close()
            print(f"Trimmed video saved as {trimmed_video_path}")
            os.remove(full_video_path)
            count += 1
        except Exception as e:
            # print(f"Error trimming {file_name}: {e}")
            if os.path.exists(full_video_path):
                os.remove(full_video_path)
            continue


if __name__ == '__main__':
    json_file_path = 'MSASL_test.json'
    output_folder = 'video_folder'
    download_and_trim_videos(json_file_path, output_folder)
