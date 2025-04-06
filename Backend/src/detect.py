import cv2
import json
import os
import joblib
import mediapipe as mp
import numpy as np
from keras.api.models import load_model

# Load pre-trained model
model_path = os.path.join(os.getcwd(), '..', 'model', 'model.keras')
model = load_model(model_path)

model_weight = os.path.join(os.getcwd(), '..', 'model', 'model.weights.h5')
model.load_weights(model_weight)

# Load action label mapping
with open(os.path.join(os.getcwd(), '..', 'data', 'Processed_test_dataset', 'sign_mapping.json')) as f:
    sign_mapping = json.load(f)
actions = list(sign_mapping)

# Visualization colors
colors = [
    (245, 117, 16), (117, 245, 16), (16, 117, 245),
    (0, 117, 245), (16, 0, 245), (0, 245, 16),
    (50, 100, 245), (180, 117, 26), (216, 0, 245), (100, 50, 245)
]

# Mediapipe holistic setup
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils
holistic = mp_holistic.Holistic(min_detection_confidence=0.7, min_tracking_confidence=0.6)

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
    
    return np.concatenate([face, pose, right, left])

# Webcam setup
cap = cv2.VideoCapture(0)

# Constants
BAR_HEIGHT = 50
sequence, sentence, predictions = [], [], []
threshold = 0.5

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Process frame
    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = holistic.process(image_rgb)
    draw_landmarks(frame, results)

    # Extract keypoints
    keypoints = extract_landmarks(results)
    sequence.append(keypoints)
    sequence = sequence[-30:]
    
    text = "Awaiting Gesture..."
    if len(sequence) == 30:
        res = model.predict(np.expand_dims(sequence, axis=0))[0]
        
        pred_index = np.argmax(res)
        text = actions[pred_index]
        predictions.append(pred_index)

        print(text)  # Log to console

        # Smoothing
        if np.unique(predictions[-10:])[0] == pred_index and res[pred_index] > threshold:
            if not sentence or actions[pred_index] != sentence[-1]:
                sentence.append(actions[pred_index])
            if len(sentence) > 8:
                sentence = sentence[-8:]

        frame = prob_viz(res, actions, frame, colors)

    # Display with bottom bar
    frame_height, frame_width, _ = frame.shape
    display_frame = np.zeros((frame_height + BAR_HEIGHT, frame_width, 3), dtype=np.uint8)
    display_frame[0:frame_height] = frame

    # Text output
    cv2.putText(display_frame, text, (10, frame_height + 35), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)
    cv2.rectangle(display_frame, (0, 0), (640, 40), (245, 117, 16), -1)
    cv2.putText(display_frame, ' '.join(sentence), (3, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

    # Show window
    cv2.imshow('Hand Tracking', display_frame)

    # Exit conditions
    if cv2.waitKey(1) == ord('q'):
        break
    if cv2.getWindowProperty('Hand Tracking', cv2.WND_PROP_VISIBLE) < 1:
        break

cap.release()
cv2.destroyAllWindows()
