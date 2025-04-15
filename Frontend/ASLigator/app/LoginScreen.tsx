import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useForm} from "react-hook-form";
import { getAuth, signInWithEmailAndPassword } from "@react-native-firebase/auth"
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import InputField from '../components/InputField'; // Custom InputField component

// FormData for form validation
interface FormData {
  email: string;
  password: string;
}
 
// Login Screen function
export default function LoginScreen() {
  const router = useRouter()
  const auth = getAuth()

  // Handles form submission with email and password
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
    }
  })

  // Login function
  const login = async (data: FormData) => {
    // Check if valid email and password
    if (data.email && data.password) {
      try {
        // Call Firebase auth to sign in using email and password
        const response = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        // Navigate to home screen on success
        if (response.user) {
          router.navigate("/HomeScreen")
        }
      } catch (e: any) {
        alert("Incorrect email or password. Please try again!")
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>

      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID='back'>
          <Ionicons name="arrow-back" size={30} color="#33418b" />
      </TouchableOpacity>

      {/* Screen Header */}
      <Text style={styles.headerText} testID='header'>Login</Text>

      {/* Navigate to Register Screen */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.navigate("/RegisterScreen")} testID='register'>
            <Text style={styles.linkText}>Register!</Text>
        </TouchableOpacity>
      </View>

      {/* Input Form */}
      <View style={styles.inputContainer}>
        {/* InputField with regex email validation */}
        <InputField control={control} name="email" label="Email" placeholder="example@email.com" testID='email'
          rules={{ 
            required: "Email is required.", 
            pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "Invalid email address." } 
          }}
        />
        {/* InputField with minimum length of 6 to meet Firebase password requirement */}
        <InputField control={control} name="password" label="Password" placeholder="Minimum 6 characters" secureTextEntry testID='password'
          rules={{ 
            required: "Password is required.",
            minLength: { value: 6, message: "Minimum 6 characters required." } 
          }}
        />
      </View>

      {/* Login Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={ handleSubmit(login) } style={styles.button} testID='loginButton'>
        <Text style={styles.buttonText}>Login</Text>
         </TouchableOpacity>
      </View>

      {/* Navigate to Forgot Password Screen */}
      <View style={styles.forgotContainer}>
        <TouchableOpacity onPress={() => router.navigate("/ForgotScreen")} testID='forgot'>
            <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
  
    </KeyboardAvoidingView>
  )
}

//Create stylesheet for the screen
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
  input: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 5,
    marginBottom: 20,
    width: '100%',
    height: 40,
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
    fontSize: 48,
    fontWeight: "bold",
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: "absolute",
    top: 20, 
    left: 20,
    zIndex: 10,
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  forgotContainer: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: "gray",
  },
  linkText: {
    fontSize: 14,
    color: "#33418b",
    fontWeight: "bold",
    textDecorationLine: 'underline',
  },
})