import cv2
import mediapipe as mp
import numpy as np

# Open the default camera
webcam = cv2.VideoCapture(0)

# Get the default frame width and height
frame_width = int(webcam.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(webcam.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Define mediapipe hand tracking
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# Initialize the Hands object
hands = mp_hands.Hands(
    max_num_hands=2,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.5
)

# Height of the black bar at the bottom
BAR_HEIGHT = 50

while True:
    ret, frame = webcam.read()
    if not ret:
        break  # If camera fails, exit loop

    # Convert frame color to RGB for MediaPipe processing
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Process the frame with mediapipe
    results = hands.process(rgb_frame)

    # Draw landmarks and connections on the frame
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS
            )
    # Creates a new frame that is the height of the bar + the height of the webcam tall
    display_frame = np.zeros((frame_height + BAR_HEIGHT, frame_width, 3), dtype=np.uint8)

    # Copy the original webcam frame on top
    display_frame[0:frame_height, 0:frame_width] = frame

    text = "Awaiting Translation..."

    text_position = (10, frame_height + 35)  # 35 px down inside the bar
    cv2.putText(
        display_frame,
        text,
        text_position,
        cv2.FONT_HERSHEY_SIMPLEX,
        1.0,              
        (255, 255, 255),  
        2)

    # Display the combined image
    cv2.imshow('Hand Tracking', display_frame)

    # exit loop when q is pressed
    if cv2.waitKey(1) == ord('q'):
        break
    # exit loop when exit button is pressed
    if cv2.getWindowProperty('Hand Tracking', cv2.WND_PROP_VISIBLE) < 1:
        break
    

# Release the capture and destroy windows
webcam.release()
cv2.destroyAllWindows()
