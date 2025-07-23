// app/index.js
import { useRouter } from 'expo-router';
import { Button, Image, ScrollView, Text, View } from 'react-native';
import TopNavBar from './components/TopNavBar';
import styles from './styles/HomeStyles';

export default function IndexScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TopNavBar />
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>☕ Drift and Sip Café</Text>

      <View style={{ marginTop: 20 }}>
        <Button title="View Orders" onPress={() => router.push('/orders')} />
      </View>
    </ScrollView>
  );
}
