import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';

export default function HomeScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

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

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync();
        if(video) {
          console.log("currently recording", video.uri)
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
      } catch (error) {
        console.error("Error stopping recording:", error);
      }
      setIsRecording(false);
    }
  };

  return (
    <View style={styles.container}>
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
        />
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
    overflow: 'hidden',
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
  },
  input: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "transparent",
    marginBottom: 20,
  },
});
