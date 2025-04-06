import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native'
import React from 'react'
import { useForm} from "react-hook-form";
import { getAuth, sendPasswordResetEmail} from "@react-native-firebase/auth"
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import InputField from '../components/InputField';

//FormData for form validation
interface FormData {
  email: string;
}

//Forget Password Screen function
export default function ForgotScreen() {
  const router = useRouter()
  const auth = getAuth()

  //Handles form submission
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      email: "",
    }
  })

  // Reset password function
  const reset = async (data: FormData) => {
    if (data.email ) {
      try {
        // Call FireBase auth to send reset email
        const response = await sendPasswordResetEmail(
          auth,
          data.email,
        );
        // On success, alert the user
        Alert.alert("Reset Password", "A link has been sent to your email!");
      } catch (e: any) {
        alert("Invalid email. Please try again!")
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>

      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#33418b" />
      </TouchableOpacity>

      {/* Screen Header */}
      <Text style={styles.headerText} testID='header'>Forgot Password</Text>

      {/* Info Text */}
      <Text style={styles.infoText}>
        Please enter the email associated with your account and follow the instructions sent to reset your password.
      </Text>

      {/* Input Form */}
      <View style={styles.inputContainer}>
        {/* Custom InputField component with regex email validation */}
        <InputField control={control} name="email" label="Email" placeholder="example@email.com"
          rules={{ 
            required: "Email is required.", 
            pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "Invalid email address." } 
          }}
        />
      </View>

      {/* Reset Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={ handleSubmit(reset) }
          style={styles.button}
        >
        <Text style={styles.buttonText}>Reset</Text>
         </TouchableOpacity>
      </View>
  
    </KeyboardAvoidingView>
  )
}

// Create stylesheet for the screen
const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
  },
  inputContainer: {
      width: '80%',
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
  buttonText: {
    color: "white",
    fontWeight: '700',
    fontSize: 16,
  },
  headerText: {
    fontSize: 40,
    fontWeight: "bold",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    top: 20, 
    left: 20,
    zIndex: 10,
  },
  infoText: {
    fontSize: 20,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 20,
    textAlign: 'center'
  },
})