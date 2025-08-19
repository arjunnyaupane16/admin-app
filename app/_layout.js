import * as React from 'react';
import { useContext, useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, AppState, StyleSheet, View, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import TopNavBar from './components/TopNavBar';
import { AuthContext, AuthProvider } from './context/AuthContext';
import SwipeBackWrapper from './SwipeBackWrapper';
import { ConfirmProvider } from './components/ConfirmProvider';

function AuthLayout() {
  const { isAuthenticated, isLoading, checkAuthStatus } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  const inAuthGroup = segments?.[0] === '(auth)';

  useEffect(() => {
    if (isLoading) return;

    // Prevent navigation loop by checking current route
    const currentRoute = segments[0];
    
    if (!isAuthenticated) {
      if (currentRoute !== '(auth)') {
        router.replace('/login');
      }
    } else if (isAuthenticated && inAuthGroup) {
      // Only redirect from auth pages if we're authenticated
      router.replace('/');
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

export default function RootLayout() {
  const RootView = Platform.OS === 'web' ? View : GestureHandlerRootView;

  return (
    <RootView style={styles.container}>
      <StatusBar style="light" />
      <SwipeBackWrapper>
        <AuthProvider>
          <ConfirmProvider>
            <AuthLayout />
          </ConfirmProvider>
        </AuthProvider>
      </SwipeBackWrapper>
    </RootView>
  );
}
