import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';

// Landing Screen function
export default function Index() {
  const router = useRouter()

  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>

      {/* App Icon */}
      <Ionicons name="hand-right-outline" size={100} color="#33418b"/>
      <Text style={styles.headerText}>ASLigator</Text>

      {/* App Description */}
      <Text style={styles.infoText}>
        ASLigator will enable any user to point their camera at ASL gestures, 
        translating them into understandable text instantly
      </Text>
      
      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => router.navigate("/LoginScreen")} style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.navigate("/RegisterScreen")} style={[styles.button, styles.buttonOutline]}>
          <Text style={styles.buttonOutlineText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

// Create stylesheet for the screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    width: "60%",
    justifyContent: 'center',
    alignItems: "center",
    marginTop: 40,
  },
  button: {
    backgroundColor: "#33418b",
    alignItems: "center",
    width: "100%",
    padding: 15,
    borderRadius: 10,
  },
  buttonOutline: {
    backgroundColor: "#fff",
    marginTop: 20,
    borderColor: '#33418b',
    borderWidth: 2,
  },
  buttonText: {
    color: "white",
    fontWeight: '700',
    fontSize: 16,
  },
  buttonOutlineText: {
    color: '#33418b',
    fontWeight: '700',
    fontSize: 16,
  },
  headerText: {
    fontSize: 40,
    fontWeight: "bold",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50, 
    top: 30,
    color: "#33418b"
  },
  infoText: {
    fontSize: 20,
    marginLeft: 20,
    marginRight: 20,
    textAlign: 'center'
  },
})