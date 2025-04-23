import cv2
import os
import json
import numpy as np
import mediapipe as mp
from helper import mp_detect, draw_landmarks, extract_landmarks

def create_output_folder(OUTPUT_NPY_FOLDER, signs):
    for sign in signs: 
        os.makedirs(os.path.join(OUTPUT_NPY_FOLDER, sign), exist_ok=True)

def create_JSON_output(OUTPUT_JSON_FOLDER, OUTPUT_NPY_FOLDER):
    os.makedirs(OUTPUT_JSON_FOLDER, exist_ok=True)
    mapping_file = 'mapping.json'
    target_file = 'target.json'

    target = []
    mapping = {}
    count = 0

    # Go though each sign 
    for sign in os.listdir(OUTPUT_NPY_FOLDER):
        # Create path to the sign with videos stored in npy files
        sign_path = os.path.join(OUTPUT_NPY_FOLDER, sign)
        # Create a dictionary to map the sign to the corresponding index
        mapping[sign] = count
        count += 1
        # Create a target array (y) for use during training
        num_vids = len(os.listdir(sign_path))
        # Number of target values should equal number of videos recorded
        target.extend([mapping[sign]] * num_vids)
    
    # Try exporting mapping to json
    try:
        with open(os.path.join(OUTPUT_JSON_FOLDER, mapping_file), 'w') as f:
            json.dump(mapping, f, indent=4)
            f.close()
    except Exception as e:
        print('Error exporting:', e)
    # Try exporting target to json
    try:
        with open(os.path.join(OUTPUT_JSON_FOLDER, target_file), 'w') as f:
            json.dump(target, f, indent=4)
            f.close()
    except Exception as e:
        print('Error exporting:', e)
            
def resize_portrait(frame, target_size=(720,1280)):
    target_w, target_h = target_size
    h, w = frame.shape[:2]

    # scale factor to englarge the height from 720 to 1280 or 16:9 aspect ratio
    scale_factor = float(16) / 9

    # Resize the frame with the scale factor
    resized_frame = cv2.resize(frame, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_LINEAR)

    # Reset new width to new frame
    w = resized_frame.shape[1]

    # Compute the starting x coordinatefor center-cropping to 720p width
    start_x = (w - target_w) // 2
    end_x = start_x + target_w
    portrait_frame = resized_frame[:, start_x:end_x]

    return portrait_frame

# Path for exported data, numpy arrays and json files
OUTPUT_FOLDER_NAME = 'test_dataset'
OUTPUT_NPY_FOLDER = os.path.join(os.getcwd(), f'Processed_NPY_{OUTPUT_FOLDER_NAME}')
OUTPUT_JSON_FOLDER = os.path.join(os.getcwd(), f'Processed_JSON_{OUTPUT_FOLDER_NAME}')

# Alphabet signs
signs = np.array(['_', 'I am', 'Hungry', 'Hello', 'Tired', 'Good'])

# Number of videos to capture
num_videos = 80
# Number of frames in each video
num_frames = 30

create_output_folder(OUTPUT_NPY_FOLDER, signs)

# Set this flag to False to disable video output if not needed (for speed)
ENABLE_VIDEO_OUTPUT = True

# Intialize openCV webcam
webcam = cv2.VideoCapture(0)

# Zooms out the portrait mode image to fit on screen
zoom_out_factor = 0.6  

# Video codec
fourcc = cv2.VideoWriter_fourcc(*'m', 'p', '4', 'v')

# Set resolution (width x height), Matches input from mobile device
width = 1280
height = 720
webcam.set(cv2.CAP_PROP_FRAME_WIDTH, width)
webcam.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
print(f"Capture width: {webcam.get(cv2.CAP_PROP_FRAME_WIDTH)}, height: {webcam.get(cv2.CAP_PROP_FRAME_HEIGHT)}")

# Intialize mediapipe tools
mp_holistic = mp.solutions.holistic
mp_drawings = mp.solutions.drawing_utils

# Intialized holistic model and Capture data for signs
with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
    # Flag to end capture early 
    exit_flag = False

    for sign in signs:
        print(f'Collecting data for sign: {sign}')
        
        # Wait till user is ready to begin capture
        while True:
            # Read frame
            ret, frame = webcam.read()
        
            # Break if camera fails
            if not ret:
                break

            # Change to portrait mode
            frame = resize_portrait(frame)

            # Mediapipe landmarking
            image, result = mp_detect(frame, holistic)
            draw_landmarks(image, result, mp_holistic, mp_drawings)
            text_pos = (int(image.shape[1] * 0.1), int(image.shape[0] // 2))
            
            cv2.putText(image, f'Press r to begin capture for sign {sign}',
                            text_pos, cv2.FONT_HERSHEY_SIMPLEX, 1.0,  (0,255,0), 2)
            
            # Zoom out image to fit screen
            zoomed_out_frame = cv2.resize(image, None, fx=zoom_out_factor, fy=zoom_out_factor, interpolation=cv2.INTER_LINEAR)
            
            cv2.imshow('Collecting data', zoomed_out_frame)
            key = cv2.waitKey(33)
            if key == ord('r'):
                break
            elif key == ord('q'):
                exit_flag = True
                break
        
        # Check exit flag if actiavted before capture
        if exit_flag:
            break
        if ENABLE_VIDEO_OUTPUT:
            vid_dir = os.path.join(os.getcwd(), 'temp', sign)
            os.makedirs(vid_dir, exist_ok=True)
        
        # Capture sign data
        for video in range(num_videos):
            output_path = os.path.join(OUTPUT_NPY_FOLDER, str(sign), f'{video}')
            video_landmarks = []
            
            if ENABLE_VIDEO_OUTPUT:
                out = cv2.VideoWriter(
                    os.path.join(vid_dir, f'sign_{sign}_video_{video}.mp4'),
                    fourcc, 30, (width, height)
                )
            
            # Countdown for taking in signs
            for countdown in range(3, 0, -1):
                ret, frame = webcam.read()
                if not ret:
                    break
                frame = resize_portrait(frame)
                frame = cv2.resize(frame, None, fx=zoom_out_factor, fy=zoom_out_factor, interpolation=cv2.INTER_LINEAR)

                cv2.putText(frame, f'Starting in {countdown}...', (int(frame.shape[1] * 0.2) ,
                        int(frame.shape[0] // 2)), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
                cv2.imshow('Collecting data', frame)
                cv2.waitKey(250)
            
            # Capturing data
            for n in range(num_frames):    
                # Read frame
                ret, frame = webcam.read()
            
                # Break if camera fails
                if not ret:
                    break
                
                # Change to portrait mode
                frame = resize_portrait(frame)

                # Mediapipe landmarking
                image, result = mp_detect(frame, holistic)
                draw_landmarks(image, result, mp_holistic, mp_drawings)
                lm = extract_landmarks(result)

                cv2.putText(image, f'Collecting data for {sign}', (20, 32), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (128, 255, 128), 2)
                cv2.putText(image, f'Video Number {video}', (20, 72), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (128, 255, 128), 2)
                cv2.putText(image, f'Frame Number {n}', (20, 112), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (128, 255, 128), 2)
                
                # Zoom out to fit screen
                zoomed_out_image = cv2.resize(image, None, fx=zoom_out_factor, fy=zoom_out_factor, interpolation=cv2.INTER_LINEAR)
                
                # Show Frame to screen
                cv2.imshow('Collecting data', zoomed_out_image)
                
                # Append landmarks in frame to array
                video_landmarks.append(lm)
                
                # Write to video output if enabled (full resolution, pre-zoom)
                if ENABLE_VIDEO_OUTPUT:
                    frame = cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)
                    out.write(frame)

                # Stop webcam if q or exit button is pressed
                if cv2.waitKey(33) == ord('q'):
                    exit_flag = True
                    break
            if ENABLE_VIDEO_OUTPUT:
                out.release()
            if exit_flag:
                break
            
            # Save landmark array to npy file. Should have 30 frames worth of video output    
            np.save(output_path, video_landmarks)
            cv2.waitKey(250)
            
        # Check exit flag if actiavted during capture
        if exit_flag:
            break

create_JSON_output(OUTPUT_JSON_FOLDER, OUTPUT_NPY_FOLDER)
webcam.release()
cv2.destroyAllWindows()