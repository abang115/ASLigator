import cv2
import json
import os
import sys
import mediapipe as mp
import numpy as np
from keras.api.models import load_model
from pymediainfo import MediaInfo

root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(root_path)

from data.helper import draw_landmarks, extract_landmarks, mp_detect

def load_trained_model():
    # Load pre-trained model
    model_path = os.path.join(os.getcwd(), '..', 'model', 'model.keras')
    model = load_model(model_path)

    model_weight = os.path.join(os.getcwd(), '..', 'model', 'model.weights.h5')
    model.load_weights(model_weight)

    # Load action label mapping
    with open(os.path.join(os.getcwd(), '..', 'data', 'Processed_test_dataset', 'sign_mapping.json')) as f:
        sign_mapping = json.load(f)
    actions = list(sign_mapping)

    return model, actions

# Helper: Draw probability bars
def prob_viz(res, actions, input_frame, colors):
    output_frame = input_frame.copy()
    for num, prob in enumerate(res):
        cv2.rectangle(output_frame, (0, 60 + num * 40), (int(prob * 100), 90 + num * 40), colors[num], -1)
        cv2.putText(output_frame, actions[num], (0, 85 + num * 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    return output_frame

# Check for rotation
def check_rotation(filename):
    media_info = MediaInfo.parse(filename)
    for track in media_info.tracks:
        if track.track_type == "Video":
            # Some files might have a 'rotation' attribute, aka video taken in portrait mode
            if hasattr(track, "rotation") and int(float(track.rotation)) != 0:
                return True
    return False

def video_to_text(video):
    # Visualization colors
    colors = [
        (245, 117, 16), (117, 245, 16), (16, 117, 245),
        (0, 117, 245), (16, 0, 245), (0, 245, 16),
        (50, 100, 245), (180, 117, 26), (216, 0, 245), (100, 50, 245)
    ]

    # Path to video from front end
    FRONTEND_VIDEO = video

    # Mediapipe holistic setup
    mp_holistic = mp.solutions.holistic
    mp_drawings = mp.solutions.drawing_utils
    mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5)

    # Load up tained model and each action
    model, actions = load_trained_model()

    # Webcam setup
    webcam = cv2.VideoCapture(FRONTEND_VIDEO)

    # Set resolution (width x height), Should be the resolution of the mp4 sent by mobile device
    width = 1280
    height = 720
    webcam.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    webcam.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    
    # Constants
    sequence, sentence, predictions = [], [], []
    threshold = 0.5
    zoom_out_factor = 0.6  

    # Mobile device videos will have a rotation value attached to the metadata
    rotation_value = check_rotation(video)

    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        frame_count = 0
        while webcam.isOpened():
            ret, frame = webcam.read()
            if not ret:
                break

            frame_count += 1

            # Skip the first few frames, might be the user setting up 
            if frame_count <= 5:
                continue
            
            # Check if rotation is applied 
            if rotation_value:
                # Rotate 90 degrees clockwise
                frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)

            # Process frame
            image, results = mp_detect(frame, holistic)
            draw_landmarks(image, results, mp_holistic, mp_drawings)

            # Extract keypoints
            keypoints = extract_landmarks(results)
            sequence.append(keypoints)
            sequence = sequence[-30:]
            
            # Zoom out video to fit screen
            image = cv2.resize(image, None, fx=zoom_out_factor, fy=zoom_out_factor, interpolation=cv2.INTER_LINEAR)
            
            # Prediction logic
            if len(sequence) == 30:
                res = model.predict(np.expand_dims(sequence, axis=0))[0]
                pred_index = np.argmax(res)
                predictions.append(pred_index)

                # Smoothing, make sure last 10 predictions all match and that the prediction % is past the threshhold
                if np.unique(predictions[-10:])[0] == pred_index and res[pred_index] > threshold:
                    if not sentence or actions[pred_index] != sentence[-1]:
                        sentence.append(actions[pred_index])
                    
                    if len(sentence) > 7:
                        sentence = sentence[-8:]

                image = prob_viz(res, actions, image, colors)

            cv2.rectangle(image, (0,0), (1280, 40), (245, 117, 16), -1)
            cv2.putText(image, ' '.join(sentence), (3,30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
            
            # Show window
            cv2.imshow('Hand Tracking', image)

            # Exit conditions
            if cv2.waitKey(33) == ord('q'):
                break
            if cv2.getWindowProperty('Hand Tracking', cv2.WND_PROP_VISIBLE) < 1:
                break

    webcam.release()
    cv2.destroyAllWindows()
    return sentence