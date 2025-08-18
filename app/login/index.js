import { Redirect } from 'expo-router';

export default function LoginIndex() {
  // This will redirect to the actual login page
  return <Redirect href="/(auth)/login" />;
}
