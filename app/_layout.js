import { Stack } from 'expo-router';
import { Platform, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
        {/* Render Toast only on native platforms */}
        {Platform.OS !== 'web' && <Toast />}
      </View>
    </AuthProvider>
  );
}
