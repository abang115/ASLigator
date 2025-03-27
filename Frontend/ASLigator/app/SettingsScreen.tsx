import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View, Switch} from 'react-native'
import React, {useState} from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import ToggleSwitch from '@/components/ToggleSwitch';
 
export default function SettingsScreen() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => setIsDarkMode((previousState) => !previousState);

  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={30} color="#33418b" />
        </TouchableOpacity>
        <View style={styles.settingsButton}>
          <Ionicons name="settings" size={100} color="white"/>
        </View>
        <Text style={styles.headerText}>Settings</Text>
        <ToggleSwitch isToggled={isDarkMode} toggleItem={toggleDarkMode} toggleLabel='Dark Mode'/> 
     </KeyboardAvoidingView>
   )
 }
 
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
   settingsButton: {
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
    color: "#33418b"
   },
   toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
 })