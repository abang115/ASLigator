import { Stack } from "expo-router";

export default function RootLayout() {
  return (
  <Stack>
    <Stack.Screen name="index" options={{ 
      title: "ASLigator",
      headerStyle: { backgroundColor: "#FA4616" }, 
      headerTintColor: "white",
      }} />
      <Stack.Screen name="RegisterScreen" options={{ 
      title: "Register",
      headerStyle: { backgroundColor: "#FA4616" }, 
      headerTintColor: "white",
      }} />
      <Stack.Screen name="HomeScreen" options={{ 
      title: "Home",
      headerStyle: { backgroundColor: "#FA4616" }, 
      headerTintColor: "white",
      }} />
  </Stack> 
  );
}
