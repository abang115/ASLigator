import os
import time
import cv2
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
    if results.left_hand_landmarks:
        left_lm = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten()
    else:
        left_lm = np.zeros(21*3)
    # Right hand landmark
    if results.right_hand_landmarks:
        right_lm = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten()
    else:
        right_lm = np.zeros(21*3)
    # Face landmark
    if results.face_landmarks:
        face_lm = np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]).flatten()
    else:
        face_lm = np.zeros(478*3)
    # Pose Landmark
    if results.pose_landmarks:
        pose_lm = np.array([[res.x, res.y, res.z] for res in results.pose_landmarks.landmark]).flatten()
    else:
        pose_lm = np.zeros(33*3)
    return np.concatenate([left_lm, right_lm, face_lm, pose_lm])

def gather_vid_lm(vid_dir, model):
    exit_flag = False
    # Loop through every class in this directory
    for sign in os.listdir(vid_dir):
        VID_PATH = os.path.join(vid_dir, sign)
        # print(VID_PATH)
        
        # Go thorugh each sign and get videos
        for video in os.listdir(VID_PATH):
            mp4_file = os.path.join(VID_PATH, video)
            
            print(f'Capturing data for video: {video}')
            
            # Open capture for that video
            cam = cv2.VideoCapture(mp4_file)
            
            num_frames = 0
            
            exit_vid_capture_flag = False
            
            #start_time = time.time()
            
            while num_frames != 40:
                # Skip if file cannot be read
                ret, frame = cam.read()
                if not ret:
                    print(f'{mp4_file} cannot be read')
                    break
            
                image, result = mp_detect(frame, model)
                draw_landmarks(image, result)
                cv2.imshow('Collecting data', image)
            
                if cv2.waitKey(1) == ord('q'):
                    exit_vid_capture_flag = True
                    exit_flag = True
                    break
                num_frames += 1
            
            #end_time = time.time()
            #duration = end_time - start_time
            #print(f'Capturing 30 frames took {duration} seconds')
            
            if exit_vid_capture_flag:
                break
            # cv2.waitKey(10)
            # cam.release()
            # cv2.destroyAllWindows()
            
        if exit_flag:
            cv2.waitKey(10)
            cam.release()
            cv2.destroyAllWindows()
            break
    cv2.waitKey(10)
    cam.release()
    cv2.destroyAllWindows()      


if __name__ == '__main__':
    mp_holistic = mp.solutions.holistic
    mp_drawings = mp.solutions.drawing_utils

    holistic = mp_holistic.Holistic(
        min_detection_confidence=0.75, 
        min_tracking_confidence=0.6
    )
    
    # Path to training videos
    VID_FOLDER = 'train_video_folder'
    print(os.getcwd())
    gather_vid_lm(VID_FOLDER, holistic)