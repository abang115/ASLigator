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
    for sign in os.listdir(OUTPUT_NPY_FOLDER):
        sign_path = os.path.join(OUTPUT_NPY_FOLDER, sign)
        mapping[sign] = count
        count += 1
        # TODO match output of this file to process_vid
        num_vids = len(os.listdir(sign_path))
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
            
            

# Path for exported data, numpy arrays and json files
OUTPUT_FOLDER_NAME = 'test_dataset'
OUTPUT_NPY_FOLDER = os.path.join(os.getcwd(), f'Processed_NPY_{OUTPUT_FOLDER_NAME}')
OUTPUT_JSON_FOLDER = os.path.join(os.getcwd(), f'Processed_JSON_{OUTPUT_FOLDER_NAME}')

# Intialize mediapipe tools
mp_holistic = mp.solutions.holistic
mp_drawings = mp.solutions.drawing_utils

# Alphabet signs
signs = np.array(['_', 'Iam', 'Hungry', 'Hello', 'Tired', 'Good'])

# Number of videos to capture
num_videos = 30

# Number of frames in each video
num_frames = 30

create_output_folder(OUTPUT_NPY_FOLDER, signs)

# Intialize openCV webcam
webcam = cv2.VideoCapture(0)

# Set resolution (width x height)
width = 1280
height = 720
webcam.set(cv2.CAP_PROP_FRAME_WIDTH, width)
webcam.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

# Flag to end capture early 
exit_flag = False

# Intialized holistic model and Capture data for signs
with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
    for sign in signs:
        print(f'Collecting data for sign: {sign}')
        
        # Wait till user is ready to begin capture
        while True:
            # Read frame
            ret, frame = webcam.read()
        
            # Break if camera fails
            if not ret:
                break
            
            image, result = mp_detect(frame, holistic)
            draw_landmarks(image, result, mp_holistic, mp_drawings)
            text_pos = (int(width * 0.25), int(height / 2))
            
            cv2.putText(image, f'Press r to begin capture for sign {sign}',
                            text_pos, cv2.FONT_HERSHEY_SIMPLEX, 1.0,  (0,255,0), 2)
            
            cv2.imshow('Collecting data', image)
            
            if cv2.waitKey(1) == ord('r'):
                break
            if cv2.waitKey(10) == ord('q'):
                exit_flag = True
                break
        
        # Check exit flag if actiavted before capture
        if exit_flag:
            break
        
        # Capture sign data
        for video in range(num_videos):
            output_path = os.path.join(OUTPUT_NPY_FOLDER, str(sign), f'{sign}_{video}')
            video_landmarks = []
            
            # Capturing data
            for n in range(num_frames):    
                # Read frame
                ret, frame = webcam.read()
            
                # Break if camera fails
                if not ret:
                    break
            
                image, result = mp_detect(frame, holistic)
                draw_landmarks(image, result, mp_holistic, mp_drawings)

                cv2.putText(image, f'Collecting data for {sign}', (15, 12), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
                cv2.putText(image, f'Video Number {video}', (15, 32), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
                cv2.putText(image, f'Frame Number {n}', (15, 52), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
                    
                lm = extract_landmarks(result)
                
                # Append landmarks in frame to array
                video_landmarks.append(lm)
                
                cv2.imshow('Collecting data', image)
                
                # Stop webcam if q or exit button is pressed
                if cv2.waitKey(10) == ord('q'):
                    exit_flag = True
                    break
            
            if exit_flag:
                break
            
            # Save landmark array to npy file. Should have 30 frames worth of video output    
            np.save(output_path, video_landmarks)

        # Check exit flag if actiavted during capture
        if exit_flag:
            break

create_JSON_output(OUTPUT_JSON_FOLDER, OUTPUT_NPY_FOLDER)

webcam.release()
cv2.destroyAllWindows()