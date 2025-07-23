// app/screens/TotalOrdersScreen.js
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import OrderCard from './components/OrderCard';

const TotalOrdersScreen = () => {
  const { orders: ordersString, dateFilterType } = useLocalSearchParams();
  const orders = JSON.parse(ordersString || '[]');
  const [activeFilter, setActiveFilter] = useState('all');

  // ✅ Updated filtering logic
  const filteredOrders = orders.filter((order) => {
    if (order.status === 'deleted' && order.deletedFrom === 'admin') return false;
    if (order.status === 'deleted' && order.deletedFrom === 'orderCard' && activeFilter !== 'deleted') return false;

    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

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
        renderItem={({ item }) => <OrderCard order={item} />}
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
