import cv2
import mediapipe as mp
import os
import numpy as np
import pandas as pd

# Define mediapipe hand tracking
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# Initialize the Hands object
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1, min_detection_confidence=0.5)

# Path to dataset
dataset_path = os.getcwd() + "\\..\\data\\asl_dataset"
output_csv = "asl_landmarks.csv"
# print(dataset_path)

data = []
columns =[]

# Create header
columns.append('label')
for i in range(21):
    columns.extend([f'lm_{i}_x', f'lm_{i}_y', f'lm_{i}_z'])

# Go through dataset directory
for label in os.listdir(dataset_path):
    label_path = os.path.join(dataset_path, label)
    # print(label_path)

    if not os.path.isdir(label_path):
        continue

    # Loop through each image in the directory
    for image in os.listdir(label_path):
        image_path = os.path.join(label_path,image)
        # print(image_path)
        frame = cv2.imread(image_path)

        if frame is None:
            continue

        # Convert image to RGB
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        row = []
        row.append(label)
        # If landmarks exists or If hand is detected
        if results.multi_hand_landmarks:
            # Collect data on first hand
            hand_landmarks = results.multi_hand_landmarks[0]
            # Collect x, y, z coordinates of each landmark
            for lm in hand_landmarks.landmark:
                row.append(lm.x)
                row.append(lm.y)
                row.append(lm.z)
            
            # Append landmarks to data
            data.append(row)
    print("Process " + label + " Completed")

# Output the data to a csv
df = pd.DataFrame(data, columns=columns)
df.to_csv(output_csv, index=False)
print(f"Data saved to {output_csv}")
