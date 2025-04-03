import os
import json
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from keras.src.utils import to_categorical
from keras.src.models import Sequential
from keras.src.layers import LSTM, Dense, Dropout, BatchNormalization, Input, Bidirectional, Conv1D, MaxPooling1D, Flatten
from keras.src.callbacks import TensorBoard

log_dir = os.path.join('Logs')
tb_callback = TensorBoard(log_dir=log_dir)

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
    # Open npy file and read data
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

num_samples, timesteps, features = np.array(dataset).shape
data_reshaped = np.array(dataset).reshape(-1, features)

scaler = StandardScaler()
data_scaled = scaler.fit_transform(data_reshaped)
keypoints_normalized = data_scaled.reshape(num_samples, timesteps, features)

X = keypoints_normalized
y = to_categorical(target).astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=True, stratify=y, random_state=42)
x_shape = np.array(X).shape

model = Sequential([
    Input(shape=(30,1662)),
    BatchNormalization(),
    
    Conv1D(filters=512, kernel_size=3, activation='relu', padding='same'),
    MaxPooling1D(pool_size=2, strides=2, padding='same'),
    BatchNormalization(),
    Conv1D(filters=256, kernel_size=3, activation='relu', padding='same'),
    MaxPooling1D(pool_size=2, strides=2, padding='same'),
    BatchNormalization(),
    
    LSTM(512, return_sequences=False, dropout=0.1, recurrent_dropout=0.1),
    Dense(128, activation='relu'),
    Dropout(0.5),
    
    # Dense(512, activation='relu'),
    # Dropout(0.3),
    
    # Flatten(),
    
    #Bidirectional(LSTM(256, return_sequences=True)),
    #BatchNormalization(),
    #Dropout(0.5),
    
    # Bidirectional(LSTM(256, return_sequences=True)),
    # BatchNormalization(),
    # Dropout(0.5),

    # Bidirectional(LSTM(128, return_sequences=False)),
    # BatchNormalization(),
    
    # LSTM(128, return_sequences=True, activation='relu'),
    # Dropout(0.4),
    # BatchNormalization(),

    # LSTM(64, return_sequences=False, activation='relu'),
    # Dropout(0.3),
    # BatchNormalization(),

    # LSTM(64, return_sequences=False, activation='relu'),
    # Dropout(0.2),
    # BatchNormalization(),

    # Dense(64, activation='relu'),
    # Dropout(0.2),
    
    # Dense(32, activation='relu'),
    # Dropout(0.2),

    # Dense(64, activation='relu'),
    # Dropout(0.3),
    
    Dense(len(actions), activation='softmax'),
])

# Compile Model
model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])

# Fit based on training dataset
model.fit(X_train, y_train, epochs=15, callbacks=[tb_callback])
res = model.predict(X_test)

print(actions[np.argmax(res[0])][0])
print(actions[np.argmax(y_test[0])][0])

test_loss, test_acc = model.evaluate(X_test, y_test)
print(f"test acc: {test_acc*100:.2f}%")
# Save model to keras file
model.save('lstm_model.keras')
del model