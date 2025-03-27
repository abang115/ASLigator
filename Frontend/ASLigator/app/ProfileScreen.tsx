import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View, Alert, Image} from 'react-native'
import React, {useState, useEffect} from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'
import storage from '@react-native-firebase/storage';
import auth from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"
 
export default function ProfileScreen() {
  const router = useRouter()
  const [image, setImage] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ firstName?: string; lastName?: string; email?: string }>({});

  useEffect(() => {
    const loadProfilePicture = async () => {
      const userId = auth().currentUser?.uid;
      if (userId) {
        const doc = await firestore().collection('users').doc(userId).get();
        if (doc.exists) {
          setUserData({
            firstName: doc.data()?.firstName || '',
            lastName: doc.data()?.lastName || '',
            email: doc.data()?.email || '',
          });
          setImage(doc.data()?.profilePicture);
        }
      }
    };
    loadProfilePicture();
  }, []);
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
    });
  
    if (!result.canceled) {
        const selectedImage = result.assets[0].uri;
        setImage(selectedImage);
        await uploadImage(selectedImage); 
    }
  };

  const uploadImage = async (imageUri: string) => {
    const userId = auth().currentUser?.uid;
    if (!userId || !imageUri) return;

    const fileName = `profile_pictures/${userId}.jpg`;
    const reference = storage().ref(fileName);

    try {
      await reference.putFile(imageUri);
      const url = await reference.getDownloadURL();
      await saveProfilePictureUrl(url);
      Alert.alert("Upload Successful", "Your profile picture has been updated!");
    } catch (error) {
      console.error(error);
      Alert.alert("Upload Failed", "Please try again.");
    }
  };

  const saveProfilePictureUrl = async (url: string) => {
    const userId = auth().currentUser?.uid;
    if (userId) {
      await firestore().collection('users').doc(userId).set(
        { profilePicture: url },
        { merge: true }
      );
    }
  };

  const signOut= async () => {
    try {
      await auth().signOut()
      router.push("/")
    }
    catch (e) {
      alert("Error, could not sign out!")
    }
  };
  
  return (
     <KeyboardAvoidingView style={styles.container} behavior='padding'>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <Ionicons name="arrow-back" size={30} color="#33418b" />
        </TouchableOpacity>

      <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person" size={100} color="white" />
          )}
        </View>

        <View style={styles.cameraIconContainer}>
          <Ionicons name="camera" size={22} color="white" />
        </View>
      </TouchableOpacity>

      <Text style={styles.headerText}>Profile</Text>
      <Text style={styles.profileText}>First Name: {userData.firstName}</Text>
      <Text style={styles.profileText}>Last Name: {userData.lastName}</Text>
      <Text style={styles.profileText}>Email: {userData.email}</Text>
      <TouchableOpacity onPress={signOut} style={styles.button}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
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
   headerText: {
    fontSize: 40,
    fontWeight: "bold",
    justifyContent: 'center',
    alignItems: 'center',
    color: "#33418b"
   },
  imageContainer: {
    backgroundColor: "#33418b",
    borderRadius: 100,
    height: 150,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#33418b',
    borderRadius: 20,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white'
  },
  imageWrapper: {
    position: 'relative',
  },
  button: {
    backgroundColor: "#33418b",
    alignItems: "center",
    width: "30%",
    padding: 15,
    borderRadius: 10,
    top: 75,
  },
  buttonText: {
    color: "white",
    fontWeight: '700',
    fontSize: 16,
  },
  profileText: {
    fontWeight: '500',
    fontSize: 16,
    padding: 15
  }
 })