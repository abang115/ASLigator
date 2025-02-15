import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native'
import React, {useState} from 'react'
import auth from "@react-native-firebase/auth"
import { useRouter } from 'expo-router'
 
export default function index() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const login = async () => {
    if (email && password) {
      try {
        const response = await auth().signInWithEmailAndPassword(
          email,
          password
        );
        if (response.user) {
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
        <Text style={styles.headerText}>Login</Text>
        <View style={styles.inputContainer}>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={text => setEmail(text)}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={text => setPassword(text)}
                style={styles.input}
                secureTextEntry
            />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={ login }
            style={styles.button}
          >
          <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/RegisterScreen")}
            style={[styles.button, styles.buttonOutline]}
          >
            <Text style={styles.buttonOutlineText}>Register</Text>
          </TouchableOpacity>
        </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
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
    marginTop: 5,
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
    fontSize: 24,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginLeft: "10%",
    marginBottom: 15, 
  },
})