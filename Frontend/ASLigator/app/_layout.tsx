import { Stack } from "expo-router";

//Layout for the app
export default function RootLayout() {
  return (
  <Stack>
    <Stack.Screen name="index" options={{ 
      headerShown: false
      }} />
      <Stack.Screen name="LoginScreen" options={{ 
      headerShown: false
      }} />
      <Stack.Screen name="RegisterScreen" options={{ 
      headerShown: false
      }} />
      <Stack.Screen name="ForgotScreen" options={{ 
      headerShown: false
      }} />
      <Stack.Screen name="HomeScreen" options={{ 
      headerShown: false
      }} />
      <Stack.Screen name="SettingsScreen" options={{ 
      headerShown: false
      }} />
      <Stack.Screen name="ProfileScreen" options={{ 
      headerShown: false
      }} />
  </Stack> 
  );
}
