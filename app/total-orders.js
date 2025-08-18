import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';

import { useState, useMemo, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

// Only load gesture-handler side effects on native
if (Platform.OS !== 'web') {
  require('react-native-gesture-handler');
}

import OrderCard from './components/OrderCard';
import { fetchAdminOrders } from './utils/orderApi';

const TotalOrdersScreen = () => {


  const router = useRouter();
  const { orders: ordersString, dateFilterType, selectedDate: selectedDateISO } = useLocalSearchParams();
  const selectedDate = selectedDateISO ? new Date(selectedDateISO) : new Date();
  const initialOrders = JSON.parse(ordersString || '[]');
  const [list, setList] = useState(initialOrders);
  const [activeFilter, setActiveFilter] = useState('all');

  // Helpers for date comparison
  const isSameDay = (date1, date2) => (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );

  const isSameWeek = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(Math.abs((date1 - date2) / oneDay));
    return diffDays < 7 && date1.getDay() <= date2.getDay();
  };

  const isSameMonth = (date1, date2) => (
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );

  const isSameYear = (date1, date2) => (
    date1.getFullYear() === date2.getFullYear()
  );

  // Refetch fresh data every time this screen gets focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        try {
          const allOrders = await fetchAdminOrders();
          // Apply same date filter as dashboard
          const dateFiltered = allOrders.filter((order) => {
            const createdAt = new Date(order.createdAt);
            switch (dateFilterType) {
              case 'weekly':
                return isSameWeek(createdAt, selectedDate);
              case 'monthly':
                return isSameMonth(createdAt, selectedDate);
              case 'yearly':
                return isSameYear(createdAt, selectedDate);
              case 'daily':
              default:
                return isSameDay(createdAt, selectedDate);
            }
          });
          // Exclude deleted
          const visible = dateFiltered.filter((o) => o.status !== 'deleted');
          if (active) setList(visible);
        } catch (e) {
          // swallow for now; UI will still show param-passed snapshot
          console.warn('Failed to refresh total-orders:', e?.message);
        }
      };
      load();
      return () => { active = false; };
    }, [dateFilterType, selectedDateISO])
  );

  const handleActionComplete = useCallback((updatedOrder, actionType) => {
    setList((prev) => {
      if (!updatedOrder?._id) return prev;
      if (actionType === 'deleted' || updatedOrder.status === 'deleted') {
        return prev.filter((o) => o._id !== updatedOrder._id);
      }
      // Merge update for paid or edited
      return prev.map((o) => (o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o));
    });
  }, []);

  const filteredOrders = useMemo(() => {
    return list.filter((order) => {
      if (order.status === 'deleted' && order.deletedFrom === 'admin') return false;
      if (order.status === 'deleted' && order.deletedFrom === 'orderCard' && activeFilter !== 'deleted') return false;

      if (activeFilter === 'all') return true;
      return order.status === activeFilter;
    });
  }, [list, activeFilter]);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Total Orders ({dateFilterType || 'All'})</Text>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {['all', 'confirmed', 'pending', 'deleted'].map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterButton, activeFilter === key && styles.activeFilter]}
            onPress={() => setActiveFilter(key)}
          >
            <Text style={styles.filterText}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Order List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <OrderCard order={item} onActionComplete={handleActionComplete} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No orders found</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  backButton: { marginBottom: 8 },
  backText: { color: 'purple', fontSize: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  filterContainer: { flexDirection: 'row', marginBottom: 12 },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#477b44',
  },
  filterText: {
    color: '#333',
    fontWeight: '600',
  },
  list: {
    paddingBottom: 20,
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },
});

export default TotalOrdersScreen;
