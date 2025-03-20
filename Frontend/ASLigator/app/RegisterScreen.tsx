import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native'
import { useForm, Controller } from "react-hook-form";
import React from 'react'
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth"
import db from "@react-native-firebase/database"
import firestore from "@react-native-firebase/firestore"
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const router = useRouter()
  const { control, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    }
  })

  const createProfile = async (response: FirebaseAuthTypes.UserCredential, data: FormData) => {
    db().ref(`/users/${response.user.uid}`).set({ 
      firstName: data.firstName,
      lastName: data.lastName,
     });
  };

  const register = async (data: FormData) => {
      if (data.email && data.password) {
        try {
          const response = await auth().createUserWithEmailAndPassword(
            data.email,
            data.password
          );
          if (response.user) {
            await createProfile(response, data)
            await firestore().collection("users").doc(response.user.uid).set({
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              profilePicture: "",
              createdAt: firestore.FieldValue.serverTimestamp(),
            });
            router.push("/HomeScreen")
          }
        } catch (e: any) {
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
    <KeyboardAvoidingView
        style={styles.container}
        behavior='padding'
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={30} color="#33418b" />
      </TouchableOpacity>
      <Text style={styles.headerText}>Register</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>First Name</Text>
        <Controller
          control={control}
          name="firstName"
          rules={{ required: "First name is required." }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.firstName && styles.errorInput]}
              placeholder="Ex: Jane"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName.message}</Text>}

        <Text style={styles.label}>Last Name</Text>
        <Controller
          control={control}
          name="lastName"
          rules={{ required: "Last name is required." }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.lastName && styles.errorInput]}
              placeholder="Ex: Doe"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName.message}</Text>}

        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: "Email is required.",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Invalid email address.",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.errorInput]}
              placeholder="janedoe@email.com"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

        <Text style={styles.label}>Password</Text>
        <Controller
          control={control}
          name="password"
          rules={{
            required: "Password is required.",
            minLength: { value: 6, message: "Minimum 6 characters required." },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.password && styles.errorInput]}
              placeholder="Minimum 6 characters"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

        <Text style={styles.label}>Confirm Password</Text>
        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: "Please confirm your password.",
            validate: (value) =>
              value === watch("password") || "Passwords do not match.",
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.errorInput]}
              placeholder="Re-enter password"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={ handleSubmit(register) }
          style={styles.button}          >
        <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.loginContainer}>
      <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/LoginScreen")}>
          <Text style={styles.loginLink}>Log In!</Text>
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
    marginBottom: 20,
    borderWidth: 1,
  },
  buttonContainer: {
    width: "60%",
    justifyContent: 'center',
    alignItems: "center",
    marginTop: 40,
  },
  button: {
    backgroundColor: "#0021A5",
    alignItems: "center",
    width: "100%",
    padding: 15,
    borderRadius: 10,
  },
  buttonOutline: {
    backgroundColor: "#fff",
    marginTop: 5,
    borderColor: '#0021A5',
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
    marginBottom: 30, 
  },
  backButton: {
    position: "absolute",
    top: 20, 
    left: 20,
    zIndex: 10,
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: 20,
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