// app/_layout.js
import { Stack } from 'expo-router';
import { AuthProvider } from './context/AuthContext';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          gestureEnabled: true,
          headerShown: false, // TopNavBar will be rendered inside each screen
        }}
      />
    </AuthProvider>
  );
}
