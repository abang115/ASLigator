import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera'
import { useState, useRef } from 'react'
import { Button, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import axios from 'axios'
import * as Speech from 'expo-speech';

export default function HomeScreen() {
  const router = useRouter();
  const [facing] = useState<CameraType>('back');
  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const cameraRef = useRef<CameraView | null>(null);

  const speak = (thingToSay: string) => {
    Speech.speak(thingToSay);
  };

  if (!camPermission || ! micPermission) {
    return <View />;
  }

  if (!camPermission.granted || !micPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access the camera and microphone</Text>
        <Button onPress={requestCamPermission} title="Grant Camera Permission" />
        <Button onPress={requestMicPermission} title="Grant Microphone Permission" />
      </View>
    );
  }

  const uploadVideo = async (videoUri: string) => {
    try {
      let formData = new FormData();

      const uriParts = videoUri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      formData.append("video", {
        uri: videoUri,
        type: `video/${fileType}`,
        name: `video.${fileType}`,
      } as any);
  
      const API_URL = process.env.EXPO_PUBLIC_API_URL
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (res.data.message) {
        alert('Video uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync();
        if(video) {
          console.log("currently recording", video.uri)
          uploadVideo(video.uri)
        }
      } catch (error) {
        console.error("Error starting recording:", error);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current) {
      try {
        cameraRef.current.stopRecording();
        console.log("stopped recording")
        setIsRecording(false);

      } catch (error) {
        console.error("Error stopping recording:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.settingsButton} onPress={() => router.push("/SettingsScreen")}>
        <Ionicons name="settings" size={30} color="white"/>
      </TouchableOpacity>

      <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/ProfileScreen")}>
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
          onChangeText={text => setTranslatedText(text)}
          value={translatedText}
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
