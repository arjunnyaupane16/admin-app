import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

// Compact recycle-bin list; no full OrderCard here

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

  const confirmAction = (actionLabel, actionFn, successMessage) => {
    const targetOrders = selectedOrders.length
      ? selectedOrders
      : deletedOrders.map((o) => o._id);

    if (targetOrders.length === 0) {
      Alert.alert('No orders selected');
      return;
    }

    const message = `Are you sure you want to ${actionLabel.toLowerCase()} ${targetOrders.length} order${targetOrders.length > 1 ? 's' : ''}?`;

    if (Platform.OS === 'web') {
      const ok = window.confirm(message);
      if (!ok) return;
      (async () => {
        try {
          for (const id of targetOrders) {
            await actionFn(id);
          }
          alert(successMessage);
          await loadDeletedOrders();
          setSelectedOrders([]);
        } catch (err) {
          alert(err?.message || 'Action failed');
        }
      })();
    } else {
      Alert.alert(
        actionLabel,
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: actionLabel,
            style: 'destructive',
            onPress: async () => {
              try {
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
    }
  };

  const restoreSelected = () =>
    confirmAction('Restore', restoreOrder, 'Orders restored successfully.');

  const deleteSelected = () =>
    confirmAction(
      'Delete Permanently',
      permanentlyDeleteOrder,
      'Orders permanently deleted.'
    );

  const deleteAll = () => {
    if (!deletedOrders.length) return;
    const msg = `Permanently delete ALL ${deletedOrders.length} trashed orders? This cannot be undone.`;
    if (Platform.OS === 'web') {
      if (!window.confirm(msg)) return;
      (async () => {
        try {
          await emptyTrash();
          alert('Trash emptied.');
          await loadDeletedOrders();
          setSelectedOrders([]);
        } catch (err) {
          alert(err?.message || 'Failed to empty trash');
        }
      })();
    } else {
      Alert.alert(
        'Empty Trash',
        msg,
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
    }
  };

  const isSelectedAll = selectedOrders.length && selectedOrders.length === deletedOrders.length;

  const toggleSelectAll = () => {
    if (isSelectedAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(deletedOrders.map(o => o._id));
    }
  };

  const renderItem = ({ item }) => {
    const selected = selectedOrders.includes(item._id);
    return (
      <TouchableOpacity
        onPress={() => toggleSelect(item._id)}
        style={[styles.row, selected && styles.rowSelected]}
      >
        <View style={styles.rowLeft}>
          <View style={[styles.checkbox, selected && styles.checkboxChecked]} />
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowTitle}>{item.customer?.name || 'No Name'}</Text>
            <Text style={styles.rowSub}>#{item._id.slice(-6)} • {new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        </View>
        <Text style={styles.rowAmount}>Rs. {item.totalAmount}</Text>
      </TouchableOpacity>
    );
  };

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
        <View>
          <Text style={styles.title}>Deleted Orders</Text>
          <Text style={styles.subtitle}>Selected: {selectedOrders.length} / {deletedOrders.length}</Text>
        </View>
        {deletedOrders.length > 0 && (
          <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllBtn}>
            <Text style={styles.selectAllText}>{isSelectedAll ? 'Unselect All' : 'Select All'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={deletedOrders}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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

      {/* Optional: FAB to empty trash */}
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
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  header: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ffffffee',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  rowSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#94a3b8',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  rowSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginLeft: 8,
  },
  separator: {
    height: 8,
  },
  selectAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#334155',
    alignSelf: 'center',
  },
  selectAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    minWidth: 130,
    alignItems: 'center',
  },
  restore: {
    backgroundColor: '#4caf50',
  },
  delete: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
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
