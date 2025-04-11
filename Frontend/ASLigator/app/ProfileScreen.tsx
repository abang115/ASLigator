import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View, Alert, Image} from 'react-native'
import React, {useState, useEffect} from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'
import { getStorage, ref, putFile, getDownloadURL } from '@react-native-firebase/storage';
import { getAuth, signOut } from "@react-native-firebase/auth"
import { getFirestore, doc, getDoc, setDoc } from "@react-native-firebase/firestore"

export default function ProfileScreen() {
  const router = useRouter()
  const auth = getAuth()
  const firestore = getFirestore()
  const storage = getStorage()
  
  const [image, setImage] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ firstName?: string; lastName?: string; email?: string }>({});

  // Load profile picture when screen is loaded
  useEffect(() => {
    const loadProfilePicture = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(firestore, "users", userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists) {
          const data = docSnap.data();
          setUserData({
            firstName: data?.firstName || '',
            lastName: data?.lastName || '',
            email: data?.email || '',
          });
          setImage(data?.profilePicture || null);
        }
      }
    };
    loadProfilePicture();
  }, []);
  
  // Allow user to pick their profile picture
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

  // Uploads selected profile picture to firebase storage
  const uploadImage = async (imageUri: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId || !imageUri) return;

    const fileName = `profile_pictures/${userId}.jpg`;
    const reference = ref(storage, fileName);

    try {
      await putFile(reference, imageUri);
      const url = await getDownloadURL(reference);
      await saveProfilePictureUrl(url);
      Alert.alert("Upload Successful", "Your profile picture has been updated!");
    } catch (error) {
      console.error(error);
      Alert.alert("Upload Failed", "Please try again.");
    }
  };

  // Saves profile picture URL to firestore to load in when screen is loaded
  const saveProfilePictureUrl = async (url: string) => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const userDocRef = doc(firestore, "users", userId);
      await setDoc(userDocRef, { profilePicture: url }, { merge: true });
    }
  };

  // Signs out the user
  const signOutUser = async () => {
    try {
      await signOut(auth)
      router.navigate("/")
    }
    catch (e) {
      alert("Error, could not sign out!")
    }
  };
  
  return (
     <KeyboardAvoidingView style={styles.container} behavior='padding'>

      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={30} color="#33418b" />
      </TouchableOpacity>

      {/* Profile Picture */}
      <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person" size={100} color="white" />
          )}
        </View>

        {/* Change Profile Picture Button */}
        <View style={styles.cameraIconContainer}>
          <Ionicons name="camera" size={22} color="white" />
        </View>
      </TouchableOpacity>

      {/* User Information */}
      <Text style={styles.headerText}>Profile</Text>
      <Text style={styles.profileText}>First Name: {userData.firstName}</Text>
      <Text style={styles.profileText}>Last Name: {userData.lastName}</Text>
      <Text style={styles.profileText}>Email: {userData.email}</Text>

      {/* Sign Out Button */}
      <TouchableOpacity onPress={signOutUser} style={styles.button}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
     </KeyboardAvoidingView>
   )
 }

// Create stylesheet for the screen
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