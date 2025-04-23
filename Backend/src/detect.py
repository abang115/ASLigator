import cv2
import json
import os
import mediapipe as mp
import numpy as np
import sys
from keras.api.models import load_model

root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(root_path)

from data.helper import draw_landmarks, extract_landmarks, mp_detect

# Load pre-trained model
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

# Helper: Draw landmarks
def draw_landmarks(image, results):
    mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
    mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
    mp_drawing.draw_landmarks(image, results.face_landmarks, mp_holistic.FACEMESH_TESSELATION)
    mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS)

# Helper: Extract keypoints
def extract_landmarks(results):
    def flatten_landmarks(landmarks, dimensions=3):
        return np.array([[getattr(res, attr) for attr in ('x', 'y', 'z')[:dimensions]] for res in landmarks.landmark]).flatten()
    
    left = flatten_landmarks(results.left_hand_landmarks) if results.left_hand_landmarks else np.zeros(21 * 3)
    right = flatten_landmarks(results.right_hand_landmarks) if results.right_hand_landmarks else np.zeros(21 * 3)
    face = flatten_landmarks(results.face_landmarks) if results.face_landmarks else np.zeros(468 * 3)
    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33 * 4)
    
    return np.concatenate([pose, face, right, left])

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

# Visualization colors
colors = [
    (245, 117, 16), (117, 245, 16), (16, 117, 245),
    (0, 117, 245), (16, 0, 245), (0, 245, 16),
    (50, 100, 245), (180, 117, 26), (216, 0, 245), (100, 50, 245)
]

# Load Model
model, actions = load_trained_model()

# Mediapipe holistic setup
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils
holistic = mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Webcam setup
cap = cv2.VideoCapture(0)

# Set resolution (width x height), Should be the resolution of the mp4 sent by mobile device
width = 1280
height = 720
cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

# Constants
BAR_HEIGHT = 50
sequence, sentence, predictions = [], [], []
threshold = 0.5
# Zooms out the portrait mode image to fit on screen
zoom_out_factor = 0.6

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Change to portrait mode
    frame = resize_portrait(frame)

    # Process frame
    image, results = mp_detect(frame, holistic)
    draw_landmarks(image, results)

    # Extract keypoints
    keypoints = extract_landmarks(results)
    sequence.append(keypoints)
    sequence = sequence[-30:]
    
    # Zoom out video to fit screen
    image = cv2.resize(image, None, fx=zoom_out_factor, fy=zoom_out_factor, interpolation=cv2.INTER_LINEAR) 
    
    text = "Awaiting Gesture..."
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

    # Display with bottom bar
    image_height, image_width = image.shape[:2]
    display_frame = np.zeros((image_height + BAR_HEIGHT, image_width, 3), dtype=np.uint8)
    display_frame[0:image_height] = image

    # Text output
    cv2.putText(display_frame, text, (10, image_height + 35), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)
    cv2.rectangle(display_frame, (0, 0), (720, 40), (245, 117, 16), -1)
    cv2.putText(display_frame, ' '.join(sentence), (3, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

    # Show window
    cv2.imshow('Hand Tracking', display_frame)

    # Exit conditions
    if cv2.waitKey(33) == ord('q'):
        break
    if cv2.getWindowProperty('Hand Tracking', cv2.WND_PROP_VISIBLE) < 1:
        break

cap.release()
cv2.destroyAllWindows()
