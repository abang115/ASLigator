import json
import os
import requests
from pytubefix import YouTube, extract
from pytube.exceptions import VideoUnavailable
from moviepy.editor import VideoFileClip

def get_unique_path(output_folder, clean_text):
    counter = 1
    unique_path = os.path.join(output_folder, clean_text, f'{clean_text}.mp4')
    
    while os.path.exists(unique_path):
        unique_path = os.path.join(output_folder, clean_text, f'{clean_text}_{counter}.mp4')  
        counter += 1
    return unique_path

def download_and_trim_videos(json_file_path, output_folder, start_index=0, end_index=None):
    os.makedirs(output_folder, exist_ok=True)
    with open(json_file_path, 'r') as f:
        data = json.load(f)
    
    if end_index is None or end_index > len(data):
        end_index = len(data)
    
    data_range = data[start_index:end_index]
    
    
    
    for idx, item in enumerate(data_range):
        curr_idx = start_index + idx
        
        url = item.get('url', '')
        
        if not url.startswith('http'):
            url = 'https://' + url
            
        clean_text = str(item.get('clean_text', 'video'))
        vid_text = str(item.get('file', 'video'))
        full_video_path = os.path.join(output_folder, vid_text + '_full.mp4')
        trimmed_video_path = get_unique_path(output_folder, clean_text)

        if os.path.exists(full_video_path):
            print(f'Video {vid_text} already exists, Skipping to trimming')
        else:    
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
                # print(f"Skipping {clean_text} due to error: {e}")
                continue
            try:
                stream = yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first()
                if not stream:
                    None
                    # print(f"Skipping {file_name}.")
                    continue
                
                # Make dir for folder/class
                class_dir = os.path.join(output_folder, clean_text)
                os.makedirs(class_dir, exist_ok=True)
                
                print(f'downloading to: {class_dir}')
                stream.download(output_path=output_folder, filename=vid_text + '_full.mp4')     
            except Exception as e:
                print(f"Error downloading {clean_text}: {e}")
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

        except Exception as e:
            print(f"Error trimming {clean_text}: {e}")
            continue
        
        next_item = data[curr_idx + 1] if curr_idx + 1 < len(data) else None
        next_url = next_item.get('url', '') if next_item else None
        if not next_url.startswith('http'):
            next_url = 'https://' + next_url
        if next_url != url:
            if os.path.exists(full_video_path):
                os.remove(full_video_path)
                print(f'Deleting full video {vid_text}')


if __name__ == '__main__':
    # print(os.getcwd())
    json_file_path = 'MSASL_train.json'
    output_folder = 'train_video_folder_2'
    download_and_trim_videos(json_file_path, output_folder, start_index=0, end_index=2000)
