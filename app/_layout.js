import { Slot, useRouter, useSegments } from 'expo-router';
import { useContext, useEffect } from 'react';
import { ActivityIndicator, AppState, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import TopNavBar from './components/TopNavBar';
import { AuthContext, AuthProvider } from './context/AuthContext';
import SwipeBackWrapper from './SwipeBackWrapper';

function AuthLayout() {
  const { isAuthenticated, isLoading, checkAuthStatus } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  const inAuthGroup = segments?.[0] === '(auth)';

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/index');
    }
  }, [segments, isAuthenticated, isLoading]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkAuthStatus();
      }
    });

    return () => {
      if (typeof subscription?.remove === 'function') {
        subscription.remove();
      } else if (typeof subscription === 'function') {
        subscription();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a1b9a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!inAuthGroup && <TopNavBar />}
      <Slot />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SwipeBackWrapper>
        <AuthProvider>
          <AuthLayout />
        </AuthProvider>
      </SwipeBackWrapper>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
