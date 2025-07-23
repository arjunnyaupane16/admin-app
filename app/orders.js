import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import OrderCard from './components/OrderCard';
import styles from './styles/OrdersStyles';
import { fetchOrders } from './utils/orderApi';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'confirmed' | 'pending'
  const [summaryVisible, setSummaryVisible] = useState(false);

  const flatListRef = useRef(null);
  const prevOrdersRef = useRef([]);

  const loadOrders = async () => {
    try {
const data = await fetchOrders({ excludeOrderCardDeleted: true }); // ✅ Fix: excludes OrderCard-deleted

      // Detect new order IDs if needed
      const prevIds = prevOrdersRef.current.map((o) => o._id);
      const newIds = data.map((o) => o._id);
      const isNew = newIds.some((id) => !prevIds.includes(id));

      if (isNew) {
        console.log('🆕 New order detected');
      }

      prevOrdersRef.current = data;
      setOrders([...data]);
    } catch (err) {
      console.error('❌ Error loading orders:', err.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadOrders().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleLiveOrdersPress = async () => {
    // Toggle summary visible state
    setSummaryVisible((prev) => {
      if (!prev) {
        // If showing summary now, reset filter to 'all'
        setFilter('all');
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        loadOrders();
        return true;
      } else {
        // Hide summary
        return false;
      }
    });
  };

  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
const filteredOrders = orders.filter((order) => {
  // Exclude orders deleted by admin
  if (order.status === 'deleted' && order.deletedFrom === 'admin') return false;

  // Apply filter if not 'all'
  if (filter !== 'all' && order.status !== filter) return false;

  return true;
});


  // Show only non-deleted orders from last 24 hours
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

      {/* ✅ Summary Filter Row (toggle visible) */}
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
              onActionComplete={loadOrders}
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
