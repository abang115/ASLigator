import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useForm } from "react-hook-form";
import React from 'react'
import { getAuth, createUserWithEmailAndPassword } from "@react-native-firebase/auth"
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "@react-native-firebase/firestore"
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import InputField from '@/components/InputField'; // Custom InputField component

// FormData for form validation
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Register Screen function
export default function RegisterScreen() {
  const router = useRouter()
  const auth = getAuth()
  const firestore = getFirestore()

  // Handle form submission with required values
  const { control, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    }
  })

  // Register user function
  const register = async (data: FormData) => {
    // Check if valid email and password
    if (data.email && data.password) {
      try {
        // Call Firebase auth to create user with email and password
        const response = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        // On success, store user data in firestore
        if (response.user) {
          await setDoc(doc(collection(firestore, "users"), response.user.uid), {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            profilePicture: "",
            createdAt: serverTimestamp(),
          });
          // Navigate to Home Screen
          router.navigate("/HomeScreen")
        }
      } catch (e: any) {
        // Check error codes and display appropriate error
        if(e.code === "auth/email-already-in-use") {
          alert("That email is already in use.")
        }
        else {
          alert("There was an error creating your account.")
        }
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
      <Text style={styles.headerText} testID='header'>Register</Text>

      {/* Navigate to Login Screen */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.navigate("/LoginScreen")} testID='login'>
          <Text style={styles.loginLink}>Log In!</Text>
        </TouchableOpacity>
      </View>

      {/* Input Form */}
      <View style={styles.inputContainer}>
        {/* InputField requiring first name  */}
        <InputField control={control} name="firstName" label="First Name" placeholder="Ex: Jane" testID='first'
          rules={{ required: "First name is required." }}
        />

        {/* InputField requiring last name  */}
        <InputField control={control} name="lastName" label="Last Name" placeholder="Ex: Doe" testID='last'
          rules={{ required: "Last name is required." }}
        />

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

        {/* InputField requiring passwords to match */}
        <InputField control={control} name="confirmPassword" label="Confirm Password" placeholder="Re-enter password" secureTextEntry testID='confirm'
          rules={{
            required: "Please confirm your password.",
            validate: (value: string) =>
              value === watch("password") || "Passwords do not match.",
          }}
        />
      </View>

      {/* Register Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleSubmit(register)} style={styles.button} testID='registerButton'>
        <Text style={styles.buttonText}>Register</Text>
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
  input: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    width: "100%",
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
  buttonOutline: {
    backgroundColor: "#fff",
    marginTop: 5,
    borderColor: '#33418b',
    borderWidth: 2,
  },
  buttonText: {
    color: "white",
    fontWeight: '700',
    fontSize: 16,
  },
  buttonOutlineText: {
    color: '#0021A5',
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
  loginContainer: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 20, 
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "gray",
  },
  loginLink: {
    fontSize: 14,
    color: "#33418b",
    fontWeight: "bold",
  },
  errorInput: { 
    borderColor: "red" 
  },
  errorText: { 
    color: "red",
    marginTop: -20,
  },
})