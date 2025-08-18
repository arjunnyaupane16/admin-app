import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Only load gesture-handler side effects on native
if (Platform.OS !== 'web') {
  require('react-native-gesture-handler');
}

import OrderCard from './components/OrderCard';
import { fetchAdminOrders } from './utils/orderApi';
// removed navigateToDeletedOrders import (unused and may not exist)

const TotalOrdersScreen = () => {


  // router usage removed
  const { orders: ordersStringRaw, dateFilterType, selectedDate: selectedDateISO } = useLocalSearchParams();
  const selectedDate = selectedDateISO ? new Date(selectedDateISO) : new Date();
  // Safely parse incoming orders to prevent crashes if the param is malformed
  let initialOrders = [];
  try {
    const str = typeof ordersStringRaw === 'string' ? ordersStringRaw : '[]';
    initialOrders = JSON.parse(str || '[]');
    if (!Array.isArray(initialOrders)) initialOrders = [];
  } catch (e) {
    console.warn('Invalid orders param; defaulting to empty list');
    initialOrders = [];
  }
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

  // Track if we've made any local changes that we want to preserve
  const localChangesRef = useRef(new Set());

  // Refetch fresh data every time this screen gets focus, but respect local changes
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        try {
          const allOrders = await fetchAdminOrders();

          // Apply same date filter as dashboard
          const dateFiltered = allOrders.filter((order) => {
            // Skip orders that we've deleted locally
            if (localChangesRef.current.has(order._id) && order.status === 'deleted') {
              return false;
            }

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

          if (active) {
            setList(prevList => {
              // If we have no local changes, just use the server data
              if (localChangesRef.current.size === 0) {
                return dateFiltered;
              }

              // Otherwise, merge server data with local changes
              const serverOrdersMap = new Map(dateFiltered.map(order => [order._id, order]));
              const mergedList = [];

              // First add all server orders that aren't locally deleted
              for (const order of dateFiltered) {
                if (!localChangesRef.current.has(order._id)) {
                  mergedList.push(order);
                }
              }

              // Then add any local orders that aren't in the server response
              for (const order of prevList) {
                if (!serverOrdersMap.has(order._id)) {
                  mergedList.push(order);
                } else if (localChangesRef.current.has(order._id)) {
                  // If we have a local version of this order, use it instead of the server version
                  const index = mergedList.findIndex(o => o._id === order._id);
                  if (index !== -1) {
                    mergedList[index] = order;
                  } else {
                    mergedList.push(order);
                  }
                }
              }

              return mergedList;
            });
          }
        } catch (e) {
          console.warn('Failed to refresh total-orders:', e?.message);
        }
      };

      // Always refresh from server, but respect local changes
      load();

      return () => { active = false; };
    }, [dateFilterType, selectedDateISO])
  );

  const handleActionComplete = useCallback((updatedOrder, actionType) => {
    const isDelete = actionType === 'deleted' || updatedOrder.status === 'deleted';

    setList((prev) => {
      if (!updatedOrder?._id) return prev;

      if (isDelete) {
        // If already deleted or marked for deletion, don't process again
        if (prev.some(o => o._id === updatedOrder._id && o.status === 'deleted')) {
          return prev;
        }

        // Add deletion timestamp if not present
        const orderToDelete = updatedOrder.deletedAt
          ? updatedOrder
          : {
            ...updatedOrder,
            status: 'deleted',
            deletedAt: new Date().toISOString(),
            deletedFrom: 'orderCard'
          };

        // Track this deletion locally
        localChangesRef.current.add(updatedOrder._id);

        // Filter out the deleted order
        return prev.filter((o) => o._id !== orderToDelete._id);
      }

      // For non-delete updates, merge the changes
      return prev.map((o) =>
        o._id === updatedOrder._id
          ? { ...o, ...updatedOrder }
          : o
      );
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
          <OrderCard
            order={item}
            onActionComplete={handleActionComplete}
            navigateToDeletedOnDelete={false}
          />
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
