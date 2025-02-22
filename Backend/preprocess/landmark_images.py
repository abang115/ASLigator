import cv2
import numpy as np
import pandas as pd
import os

# Define hand connections (MediaPipe's skeletal structure)
HAND_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 4),         # Thumb
    (0, 5), (5, 6), (6, 7), (7, 8),         # Index
    (0, 9), (9, 10), (10, 11), (11, 12),    # Middle
    (0, 13), (13, 14), (14, 15), (15, 16),  # Ring
    (0, 17), (17, 18), (18, 19), (19, 20)   # Pinky
]

# Load the extracted landmark data
df = pd.read_csv("asl_landmarks.csv")

# Directory to save images
output_dir = "landmark_images"
os.makedirs(output_dir, exist_ok=True)

# CNN-friendly parameters
IMG_SIZE = 224  # Standard size for most CNNs
# RADIUS = 2       # Smaller radius for clearer patterns
CHANNEL = 1  # Grayscale images (better for CNNs)

# Iterate through dataset
for index, row in df.iterrows():
    label = row["label"]
    landmarks = row[1:].values.reshape(-1, 3)  # Reshape to (21, 3)

    # Normalize and clip coordinates
    x = (landmarks[:, 0] * IMG_SIZE).astype(int)
    y = (landmarks[:, 1] * IMG_SIZE).astype(int)
    x = np.clip(x, 0, IMG_SIZE - 1)
    y = np.clip(y, 0, IMG_SIZE - 1)

    # Create blank grayscale image
    image = np.zeros((IMG_SIZE, IMG_SIZE, CHANNEL), dtype=np.uint8)

    # Normalize and scale coordinates with safety clipping
    x_values = np.clip(landmarks[:, 0] * IMG_SIZE, 0, IMG_SIZE - 1).astype(int)
    y_values = np.clip(landmarks[:, 1] * IMG_SIZE, 0, IMG_SIZE - 1).astype(int)

    # Draw connections (white lines)
    for start, end in HAND_CONNECTIONS:
        cv2.line(image, (x[start], y[start]), (x[end], y[end]), 
                (255, 255, 255), thickness=2)
    
    # Dynamic sizing for dots as ratio of image size
    radius = max(2, int(IMG_SIZE / 80))
    # Draw landmarks as white dots
    for x, y in zip(x_values, y_values):
        cv2.circle(image, (x, y), radius, 255, -1)  # White dot (255) on black background

    # Save as grayscale PNG (lossless format)
    label_dir = os.path.join(output_dir, str(label))
    os.makedirs(label_dir, exist_ok=True)
    cv2.imwrite(os.path.join(label_dir, f"{index}.png"), image)

print(f"Generated {len(df)} landmark images in {output_dir}")