import cv2
import os
import time
import numpy as np
import mediapipe as mp

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

def extract_landmarks(results):
    left_lm, right_lm = [],[]
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
    
    return np.concatenate([left_lm, right_lm])


# Intialize mediapipe tools
mp_holistic = mp.solutions.holistic
mp_drawings = mp.solutions.drawing_utils
holistic = mp_holistic.Holistic(
    min_detection_confidence=0.7, 
    min_tracking_confidence=0.5
    )

# Intialize openCV webcam
webcam = cv2.VideoCapture(0)

# Path for exported data, numpy arrays
OUTPUT_FOLDER_NAME = 'ASL_ALPHA_DATASET'
OUTPUT_DATA_DIR = os.path.join(os.getcwd(), OUTPUT_FOLDER_NAME)

# Alphabet signs
signs = np.array([[chr(ascii_val + 97)] for ascii_val in range(26)])

# Number of videos to capture
num_videos = 20

# Number of frames in each video
num_frames = 30

for sign in signs:
    print(f'Collecting data for sign: {sign[0]}')

    # Wait till user is ready to begin capture
    while True:
        # Read frame
        ret, frame = webcam.read()
    
        # Break if camera fails
        if not ret:
            break
    
        image, result = mp_detect(frame, holistic)
        draw_landmarks(image, result)
        i_height, i_width, _ = image.shape
        text_pos = (int(i_width * .025), int(i_height / 2))
        cv2.putText(image, f'Press r to begin capture for sign {sign[0]}',
                        text_pos, cv2.FONT_HERSHEY_SIMPLEX, 1.0,  (0,255,0), 2)
        cv2.imshow('Collecting data', image)
        if cv2.waitKey(1) == ord('r'):
            break
        
    for video in range(num_videos):
        # Create directory for data
        data_path = os.path.join(OUTPUT_DATA_DIR, str(sign[0]), f'{sign[0]}_vid_{video}')
        if not os.path.exists(data_path):
            os.makedirs(data_path)

        # Capturing data
        for n in range(num_frames):    
            # Read frame
            ret, frame = webcam.read()
        
            # Break if camera fails
            if not ret:
                break
        
            image, result = mp_detect(frame, holistic)
            draw_landmarks(image, result)

            cv2.putText(image, f'Collecting data for {sign[0]}', (15, 12), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
            cv2.putText(image, f'Video Number {video}', (15, 32), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
            cv2.putText(image, f'Frame Number {n}', (15, 52), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)

            if n == 0:
                cv2.putText(image, 'Starting Collection',
                            (120,200), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0,255,0), 4, cv2.LINE_AA)
                cv2.waitKey(2000)
                
            lm = extract_landmarks(result)
            np_path = os.path.join(data_path, str(n))
            cv2.imshow('Collecting data', image)
            np.save(np_path, lm)

            # Stop webcam if q or exit button is pressed
            if cv2.waitKey(1) == ord('q'):
                break


webcam.release()
cv2.destroyAllWindows()