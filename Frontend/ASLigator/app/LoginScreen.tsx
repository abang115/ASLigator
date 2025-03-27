import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native'
import React from 'react'
import { useForm, Controller } from "react-hook-form";
import auth from "@react-native-firebase/auth"
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import InputField from '../components/InputField';

interface FormData {
  email: string;
  password: string;
}
 
export default function LoginScreen() {
  const router = useRouter()
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
      defaultValues: {
        email: "",
        password: "",
      }
    })

  const login = async (data: FormData) => {
    if (data.email && data.password) {
      try {
        const response = await auth().signInWithEmailAndPassword(
          data.email,
          data.password
        );
        if (response.user) {
          router.push("/HomeScreen")
        }
      } catch (e: any) {
        alert("Incorrect email or password. Please try again!")
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#33418b" />
      </TouchableOpacity>

      <Text style={styles.headerText}>Login</Text>
      <View style={styles.inputContainer}>
        <InputField control={control} name="email" label="Email" placeholder="example@email.com"
          rules={{ 
            required: "Email is required.", 
            pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "Invalid email address." } 
          }}
        />
        <InputField control={control} name="password" label="Password" placeholder="Minimum 6 characters" secureTextEntry
          rules={{ 
            required: "Password is required.",
            minLength: { value: 6, message: "Minimum 6 characters required." } 
          }}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={ handleSubmit(login) }
          style={styles.button}
        >
        <Text style={styles.buttonText}>Login</Text>
         </TouchableOpacity>
      </View>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/RegisterScreen")}>
            <Text style={styles.signupLink}>Register!</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

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
    marginBottom: 30, 
  },
  backButton: {
    position: "absolute",
    top: 20, 
    left: 20,
    zIndex: 10,
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: "gray",
  },
  signupLink: {
    fontSize: 14,
    color: "#33418b",
    fontWeight: "bold",
  },
})