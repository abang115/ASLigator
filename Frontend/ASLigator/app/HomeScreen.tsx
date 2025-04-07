import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera'
import { useState, useRef, useEffect } from 'react'
import { Button, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import axios from 'axios'
import * as Speech from 'expo-speech';

// Retrieve API URL from .env file
const API_URL = process.env.EXPO_PUBLIC_API_URL

export default function HomeScreen() {
  const router = useRouter();

  // Set camera direction
  const [facing] = useState<CameraType>('back');

  // Permission settings for camera and microphone
  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const cameraRef = useRef<CameraView | null>(null);

  // State to check if currently recording
  const [isRecording, setIsRecording] = useState(false);

  // Store and set translated text
  const [translatedText, setTranslatedText] = useState<string>('');;

  // Speak function for text-to-speech 
  const speak = (thingToSay: string) => {
    Speech.speak(thingToSay);
  };

  // Check current camera and microphone permissions
  if (!camPermission || ! micPermission) {
    return <View />;
  }

  // If permission not granted, ask for camera and microphone permissions
  if (!camPermission.granted || !micPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access the camera and microphone</Text>
        <Button onPress={requestCamPermission} title="Grant Camera Permission" />
        <Button onPress={requestMicPermission} title="Grant Microphone Permission" />
      </View>
    );
  }

  // Function to send video to Flask server
  const sendToServer = async (videoUri: string) => {
    try {
      let formData = new FormData();

      // Split video Uri to get type and name
      const uriParts = videoUri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      // Store into formData object
      formData.append("video", {
        uri: videoUri,
        type: `video/${fileType}`,
        name: `video.${fileType}`,
      } as any);

      // Upload video to Flask server
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // On success, display message
      if (res.data.message) {
        alert('Video uploaded successfully!')
        setTranslatedText(res.data.result.join(" "))
      }
    } catch (error) {
      console.error('Error uploading video:', error)
    }
  };

  // Start recording function
  const startRecording = async () => {
    // Check if camera is on
    if (cameraRef.current) {
      try {
        // Set isRecording to true
        setIsRecording(true)

        // Start recording video
        const video = await cameraRef.current.recordAsync()

        // If video is being captured, log into console and call sendToServer 
        if(video) {
          console.log("currently recording", video.uri)
          sendToServer(video.uri)
        }
      } catch (error) {
        console.error("Error starting recording:", error)
      }
    }
  };

  // Stop recording function
  const stopRecording = async () => {
    if (cameraRef.current) {
      try {
        // Stop camera from recording and set isRecording to false
        cameraRef.current.stopRecording()
        console.log("stopped recording")
        setIsRecording(false);

      } catch (error) {
        console.error("Error stopping recording:", error)
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.settingsButton} onPress={() => router.navigate("/SettingsScreen")}>
        <Ionicons name="settings" size={30} color="white"/>
      </TouchableOpacity>

      <TouchableOpacity style={styles.profileButton} onPress={() => router.navigate("/ProfileScreen")}>
        <Ionicons name="person" size={30} color="white"/>
      </TouchableOpacity>
      
      <CameraView
        mode="video"
        ref={cameraRef} 
        style={styles.camera} 
        facing={facing}
       >
        <View style={styles.buttonContainer}>
          {!isRecording ? (
            <TouchableOpacity onPress={startRecording} style={styles.button}>
              <Text style={styles.text}>Start Recording</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={stopRecording} style={[styles.button]}>
              <Text style={styles.text}>Stop Recording</Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          multiline={true}
          textAlignVertical="top"
          value={translatedText}
          editable={false}
        />
        <TouchableOpacity style={styles.speechButton} onPress={() => speak(translatedText)}>
            <Ionicons name='mic-outline' size={30} color="white"/>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    width: '90%',
    height: '70%',
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    marginTop: 55,
    borderColor: "#33418b",
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  inputContainer: {
    width: '90%',
    height: '20%',
    borderWidth: 2,
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 10,
    borderColor: "#33418b",
  },
  input: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  settingsButton: {
    display: 'flex',
    position: 'absolute',
    top: 0,
    left: 15,
    backgroundColor: "#33418b",
    borderRadius: 25,
    width: 50,
    height: 50, 
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileButton: {
    display: 'flex',
    position: 'absolute',
    top: 0,
    right: 15,
    backgroundColor: "#33418b",
    borderRadius: 25,
    width: 50,
    height: 50, 
    justifyContent: 'center',
    alignItems: 'center'
  },
  speechButton: {
    display: 'flex',
    position: 'absolute',
    backgroundColor: "#33418b",
    borderRadius: 25,
    width: 50,
    height: 50, 
    bottom: 10,
    right: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
});
