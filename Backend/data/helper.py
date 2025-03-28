import cv2
import mediapipe as mp
import numpy as np

# Process image depending on model
def mp_detect(image: np.ndarray, model: mp.solutions.holistic.Holistic):

    if not isinstance(image, np.ndarray):
        raise ValueError("Expected 'image' to be a NumPy array, but got {}".format(type(image)))

    if not hasattr(model, 'process'):
        raise ValueError("Expected 'model' to have a 'process' method, but got {}".format(type(model)))

    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # Convert BGR to RGB
    image.flags.writeable = False
    results = model.process(image)                  # Make prediction based on mp.solutions model
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)  # Convert RGB back to BGR
    return image, results

def draw_landmarks(image, results, mp_holistic, mp_drawings):
    if not isinstance(image, np.ndarray):
        raise ValueError("Expected 'image' to be a NumPy array, but got {}".format(type(image)))

    if not hasattr(results, 'pose_landmarks'):
        raise ValueError("Invalid 'results' object. Expected MediaPipe detection results.")

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
    if not hasattr(results, 'pose_landmarks'):
        raise ValueError("Invalid 'results' object. Expected MediaPipe detection results.")

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