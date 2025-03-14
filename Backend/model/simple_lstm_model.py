import os
import json
import numpy as np
from sklearn.model_selection import train_test_split
from keras.src.utils import to_categorical
from keras.src.models import Sequential
from keras.src.layers import LSTM, Dense, Dropout, BatchNormalization
from keras.src.callbacks import TensorBoard

def read_preprocessed_data(DATA_PATH):
    sign_mapping, dataset, target = {}, [], []
    # Checks if file path exists
    if not os.path.exists(DATA_PATH):
        return sign_mapping, dataset, target

    file_names = ['sign_mapping.json', 'full_dataset.npy', 'target.json']
    # Open json files and read data
    with open(os.path.join(DATA_PATH, file_names[0]), 'r') as f:
        sign_mapping = json.load(f)
        f.close()
    # Open npy fule and read data
    dataset = np.load(os.path.join(DATA_PATH, file_names[1]))
    with open(os.path.join(DATA_PATH, file_names[2]), 'r') as f:
        target = json.load(f)
        f.close()
    return sign_mapping, dataset, target

PREPROCESSED_DATA_PATH = os.path.join(os.getcwd(), '..', 'preprocess', 'Preprocessed_ASL_ALPHA_DATASET')

# Read preprocessed data
sign_mapping, dataset, target = read_preprocessed_data(PREPROCESSED_DATA_PATH)

print(sign_mapping)
print(np.array(dataset).shape)
print(np.array(target).shape)

actions = np.array(list(sign_mapping.items()))

X = dataset
y = to_categorical(target).astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
x_shape = np.array(X).shape

model = Sequential([
    LSTM(128, return_sequences=True, activation='relu', input_shape=(30,1629)),
    Dropout(0.2),
    BatchNormalization(),

    LSTM(64, return_sequences=True, activation='relu'),
    Dropout(0.2),
    BatchNormalization(),

    LSTM(128, return_sequences=True, activation='relu'),
    Dropout(0.2),
    BatchNormalization(),

    LSTM(64, return_sequences=False, activation='relu'),
    Dropout(0.2),
    BatchNormalization(),

    Dense(64, activation='relu'),
    Dropout(0.2),
    Dense(32, activation='relu'),
    Dropout(0.2),

    Dense(len(actions), activation='softmax'),
])
# Compile Model
model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])
# Fit based on training dataset
model.fit(X_train, y_train, epochs=75)
res = model.predict(X_test)

# print(res)
# print(res[0])
print(actions[np.argmax(res[0])][0])
print(actions[np.argmax(y_test[0])][0])

# Save model to keras file
model.save('lstm_model.keras')
del model