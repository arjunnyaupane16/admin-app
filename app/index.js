import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
if (Platform.OS !== 'web') {
  // Load gesture handler side-effects only on native
  require('react-native-gesture-handler');
}
// Only require TapGestureHandler on native; on web use a no-op wrapper
let TapGestureWrapper = ({ children, onActivated, style }) => (
  <Pressable onPress={onActivated} style={style}>
    {children}
  </Pressable>
);
if (Platform.OS !== 'web') {
  const { TapGestureHandler } = require('react-native-gesture-handler');
  TapGestureWrapper = ({ children, onActivated, style }) => (
    <TapGestureHandler onActivated={onActivated} style={style}>
      {children}
    </TapGestureHandler>
  );
}

import { useEffect, useState } from 'react';
import { fetchOrders } from './utils/orderApi';

export default function HomeScreen() {
  const router = useRouter();
  const [summary, setSummary] = useState({
    orderCount: 0,
    totalSales: 0,
    averageRating: 0,
    loading: true
  });

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));

        // Fetch today's orders
        const response = await fetchOrders({
          startDate: startOfDay.toISOString(),
          endDate: new Date().toISOString()
        });

        // Calculate summary
        const todayOrders = Array.isArray(response) ? response : [];
        const totalSales = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        // Set fixed rating to 4.4
        const avgRating = 4.4;

        setSummary({
          orderCount: todayOrders.length,
          totalSales,
          averageRating: avgRating,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching summary data:', error);
        setSummary(prev => ({ ...prev, loading: false }));
      }
    };

    fetchSummaryData();
  }, []);

  const features = [

    {
      title: 'Orders',
      description: 'Manage current and past customer orders',
      icon: 'list-alt',
      route: '/orders',
      color: '#4a148c',
    },
    {
      title: 'Dashboard',
      description: 'View sales analytics and business metrics',
      icon: 'dashboard',
      route: '/dashboard',
      color: '#6a1b9a',
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
            <Text style={styles.welcomeSubtitle}>Manage our cafe efficiently</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {features.map((feature, index) => (
            <TapGestureWrapper
              key={index}
              onActivated={() => router.push(feature.route)}
              style={styles.actionWrapper}
            >
              <View style={[styles.actionCard, { backgroundColor: feature.color }]}>
                <MaterialIcons
                  name={feature.icon}
                  size={Platform.OS === 'web' ? 34 : 30}
                  color="#fff"
                  style={styles.actionIcon}
                />
                <Text style={styles.actionTitle}>{feature.title}</Text>
              </View>
            </TapGestureWrapper>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <MaterialIcons name="receipt" size={24} color="#4a148c" />
            <Text style={styles.summaryTitle}>Today's Orders</Text>
            <Text style={styles.summaryValue}>
              {summary.loading ? '...' : summary.orderCount}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="attach-money" size={24} color="#4a148c" />
            <Text style={styles.summaryTitle}>Total Sales</Text>
            <Text style={styles.summaryValue}>
              {summary.loading ? '...' : `Rs. ${summary.totalSales.toLocaleString()}`}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="star" size={24} color="#4a148c" />
            <Text style={styles.summaryTitle}>Rating</Text>
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.summaryValue}>
                {summary.loading ? '...' : summary.averageRating}
              </Text>
            </View>
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
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 16,
    ...Platform.select({
      web: {
        maxWidth: 1180,       // center content on web similar to screenshot
        marginHorizontal: 'auto',
        width: '100%',
      },
    }),
  },
  welcomeContainer: {
    height: 230,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
    ...Platform.select({
      web: {
        height: 300,         // larger hero section on web to match screenshot
      },
    }),
  },
  welcomeImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',      // ✅ fixes stretched image on web
  },
  welcomeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  welcomeTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    ...Platform.select({
      web: { fontSize: 28 },
    }),
  },
  welcomeSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    ...Platform.select({
      web: { fontSize: 16 },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 14,
    color: '#333',
    ...Platform.select({
      web: { fontSize: 18, marginLeft: 4 },
    }),
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    ...Platform.select({
      web: {
        gap: 20,
        justifyContent: 'flex-start',
      },
    }),
  },
  actionWrapper: {
    width: '48%',
    height: 120,
    marginBottom: 12,
    ...Platform.select({
      web: {
        width: '17%',        // 4 per row on large screens
        minWidth: 160,
        height: 130,
        cursor: 'pointer',
      },
    }),
  },
  actionCard: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    ...Platform.select({
      web: {
        width: '100%',
        height: '100%',
        boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
        transition: 'transform 0.2s ease',
      },
    }),
  },
  actionIcon: {
    marginBottom: 10,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    ...Platform.select({
      web: { fontSize: 18 },
    }),
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexGrow: 1,
    flexBasis: '30%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...Platform.select({
      web: {
        minWidth: 220,
        boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
      },
    }),
  },
  summaryTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4a148c',
    marginTop: 4,
    minHeight: 22,
    ...Platform.select({
      web: { fontSize: 20 },
    }),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});
