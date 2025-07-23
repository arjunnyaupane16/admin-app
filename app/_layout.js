import { Slot, useRouter, useSegments } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { isAuthenticated } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait a tick to ensure layout is mounted
      setTimeout(() => {
        const inAuthGroup = segments[0] === 'login';

        if (!isAuthenticated && !inAuthGroup) {
          router.replace('/login');
        } else if (isAuthenticated && inAuthGroup) {
          router.replace('/');
        }

        setIsReady(true);
      }, 10); // Short delay to ensure mounting
    };

    checkAuth();
  }, [isAuthenticated, segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}
