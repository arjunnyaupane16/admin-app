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
              <Ionicons name="log-out" size={22} color="rgba(255,255,255,0.7)" />
              <Text style={styles.navText}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>
      </Container>
    </View>
  );
}const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#6a1b9a',
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
      },
    }),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6a1b9a',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : Platform.OS === 'web' ? 12 : 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
    ...Platform.select({
      web: {
        maxWidth: 1280,         // ✅ keep nav centered
        marginHorizontal: 'auto',
      },
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,             // ✅ logo space reserved
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        marginLeft: -120,      // ✅ balance center despite left logo width
      },
    }),
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    ...Platform.select({
      web: {
        fontSize: 22,          // ✅ slightly bigger for web
      },
    }),
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,                   // ✅ spacing between nav items (web)
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 6,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
      },
    }),
  },
  activeNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
    paddingBottom: 2,
  },
  navText: {
    color: '#fff',
    fontSize: 11,
    marginTop: 2,
    ...Platform.select({
      web: {
        fontSize: 13,
        fontWeight: '500',
      },
    }),
  },
});

