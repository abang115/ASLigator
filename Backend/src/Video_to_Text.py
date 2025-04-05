import cv2
import json
import os
import sys
import mediapipe as mp
import numpy as np
from keras.api.models import load_model

root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(root_path)

from data.helper import draw_landmarks, extract_landmarks

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

def video_to_text(video):
    # Visualization colors
    colors = [
        (245, 117, 16), (117, 245, 16), (16, 117, 245),
        (0, 117, 245), (16, 0, 245), (0, 245, 16),
        (50, 100, 245), (180, 117, 26), (216, 0, 245), (100, 50, 245)
    ]

    # Path to video from front end
    FRONTEND_VIDEO = video
    print(os.getcwd())
    # Mediapipe holistic setup
    mp_holistic = mp.solutions.holistic
    mp_drawings = mp.solutions.drawing_utils
    mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5)

    # Load up tained model and each action
    model, actions = load_trained_model()

    # Webcam setup
    webcam = cv2.VideoCapture(FRONTEND_VIDEO)

    # Constants
    width = 1280
    height = 720
    webcam.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    webcam.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    sequence, sentence, predictions = [], [], []
    threshold = 0.5


    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        frame_count = 0
        while webcam.isOpened():
            ret, frame = webcam.read()
            if not ret:
                break

            frame_count += 1

            # Skip the first few frames for 
            if frame_count <= 5:
                continue

            # Process frame
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = holistic.process(image_rgb)
            draw_landmarks(frame, results, mp_holistic, mp_drawings)

            # Extract keypoints
            keypoints = extract_landmarks(results)
            sequence.append(keypoints)
            sequence = sequence[-30:]
            
            text = "Awaiting Gesture..."
            # Prediction logic
            if len(sequence) == 30:
                res = model.predict(np.expand_dims(sequence, axis=0))[0]
                pred_index = np.argmax(res)
                text = actions[pred_index]
                predictions.append(pred_index)

                # Smoothing, make sure last 10 predictions all match and that the prediction % is past the threshhold
                if np.unique(predictions[-10:])[0] == pred_index and res[pred_index] > threshold:
                    
                    if not sentence or actions[pred_index] != sentence[-1]:
                        sentence.append(actions[pred_index])
                    
                    if len(sentence) > 7:
                        sentence = sentence[-8:]

                frame = prob_viz(res, actions, frame, colors)

            cv2.rectangle(frame, (0,0), (width, 40), (245, 117, 16), -1)
            cv2.putText(frame, ' '.join(sentence), (3,30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)

            # Show window
            cv2.imshow('Hand Tracking', frame)

            # Exit conditions
            if cv2.waitKey(1) == ord('q'):
                break
            if cv2.getWindowProperty('Hand Tracking', cv2.WND_PROP_VISIBLE) < 1:
                break

    webcam.release()
    cv2.destroyAllWindows()
    return sentence

if __name__ == "__main__":
    sentence = video_to_text()
    print(sentence)