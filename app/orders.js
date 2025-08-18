import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import OrderCard from './components/OrderCard';
import styles from './styles/OrdersStyles';
import { fetchOrders } from './utils/orderApi';
// removed navigateToDeletedOrders import (unused and may not exist on web)

export default function OrdersScreen() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'confirmed' | 'pending'
  const [summaryVisible, setSummaryVisible] = useState(false);

  const flatListRef = useRef(null);
  const prevOrdersRef = useRef([]);
  const lastActionAtRef = useRef(0);
  const optimisticPaidIdsRef = useRef(new Set());
  const router = useRouter();

  // Load paid order IDs from storage on mount
  useEffect(() => {
    const loadPaidOrders = async () => {
      try {
        const paidOrders = await AsyncStorage.getItem('paidOrders');
        if (paidOrders) {
          const paidIds = JSON.parse(paidOrders);
          optimisticPaidIdsRef.current = new Set(paidIds);
        }
      } catch (error) {
        console.error('Error loading paid orders:', error);
      }
    };
    loadPaidOrders();
  }, []);

  // ✅ Handle hardware back button (native only)
  useEffect(() => {
    if (Platform.OS === 'web') return; // no hardware back on web

    const backAction = () => {
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await fetchOrders({ excludeOrderCardDeleted: true });

      // Merge with optimistic paid state and ensure paid status is preserved
      const merged = data.map((order) => {
        // If order is marked as paid in our local state, ensure it stays that way
        if (optimisticPaidIdsRef.current.has(order._id)) {
          return {
            ...order,
            paymentStatus: 'paid',
            isPaid: true,
            status: order.status === 'pending' ? 'confirmed' : order.status
          };
        }
        return order;
      });

      prevOrdersRef.current = merged;
      setOrders(merged);
    } catch (err) {
      console.error('❌ Error loading orders:', err.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadOrders().finally(() => setLoading(false));
  }, []);

  // Reload fresh data whenever this screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      // Skip refresh briefly after a user action to avoid visual reversion
      const now = Date.now();
      if (now - lastActionAtRef.current < 6000) return; // allow backend some time to persist
      loadOrders();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  // Save paid order IDs to storage
  const savePaidOrders = async (orderId) => {
    try {
      const paidOrders = Array.from(optimisticPaidIdsRef.current);
      await AsyncStorage.setItem('paidOrders', JSON.stringify(paidOrders));
    } catch (error) {
      console.error('Error saving paid orders:', error);
    }
  };

  // Handle order actions like delete, paid, etc.
  const handleActionComplete = async (updatedOrder, actionType) => {
    lastActionAtRef.current = Date.now();
    console.log('[orders] handleActionComplete called with actionType=', actionType, 'orderId=', updatedOrder?._id);

    if (actionType === 'paid' || updatedOrder.paymentStatus === 'paid') {
      optimisticPaidIdsRef.current.add(updatedOrder._id);
      await savePaidOrders(updatedOrder._id);
    }

    const isDelete = actionType === 'deleted' || updatedOrder.status === 'deleted';

    // Update local state
    setOrders(prev => {
      if (isDelete) {
        // Optimistically remove from active list
        console.log('[orders] Removing order from list due to delete:', updatedOrder?._id);
        return prev.filter(o => o._id !== updatedOrder._id);
      }
      const updated = prev.map(o =>
        o._id === updatedOrder._id
          ? { ...o, ...updatedOrder, paymentStatus: 'paid', isPaid: true }
          : o
      );
      return updated;
    });

    // Background refresh to reconcile with server
    loadOrders();
  };

  const handleLiveOrdersPress = async () => {
    setSummaryVisible((prev) => {
      if (!prev) {
        setFilter('all');
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        loadOrders();
        return true;
      } else {
        return false;
      }
    });
  };

  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  const filteredOrders = orders.filter((order) => {
    // Exclude any soft-deleted order from active list
    if (order.status === 'deleted') return false;
    if (filter !== 'all' && order.status !== filter) return false;
    return true;
  });

  const now = new Date();
  const activeOrders = filteredOrders.filter((order) => {
    const createdAt = new Date(order.createdAt);
    const ageInMs = now - createdAt;
    const ageInHours = ageInMs / (1000 * 60 * 60);
    return !order.deleted && ageInHours <= 24;
  });

  return (
    <View style={styles.container}>

      {/* 🔴 Live Orders Header */}
      <TouchableOpacity
        onPress={handleLiveOrdersPress}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        style={styles.liveOrdersHeader}
      >
        <View style={styles.liveOrdersLeft}>
          <View style={styles.redCircle} />
          <View style={styles.liveHeadingContainer}>
            <View style={styles.redDot} />
            <Text style={styles.liveHeadingText}>Live Orders</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* ✅ Summary Filter Row */}
      {summaryVisible && (
        <View style={styles.summaryFilterRow}>
          <TouchableOpacity onPress={() => setFilter('confirmed')}>
            <View
              style={[
                styles.statCircle,
                filter === 'confirmed' && styles.selectedStatCircle,
              ]}
            >
              <Text
                style={[
                  styles.statText,
                  styles.confirmedText,
                  filter === 'confirmed' && styles.selectedFilterText,
                ]}
              >
                ✅ {confirmedCount}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setFilter('pending')}>
            <View
              style={[
                styles.statCircle,
                filter === 'pending' && styles.selectedStatCircle,
              ]}
            >
              <Text
                style={[
                  styles.statText,
                  styles.pendingText,
                  filter === 'pending' && styles.selectedFilterText,
                ]}
              >
                ⏳ {pendingCount}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* 🧾 Order List */}
      {loading ? (
        <ActivityIndicator size="large" color="#333" />
      ) : activeOrders.length === 0 ? (
        <Text style={styles.emptyText}>No live orders in the last 24 hours.</Text>
      ) : (
        <FlatList
          ref={flatListRef}
          data={activeOrders}
          keyExtractor={(item) => item._id}
          extraData={orders}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onActionComplete={handleActionComplete}
              scrollViewRef={flatListRef}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}
