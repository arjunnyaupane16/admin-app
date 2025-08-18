import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useContext } from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function TopNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, isAuthenticated, isLoading } = useContext(AuthContext);

  const isActive = (route) => pathname === route || pathname.startsWith(route + '/');


  if (pathname === '/login' || !pathname) return null;

  // Use SafeAreaView for iOS and web
  const Container = Platform.OS === 'web' ? View : SafeAreaView;

  return (
    <View style={styles.wrapper}>
      <Container style={styles.container}>
        {/* Left Section: Logo */}
        <View style={styles.leftSection}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Center Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Drift and Sip</Text>
        </View>

        {/* Right Section: Nav Buttons */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={[styles.navItem, isActive('/') && styles.activeNavItem]}>
            <Ionicons
              name="home"
              size={22}
              color={isActive('/') ? '#6a1b9a' : '#666'}
            />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/orders')}
            style={[styles.navItem, isActive('/orders') && styles.activeNavItem]}>
            <Ionicons
              name="list"
              size={22}
              color={isActive('/orders') ? '#6a1b9a' : '#666'}
            />
            <Text style={styles.navText}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/dashboard')}
            style={[styles.navItem, isActive('/dashboard') && styles.activeNavItem]}>
            <MaterialIcons
              name="dashboard"
              size={22}
              color={isActive('/dashboard') ? '#6a1b9a' : '#666'}
            />
            <Text style={styles.navText}>Dashboard</Text>
          </TouchableOpacity>

          {/* ✅ Logout button shown only when authenticated and not loading */}
          {!isLoading && isAuthenticated && (
            <TouchableOpacity onPress={logout} style={styles.navItem}>
              <Ionicons name="log-out" size={22} color="#666" />
              <Text style={styles.navText}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>
      </Container>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'web' ? 20 : 12,
    paddingBottom: Platform.OS === 'web' ? 20 : 12,
    ...Platform.select({
      web: {
        maxWidth: 1200,
        marginHorizontal: 'auto',
        width: '100%',
      },
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120, // ✅ fixed space for logo
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  logo: {
    width: 35,
    height: 35,
    borderRadius: 5,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
  },
  activeNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#6a1b9a',
    paddingBottom: 8,
  },
  navText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
});
