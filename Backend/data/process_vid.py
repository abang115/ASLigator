import os
import time
import cv2
import json
import mediapipe as mp 
import numpy as np

# Process image depending on model
def mp_detect(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # Covert BGR to RGB
    image.flags.writeable = False
    results = model.process(image)                  # Make prediction based on mp.solutions model
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)  # Convert RGB back to BGR
    return image, results

def draw_landmarks(image, results):
    # Draw left hand connections
    mp_drawings.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS,
                               mp_drawings.DrawingSpec(color=(0,0,255), thickness=2, circle_radius=2),
                               mp_drawings.DrawingSpec(color=(0,255,0), thickness=2, circle_radius=1))
    # Draw right hand connections
    mp_drawings.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS,
                               mp_drawings.DrawingSpec(color=(0,0,255), thickness=2, circle_radius=2),
                               mp_drawings.DrawingSpec(color=(0,255,0), thickness=2, circle_radius=1))
    # Draw face connections
    mp_drawings.draw_landmarks(image, results.face_landmarks, mp_holistic.FACEMESH_TESSELATION,
                               mp_drawings.DrawingSpec(color=(255,0,255), thickness=1, circle_radius=1),
                               mp_drawings.DrawingSpec(color=(0,255,0), thickness=1, circle_radius=1))
    # Draw pose connections
    mp_drawings.draw_landmarks(image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS,
                               mp_drawings.DrawingSpec(color=(0,0,255), thickness=2, circle_radius=2),
                               mp_drawings.DrawingSpec(color=(0,255,0), thickness=2, circle_radius=1))

def extract_landmarks(results):
    left_lm, right_lm, face_lm, pose_lm = [],[],[],[]
    # Grab coords for each left hand landmark
    left_lm = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    # Right hand landmark
    right_lm = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    # Face landmark
    face_lm = np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]).flatten() if results.face_landmarks else np.zeros(468*3)
    # Pose Landmark
    pose_lm = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4)
    return np.concatenate([face_lm, pose_lm, right_lm, left_lm])

def create_output_folder(output_folder, input_folder):
    # loops through the video data and makes directory
    for sign in os.listdir(input_folder):
        vid_dir = os.path.join(input_folder, sign)
        output_vid_dir = os.path.join(output_folder, sign)
        for vid in os.listdir(vid_dir):
            os.makedirs(output_vid_dir, exist_ok=True)

def output_data(output_folder, target, mapping):
    mapping_file = 'mapping.json'
    target_file = 'target.json'
    
    # Try exporting mapping to json
    try:
        with open(os.path.join(output_folder, mapping_file), 'w') as f:
            json.dump(mapping, f, indent=4)
            f.close()
    except Exception as e:
        print('Error exporting:', e)
    # Try exporting target to json
    try:
        with open(os.path.join(output_folder, target_file), 'w') as f:
            json.dump(target, f, indent=4)
            f.close()
    except Exception as e:
        print('Error exporting:', e)

def gather_vid_lm(vid_dir, JSON_folder, npy_folder, model):
    exit_flag = False
    
    # Classes and mapping
    target = []
    mapping = {}
    count = 0
    
    # Loop through every class in this directory
    for sign in os.listdir(vid_dir):
        VID_PATH = os.path.join(vid_dir, sign)
        OUTPUT_SIGN_PATH = os.path.join(npy_folder, sign)
        
        # Map the current sign and increment index
        mapping[sign] = count
        count += 1
        
        # Go thorugh each sign and get videos
        for video in os.listdir(VID_PATH):
            mp4_file = os.path.join(VID_PATH, video)
            
            # Split name and file extension
            name, ext = os.path.splitext(video)
            OUTPUT_SIGN_VIDEO_PATH = os.path.join(OUTPUT_SIGN_PATH, name)
            
            print(f'Capturing data for video: {video}')
            
            # Open capture for that video
            cam = cv2.VideoCapture(mp4_file)
            
            num_frames = 0
            exit_vid_capture_flag = False
            
            #start_time = time.time()
            
            frame_landmarks = []
            
            while num_frames != 40:
                # Skip if file cannot be read
                ret, frame = cam.read()
                if not ret:
                    print(f'{mp4_file} cannot be read')
                    break
            
                image, result = mp_detect(frame, model)
                draw_landmarks(image, result)
                
                # Append the landmarks in frame to the array
                frame_landmarks.append(extract_landmarks(result))
                
                cv2.imshow('Collecting data', image)

                if cv2.waitKey(1) == ord('q'):
                    exit_vid_capture_flag = True
                    exit_flag = True
                    break
                num_frames += 1
            
            # Check shape of output, if it's not expected throw it out
            try:
                if np.array(frame_landmarks).shape != (40, 1662):
                    print('Error: Shape not (40, 1662)')
                    continue
            except Exception as e:
                print(f'Error: {video} due to {e}')
                # print(frame_landmarks)
                continue
            
            # Add the current target to the array
            target.append(mapping[sign])
            
            # Try saving npy
            try:
                np.save(OUTPUT_SIGN_VIDEO_PATH, frame_landmarks)
            except Exception as e:
                print(f'Error exporting to npy: {e}')
            
            #end_time = time.time()
            #duration = end_time - start_time
            #print(f'Capturing 30 frames took {duration} seconds')
            
            if exit_vid_capture_flag:
                break
            
        if exit_flag:
            cv2.waitKey(10)
            cam.release()
            cv2.destroyAllWindows()
            break
        
    cv2.waitKey(10)
    cam.release()
    cv2.destroyAllWindows()  
    
    # Output data
    output_data(JSON_folder, target, mapping)    


if __name__ == '__main__':
    mp_holistic = mp.solutions.holistic
    mp_drawings = mp.solutions.drawing_utils

    holistic = mp_holistic.Holistic(
        min_detection_confidence=0.75, 
        min_tracking_confidence=0.6
    )
    
    # Path to training videos
    VID_FOLDER = 'train_video_folder'
    
    # Path to output folders
    OUTPUT_JSON_FOLDER = F'Processed_JSON_{VID_FOLDER}'
    OUTPUT_NPY_FOLDER = f'Processed_NPY_{VID_FOLDER}'
    
    # Create output folders
    os.makedirs(OUTPUT_JSON_FOLDER, exist_ok=True)
    
    # Npy data folders
    create_output_folder(OUTPUT_NPY_FOLDER, VID_FOLDER)
    
    print(os.getcwd())
    gather_vid_lm(VID_FOLDER, OUTPUT_JSON_FOLDER, OUTPUT_NPY_FOLDER, holistic)