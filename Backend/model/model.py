import os
import json
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from keras.src.utils import to_categorical
from keras.src.models import Sequential
from keras.src.layers import LSTM, Dense, Dropout, BatchNormalization, Bidirectional, Conv1D, MaxPooling1D, Flatten, Input
from keras.src.callbacks import TensorBoard

# Read captured data
def read_data(data_path):
    sign_mapping, dataset, target = {}, [], []
    # Checks if file path exists
    if not os.path.exists(data_path):
        return sign_mapping, dataset, target
    
    # Expected filenames
    file_names = ['sign_mapping.json', 'full_dataset.npy', 'target.json']
    
    # Open json files and read data
    with open(os.path.join(data_path, file_names[0]), 'r') as f:
        sign_mapping = json.load(f)
        f.close()
    
    # Open npy file and read data
    dataset = np.load(os.path.join(data_path, file_names[1]))
    with open(os.path.join(data_path, file_names[2]), 'r') as f:
        target = json.load(f)
        f.close()
    
    return sign_mapping, dataset, target

# Create a basic LSTM Model To demo
def create_simple_model(): # Create model
    model = Sequential([
        # Input Layer
        Input(shape=(30,1662)),
        BatchNormalization(),
        
        # Captures short-term temporal features
        # First Hidden Layer
        Conv1D(filters=512, kernel_size=3, activation='relu', padding='same'),
        MaxPooling1D(pool_size=2, strides=2, padding='same'),
        BatchNormalization(),
        
        # Second Hidden Layer 
        Conv1D(filters=256, kernel_size=3, activation='relu', padding='same'),
        MaxPooling1D(pool_size=2, strides=2, padding='same'),
        BatchNormalization(),

        # Captures longer sequential features
        # Third Layer
        LSTM(512, return_sequences=True, dropout=0.1, recurrent_dropout=0.1),
        LSTM(256, return_sequences=False, dropout=0.1, recurrent_dropout=0.1),
        
        Dense(128, activation='relu'),
        Dropout(0.5),
        
        # Output Layer
        Dense(len(actions), activation='softmax'),
    ])
    return model

# Fit model based on the the inputted model
def fit_model(model, X_train, y_train, epochs): 
    log_dir = os.path.join('Logs')
    tb_callback = TensorBoard(log_dir=log_dir)
    model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])
    
    # Fit model with data
    result = model.fit(X_train, y_train, epochs=epochs, callbacks=[tb_callback])
    return result   

def compare_results(actions, res, y_test):
    for i in range(10):
        predicted = actions[np.argmax(res[i])][0]
        expected = actions[np.argmax(y_test[i])][0]
        print(f'Pred: {predicted} -> Exp: {expected}')
    
PREPROCESSED_DATA_PATH = os.path.join(os.getcwd(), '..', 'preprocess', 'Preprocessed_ASL_ALPHA_DATASET')

# Read preprocessed data
sign_mapping, dataset, target = read_data(PREPROCESSED_DATA_PATH)

# Cast map to list then to npy array
actions = np.array(list(sign_mapping.items())) # Output is in the format of ['sign', 'index']

# Extract shape data
num_samples, timesteps, features = np.array(dataset).shape
data_reshaped = np.array(dataset).reshape(-1, features)

# Normalize/Scale data using StandardScaler
scaler = StandardScaler()
data_scaled = scaler.fit_transform(data_reshaped)

# Scaled data
keypoints_normalized = data_scaled.reshape(num_samples, timesteps, features)

# Inputs for training 
X = keypoints_normalized
y = to_categorical(target).astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=True, random_state=42)

# Fit based on training dataset
model = create_simple_model()
fit_model(model, X_train, y_train, 20)

# Predict test
res = model.predict(X_test)

# Print predicted and expected
compare_results(actions, res, y_test)

# Output Accuracy
test_loss, test_acc = model.evaluate(X_test, y_test)
print(f"test acc: {test_acc*100:.4f}%")

# Save scaler data for detection
print('Saving scaling data to .save file')
joblib.dump(scaler, 'scaler.save')

# Save model to keras file
print('Saving model to .keras file')
model.save('lstm_model.keras')
model.save_weights('lstm_model.weights.h5')
del model