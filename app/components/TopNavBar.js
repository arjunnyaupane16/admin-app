import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import {
  BackHandler,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function TopNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, isAuthenticated, isLoading } = useContext(AuthContext);

  const isActive = (route) => pathname === route || pathname.startsWith(route + '/');

  const handleBack = () => {
    if (pathname === '/index' || pathname === '/') {
      if (Platform.OS === 'android') {
        BackHandler.exitApp();
      }
      return true;
    }
    router.push('/index');
    return true;
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => backHandler.remove();
    }
  }, [pathname]);

  if (pathname === '/login' || !pathname) return null;

  return (
    <View style={styles.container}>
      {/* Left Section: Back & Logo */}
      <View style={styles.leftSection}>
        {pathname !== '/index' && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Center Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Drift and Sip Cafe</Text>
      </View>

      {/* Right Section: Nav Buttons */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          onPress={() => router.push('/dashboard')}
          style={[styles.navItem, isActive('/dashboard') && styles.activeNavItem]}>
          <MaterialIcons
            name="dashboard"
            size={22}
            color={isActive('/dashboard') ? '#fff' : 'rgba(255,255,255,0.7)'}
          />
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/orders')}
          style={[styles.navItem, isActive('/orders') && styles.activeNavItem]}>
          <Ionicons
            name="list"
            size={22}
            color={isActive('/orders') ? '#fff' : 'rgba(255,255,255,0.7)'}
          />
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>

        {/* ✅ Logout button shown only when authenticated and not loading */}
        {!isLoading && isAuthenticated && (
          <TouchableOpacity onPress={logout} style={styles.navItem}>
            <Ionicons name="log-out" size={22} color="rgba(255,255,255,0.7)" />
            <Text style={styles.navText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6a1b9a',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 12 : 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  logo: {
    width: 35,
    height: 35,
    borderRadius: 5,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  activeNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
    paddingBottom: 2,
  },
  navText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2,
  },
});
