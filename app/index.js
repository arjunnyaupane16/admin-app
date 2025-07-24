import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  BackHandler,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import 'react-native-gesture-handler';
import { TapGestureHandler } from 'react-native-gesture-handler';

export default function HomeScreen() {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === 'android') {
          if (!router.canGoBack()) {
            BackHandler.exitApp();
            return true;
          } else {
            router.back();
            return true;
          }
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [router])
  );

  const features = [
    {
      title: 'Dashboard',
      description: 'View sales analytics and business metrics',
      icon: 'dashboard',
      route: '/dashboard',
      color: '#6a1b9a',
    },
    {
      title: 'Orders',
      description: 'Manage current and past customer orders',
      icon: 'list-alt',
      route: '/orders',
      color: '#4a148c',
    },
    {
      title: 'Menu',
      description: 'Edit your café menu items and categories',
      icon: 'restaurant-menu',
      route: '/menu',
      color: '#7b1fa2',
    },
    {
      title: 'Staff',
      description: 'Manage employee accounts and schedules',
      icon: 'people',
      route: '/staff',
      color: '#9c27b0',
    },
  ];

  return (
    <View style={styles.container}>
      {/* TopNavBar removed here to avoid duplicate */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Image
            source={require('../assets/images/cafe-interior.jpg')}
            style={styles.welcomeImage}
            resizeMode="cover"
          />
          <View style={styles.welcomeOverlay}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Manage your café efficiently</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {features.map((feature, index) => (
            <TapGestureHandler
              key={index}
              onActivated={() => router.push(feature.route)}
            >
              <View style={[styles.actionCard, { backgroundColor: feature.color }]}>
                <MaterialIcons
                  name={feature.icon}
                  size={30}
                  color="#fff"
                  style={styles.actionIcon}
                />
                <Text style={styles.actionTitle}>{feature.title}</Text>
              </View>
            </TapGestureHandler>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <MaterialIcons name="local-cafe" size={24} color="#6a1b9a" />
            <Text style={styles.activityText}>25 new orders today</Text>
          </View>
          <View style={styles.activityItem}>
            <MaterialIcons name="attach-money" size={24} color="#6a1b9a" />
            <Text style={styles.activityText}>Rs. 42,800 in sales</Text>
          </View>
          <View style={styles.activityItem}>
            <MaterialIcons name="star" size={24} color="#6a1b9a" />
            <Text style={styles.activityText}>4.8 average rating</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  welcomeContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    margin: 15,
    marginBottom: 25,
    position: 'relative',
  },
  welcomeImage: {
    width: '100%',
    height: '100%',
  },
  welcomeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  welcomeTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginBottom: 15,
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 25,
  },
  actionCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionIcon: {
    marginBottom: 10,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  activityText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#555',
  },
});
