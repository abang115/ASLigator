import cv2
import mediapipe as mp

# Open the default camera
webcam = cv2.VideoCapture(0)

# Get the default frame width and height
frame_width = int(webcam.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(webcam.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Define mediapipe hand tracking
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# Initialize the Hands object
hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.7, min_tracking_confidence=0.5)

while True:
    ret, frame = webcam.read()

    # Convert frame color to RGB for MediaPipe processing
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Use mediapipe to process each frame
    results = hands.process(rgb_frame)

    # Draw landmarks and connections on the frame
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS)

    # Display the captured frame
    cv2.imshow('Hand Tracking', frame)

    # Press 'q' to exit the loop
    if cv2.waitKey(1) == ord('q'):
        break

# Release the capture and destroy windows
webcam.release()
cv2.destroyAllWindows()
