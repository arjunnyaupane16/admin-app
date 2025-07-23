import { Stack } from 'expo-router';
import { useContext } from 'react';
import Toast from 'react-native-toast-message';
import { AuthProvider, AuthContext } from './context/AuthContext'; // Adjust path

export default function RootLayout() {
  return (
    <AuthProvider>
      <LayoutContent />
      <Toast />
    </AuthProvider>
  );
}

function LayoutContent() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Stack>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="forgot" options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="orders" />
          <Stack.Screen name="order-details" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="deleted-orders" options={{ headerShown: false }} />
        </>
      )}
    </Stack>
  );
}
