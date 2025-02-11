import numpy as np
import mediapipe as mp

mp_hands = mp.solutions.hands

def is_y_sign(hand_landmarks):
    # Get finger tip and base landmarks (adjusting for hand orientation)
    # This can be used for other letters, they just require changing which fingers are detected
    thumb_tip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP]
    index_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
    middle_tip = hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP]
    ring_tip = hand_landmarks.landmark[mp_hands.HandLandmark.RING_FINGER_TIP]
    pinky_tip = hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_TIP]

    pinky_bot = hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_MCP]
    thumb_bot = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_CMC]

    # Check if thumb and pinky are extended
    thumb_extended = abs(thumb_tip.x - thumb_bot.x) > 0.1
    pinky_extended = abs(pinky_tip.y - pinky_bot.y) > 0.1

    # Check if index, middle, and ring fingers are curled
    index_curled = index_tip.y > hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_MCP].y
    middle_curled = middle_tip.y > hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_MCP].y
    ring_curled = ring_tip.y > hand_landmarks.landmark[mp_hands.HandLandmark.RING_FINGER_MCP].y

    # Return True if the hand matches the ASL "Y" sign, otherwise returns False
    return thumb_extended and pinky_extended and index_curled and middle_curled and ring_curled

def identify_gesture(hand_landmarks):
    if is_y_sign(hand_landmarks):
        return "Detected: Y"
    return "No match"
