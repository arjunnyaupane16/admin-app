import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import styles from './styles/LoginStyles';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleReset = () => {
    Alert.alert('Reset Sent', 'Please check your email (mock).');
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput placeholder="Email Address" style={styles.input} onChangeText={setEmail} />
      <Button title="Reset Password" onPress={handleReset} />
      <TouchableOpacity onPress={() => router.replace('/login')}>
        <Text style={styles.link}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
