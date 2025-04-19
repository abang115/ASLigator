import os 
import json
import numpy as np
#from sklearn.model_selection import train_test_split
#from keras.src.utils import to_categorical

def extract_signs(DATA_PATH):
    sign_mapping, dataset, target  = {}, [], []
    # Return empy map and lists when path does not exists
    if not os.path.exists(DATA_PATH):
        return sign_mapping, dataset, target
    count = 0
    # Loop through each sign 
    for sign in os.listdir(DATA_PATH):
        sign_mapping[sign] = count
        count += 1
        print('Working on sign ' + sign)
        # Video Directory
        vid_dir = os.path.join(DATA_PATH, sign)
        vids = os.listdir(vid_dir)
        # Loop through each video
        for vid in vids:
            # Path to each video
            window = np.load(os.path.join(vid_dir, vid))
        
            # Append full video to array
            target.append(sign_mapping[sign])
            print(f'{vid} ') 
            # print(str(np.array(window).shape))
            dataset.append(window)
            
    return sign_mapping, dataset, target

DATA_DIR = 'Processed_NPY_test_dataset'
DATA_PATH = os.path.join(os.getcwd(), DATA_DIR)
OUTPUT_PATH = os.path.join(os.getcwd(), 'Processed_test_dataset')

if not os.path.exists(OUTPUT_PATH):
    os.makedirs(OUTPUT_PATH)

print('Extracting data!')
sign_mapping, dataset, target = extract_signs(DATA_PATH)

# Export signs to json file
with open(os.path.join(OUTPUT_PATH, 'sign_mapping.json'), 'w') as f:
    json.dump(sign_mapping, f, indent=4)
    f.close()

# Export target col
with open(os.path.join(OUTPUT_PATH, 'target.json'), 'w') as f:
    json.dump(target, f, indent=4)
    f.close()

# Export Preprocessed video data
np.save(os.path.join(OUTPUT_PATH, 'full_dataset'), dataset)