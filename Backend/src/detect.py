import cv2
import mediapipe as mp
import numpy as np
from identify import identify_gesture

# Open the default camera
webcam = cv2.VideoCapture(0)

# Define mediapipe hand tracking
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# Initialize the Hands object
hands = mp_hands.Hands(
    max_num_hands=1,  # Detect only one hand
    min_detection_confidence=0.7,
    min_tracking_confidence=0.5
)

# Height of the black bar at the bottom
BAR_HEIGHT = 50

while True:
    ret, frame = webcam.read()
    if not ret:
        break  # Exit if the camera feed fails

    # Convert frame to RGB for processing
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb_frame)

    # Default message
    text = "Awaiting Gesture..."

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            # Draw hand landmarks
            mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            text = identify_gesture(hand_landmarks)

    # Creates a new frame that is the height of the bar + the height of the webcam tall
    frame_height, frame_width, _ = frame.shape
    display_frame = np.zeros((frame_height + BAR_HEIGHT, frame_width, 3), dtype=np.uint8)
     # Copy the original webcam frame on top
    display_frame[0:frame_height, 0:frame_width] = frame

    # Display detected text if detected
    text_position = (10, frame_height + 35)
    cv2.putText(display_frame, text, text_position, cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)

    # Show the frame
    cv2.imshow('Hand Tracking', display_frame)

    # Exit when 'q' is pressed
    if cv2.waitKey(1) == ord('q'):
        break
     # exit loop when exit button is pressed
    if cv2.getWindowProperty('Hand Tracking', cv2.WND_PROP_VISIBLE) < 1:
        break


webcam.release()
cv2.destroyAllWindows()
