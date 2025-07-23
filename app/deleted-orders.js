import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import OrderCard from './components/OrderCard';
import {
  emptyTrash,
  fetchDeletedOrders,
  permanentlyDeleteOrder,
  restoreOrder,
} from './utils/orderApi';

const DeletedOrdersScreen = () => {
  const [deletedOrders, setDeletedOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDeletedOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchDeletedOrders();
      setDeletedOrders(data);
    } catch (err) {
      console.error('Failed to load deleted orders:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeletedOrders();
  }, []);

  const toggleSelect = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  /**
   * Generic confirm handler for bulk restore / delete.
   * @param {'Restore'|'Delete Permanently'} actionLabel
   * @param {(id:string)=>Promise<any>} actionFn
   * @param {string} successMessage
   */
  const confirmAction = (actionLabel, actionFn, successMessage) => {
    const targetOrders = selectedOrders.length
      ? selectedOrders
      : deletedOrders.map((o) => o._id);

    if (targetOrders.length === 0) {
      Alert.alert('No orders selected');
      return;
    }

    Alert.alert(
      actionLabel,
      `Are you sure you want to ${actionLabel.toLowerCase()} ${targetOrders.length} order${targetOrders.length > 1 ? 's' : ''
      }?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabel,
          style: 'destructive',
          onPress: async () => {
            try {
              // Process sequentially; could be Promise.all if backend allows parallel deletes.
              for (const id of targetOrders) {
                await actionFn(id);
              }
              Alert.alert(successMessage);
              await loadDeletedOrders();
              setSelectedOrders([]);
            } catch (err) {
              Alert.alert('Error', err?.message || 'Action failed');
            }
          },
        },
      ]
    );
  };

  const restoreSelected = () =>
    confirmAction('Restore', restoreOrder, 'Orders restored successfully.');

  const deleteSelected = () =>
    confirmAction(
      'Delete Permanently',
      permanentlyDeleteOrder,
      'Orders permanently deleted.'
    );

  // Optional: one-tap Empty Trash (ignores selection)
  const deleteAll = () => {
    if (!deletedOrders.length) return;
    Alert.alert(
      'Empty Trash',
      `Permanently delete ALL ${deletedOrders.length} trashed orders? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await emptyTrash();
              Alert.alert('Trash emptied.');
              await loadDeletedOrders();
              setSelectedOrders([]);
            } catch (err) {
              Alert.alert('Error', err?.message || 'Failed to empty trash');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <OrderCard
      order={item}
      isSelected={selectedOrders.includes(item._id)}
      onActionComplete={loadDeletedOrders}
      onLongPress={() => toggleSelect(item._id)} // ✅ pass the ID
    // If OrderCard itself has internal delete/restore buttons, be sure THEY call
    // restoreOrder / permanentlyDeleteOrder as appropriate for trashed context.
    />
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const anyDeleted = deletedOrders.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deleted Orders</Text>
        <Text style={styles.subtitle}>
          Selected: {selectedOrders.length} / {deletedOrders.length}
        </Text>
      </View>

      <FlatList
        data={deletedOrders}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: anyDeleted ? 80 : 0 }}
        ListEmptyComponent={<Text style={styles.empty}>No deleted orders found.</Text>}
      />

      {anyDeleted && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.restore]}
            onPress={restoreSelected}
          >
            <Text style={styles.buttonText}>Restore</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.delete]}
            onPress={deleteSelected}
          >
            <Text style={styles.buttonText}>Delete Permanently</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Optional global trash clear button (place elsewhere in your UI if you prefer) */}
      {/* {anyDeleted && (
        <TouchableOpacity style={styles.emptyTrashFab} onPress={deleteAll}>
          <Text style={styles.emptyTrashFabText}>Empty Trash</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );
};

export default DeletedOrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  header: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  restore: {
    backgroundColor: '#4caf50',
  },
  delete: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: 'gray',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Optional FAB style for "Empty Trash"
  emptyTrashFab: {
    position: 'absolute',
    right: 16,
    bottom: 72,
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 3,
  },
  emptyTrashFabText: {
    color: '#fff',
    fontWeight: '600',
  },
});
