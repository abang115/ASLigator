import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native'
import React, {useState} from 'react'
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth"
import db from "@react-native-firebase/database"
import { useRouter } from 'expo-router'

export default function RegisterScreen() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const createProfile = async (response: FirebaseAuthTypes.UserCredential) => {
    db().ref(`/users/${response.user.uid}`).set({ firstName, lastName });
  };

  const register = async () => {
    if (email && password) {
      try {
        const response = await auth().createUserWithEmailAndPassword(
          email,
          password
        );
        if (response.user) {
          await createProfile(response)
          router.push("/HomeScreen")
        }
      } catch (e) {
        alert("Error!")
      }
    }
  };

  return (
    <KeyboardAvoidingView
        style={styles.container}
        behavior='padding'
    >
        <Text style={styles.headerText}>Register</Text>
        <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
                placeholder="Ex: Jane"
                value={firstName}
                onChangeText={text => setFirstName(text)}
                style={styles.input}
            />
            <Text style={styles.label}>Last Name</Text>
            <TextInput
                placeholder="Ex: Doe"
                value={lastName}
                onChangeText={text => setLastName(text)}
                style={styles.input}
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
                placeholder="janedoe@email.com"
                value={email}
                onChangeText={text => setEmail(text)}
                style={styles.input}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
                placeholder="Minimum 6 characters"
                value={password}
                onChangeText={text => setPassword(text)}
                style={styles.input}
                secureTextEntry
            />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={ register }
            style={styles.button}
          >
          <Text style={styles.buttonText}>Register</Text>
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
})