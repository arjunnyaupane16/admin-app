import { useContext } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';

export default function TopNavBar() {
  const router = useRouter();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    router.replace('/login'); // Redirect to login after logout
  };

  return (
    <View style={styles.navbar}>
      <Button title="Orders" onPress={() => router.push('/orders')} />
      <Button title="Dashboard" onPress={() => router.push('/dashboard')} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#f4f4f4',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
