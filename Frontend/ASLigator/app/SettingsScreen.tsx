import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import React, {useState, useEffect} from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, doc, updateDoc, getDoc } from "@react-native-firebase/firestore"
import { getAuth } from "@react-native-firebase/auth"
import Slider from '@react-native-community/slider';
 
export default function SettingsScreen() {
  const router = useRouter()
  const [selectedVoice, setSelectedVoice] = useState("en-au-x-aub-network");
  const [selectedSpeed, setSelectedSpeed] = useState(1);
  const [selectedPitch, setSelectedPitch] = useState(1);
  const auth = getAuth()
  const firestore = getFirestore()

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(firestore, "users", userId);
        const docSnap = await getDoc(userDocRef);
      
        if (docSnap.exists) {
          const data = docSnap.data();
          setSelectedVoice(data?.voiceSetting);
          setSelectedSpeed(data?.speedSetting);
          setSelectedPitch(data?.pitchSetting);
        }
      }
    };
  loadSettings();
  }, []);

  // Handle voice changes from the 4 options
  const handleVoiceChange = async (voice: string) => {
    setSelectedVoice(voice);
    const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(firestore, "users", userId);
        await updateDoc(userDocRef, { voiceSetting: voice });
    }
  };

  // Handle voice rate changes from the 3 options
  const handleSpeedChange = async (speed: number) => {
    setSelectedSpeed(speed);
    const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(firestore, "users", userId);
        await updateDoc(userDocRef, { speedSetting: speed });
    }
  };

  // Handle voice pitch changes from 0 to 2
  const handlePitchChange = async (pitch: number) => {
    setSelectedPitch(pitch);
    const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(firestore, "users", userId);
        await updateDoc(userDocRef, { pitchSetting: pitch });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>

      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID='back'>
        <Ionicons name="arrow-back" size={30} color="#33418b" />
      </TouchableOpacity>

      {/* Settings Screen Icon */}
      <View style={styles.settingsIcon} testID='settingsIcon'>
        <Ionicons name="settings" size={100} color="white"/>
      </View>
      <Text style={styles.headerText} testID='header'>Settings</Text>

      {/* Voice Preference Dropdown */}
      <Text style={styles.label}>Voice Preference</Text>
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={selectedVoice}
          onValueChange={handleVoiceChange}
          style={styles.pickerStyle}
          testID='voiceChange'
        >
          <Picker.Item label="Male Voice 1" value="en-au-x-aub-network"/>
          <Picker.Item label="Male Voice 2" value="en-gb-x-rjs-network"/>
          <Picker.Item label="Female Voice 1" value="en-GB-language"/>
          <Picker.Item label="Female Voice 2" value="en-AU-language"/>
        </Picker>
      </View>

      {/* Voice Speed Dropdown */}
      <Text style={styles.label}>Voice Speed</Text>
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={selectedSpeed}
          onValueChange={handleSpeedChange}
          style={styles.pickerStyle}
          testID='speedChange'
        >
          <Picker.Item label="Normal" value={1}/>
          <Picker.Item label="Fast" value={1.5}/>
          <Picker.Item label="Slow" value={0.5}/>
        </Picker>
      </View>

      {/* Voice Pitch Slider */}
      <Text style={styles.label}>Voice Pitch</Text>
      <View style={styles.dropdownContainer}>
        <Slider
          style={styles.sliderContainer}
          minimumValue={0}
          maximumValue={2}
          value={selectedPitch}
          onValueChange={handlePitchChange}
          minimumTrackTintColor="#33418b"
          maximumTrackTintColor="#000000"
          thumbTintColor='#33418b'
          testID='pitchChange'
        />
      </View>
     </KeyboardAvoidingView>
   )
 }
 
 // Create stylesheet for the screen
 const styles = StyleSheet.create({
   container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
   },
   backButton: {
     position: "absolute",
     top: 20, 
     left: 20,
     zIndex: 10,
   },
   settingsIcon: {
    backgroundColor: "#33418b",
    borderRadius: 100,
    height: 150,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center'
   },
   headerText: {
    fontSize: 40,
    fontWeight: "bold",
    justifyContent: 'center',
    alignItems: 'center',
    color: "#33418b",
    marginBottom: 20,
   },
   toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  pickerStyle: {
    color: '#33418b',
    width: '100%',
  },
  dropdownContainer: {
    borderWidth: 2,
    borderColor: '#33418b',
    borderRadius: 12,
    paddingHorizontal: 10,
    width: '70%',
    height: 60,
    marginBottom: 20,
  },
  sliderContainer: {
    width: '100%',
    height: 55,
    color: '#33418b',
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginLeft: 60
  },
 })