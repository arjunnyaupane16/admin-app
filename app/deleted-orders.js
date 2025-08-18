import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getItem, setItem } from './utils/storage';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import API functions
import {
  fetchDeletedOrders,
  permanentlyDeleteOrder,
  restoreOrder,
} from './utils/orderApi';

const DeletedOrdersScreen = () => {
  const router = useRouter();
  const { refresh } = useLocalSearchParams() || {};
  const [deletedOrders, setDeletedOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDeletedOrders = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      
      const data = await fetchDeletedOrders();
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }
      setDeletedOrders(data);
    } catch (err) {
      console.error('Failed to load deleted orders:', err);
      setError(err?.message || 'Failed to load deleted orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Helper: remove restored/permanently deleted IDs from the persisted hidden list
  const RECENT_DELETED_KEY = 'recentDeletedIds';
  const removeFromRecentDeleted = useCallback(async (ids) => {
    try {
      const raw = await getItem(RECENT_DELETED_KEY);
      let arr = [];
      try { arr = JSON.parse(raw || '[]'); } catch { arr = []; }
      if (!Array.isArray(arr)) arr = [];
      const set = new Set(arr);
      ids.forEach(id => set.delete(id));
      await setItem(RECENT_DELETED_KEY, JSON.stringify(Array.from(set)));
    } catch (_) { /* noop */ }
  }, []);

  useEffect(() => {
    loadDeletedOrders();
  }, [loadDeletedOrders]);

  // Also refresh whenever the screen gains focus or when a `refresh` hint is passed
  useFocusEffect(
    useCallback(() => {
      loadDeletedOrders(true);
      // In case the server's delete propagation is slightly delayed, do a quick second refresh
      const t = setTimeout(() => loadDeletedOrders(true), 400);
      // clear selection on focus
      setSelectedOrders([]);
      return () => { clearTimeout(t); };
    }, [loadDeletedOrders, refresh])
  );

  const handleRefresh = useCallback(() => {
    loadDeletedOrders(true);
  }, [loadDeletedOrders]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No deleted orders found</Text>
      <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
        <Text style={styles.retryText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  ), [handleRefresh]);

  const renderErrorState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, styles.errorText]}>{error}</Text>
      <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  ), [error, handleRefresh]);

  const toggleSelect = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const confirmAction = useCallback(async (actionLabel, actionFn, successMessage) => {
    const targetOrders = selectedOrders.length > 0
      ? selectedOrders
      : deletedOrders.map((o) => o._id);

    if (targetOrders.length === 0) {
      Alert.alert('No orders selected');
      return;
    }

    const message = `Are you sure you want to ${actionLabel.toLowerCase()} ${targetOrders.length} order${targetOrders.length > 1 ? 's' : ''}?`;
    
    const performAction = async () => {
      try {
        // Show loading state
        setLoading(true);
        
        // Process each order sequentially
        for (const id of targetOrders) {
          await actionFn(id);
        }
        
        // Show success message
        if (Platform.OS === 'web') {
          alert(successMessage);
        } else {
          Alert.alert('Success', successMessage);
        }
        
        // Refresh the list and clear selection
        await loadDeletedOrders();
        setSelectedOrders([]);

        // Keep Total Orders in sync: if restoring or permanently deleting, update recentDeletedIds
        if (actionFn === restoreOrder) {
          await removeFromRecentDeleted(targetOrders);
          // Navigate to Total Orders and refresh so restored items are visible immediately
          try {
            router.replace('/total-orders?refresh=1');
          } catch (_) {}
        }
        if (actionFn === permanentlyDeleteOrder) {
          await removeFromRecentDeleted(targetOrders);
        }
      } catch (err) {
        console.error('Action failed:', err);
        const errorMessage = err?.response?.data?.message || err?.message || 'Action failed';
        
        if (Platform.OS === 'web') {
          alert(`Error: ${errorMessage}`);
        } else {
          Alert.alert('Error', errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    // Show confirmation dialog
    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        performAction();
      }
    } else {
      Alert.alert(
        actionLabel,
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: actionLabel,
            style: 'destructive',
            onPress: performAction,
          },
        ]
      );
    }
  }, [selectedOrders, deletedOrders, loadDeletedOrders]);

  const restoreSelected = () =>
    confirmAction('Restore', restoreOrder, 'Orders restored successfully.');

  const deleteSelected = () =>
    confirmAction(
      'Delete Permanently',
      permanentlyDeleteOrder,
      'Orders permanently deleted.'
    );

  // Note: Empty Trash functionality removed as per request.

  const isSelectedAll = selectedOrders.length && selectedOrders.length === deletedOrders.length;

  const toggleSelectAll = () => {
    if (isSelectedAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(deletedOrders.map(o => o._id));
    }
  };

  const renderItem = ({ item, index }) => {
    const id = item?._id || String(index);
    const selected = id && selectedOrders.includes(id);
    const created = item?.deletedAt || item?.updatedAt || item?.createdAt;
    let dateText = '-';
    try {
      dateText = created ? new Date(created).toLocaleString() : '-';
    } catch (e) {
      dateText = '-';
    }
    return (
      <TouchableOpacity
        onPress={() => toggleSelect(id)}
        style={[styles.row, selected && styles.rowSelected]}
      >
        <View style={styles.rowLeft}>
          <View style={[styles.checkbox, selected && styles.checkboxChecked]} />
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowTitle}>{item?.customer?.name || 'No Name'}</Text>
            <Text style={styles.rowSub}>
              #{id.slice(-6)} • {dateText}
            </Text>
          </View>
        </View>
        <Text style={styles.rowAmount}>Rs. {Number(item?.totalAmount || 0).toFixed(2)}</Text>
      </TouchableOpacity>
    );
  };

  // Note: avoid full-screen return while loading to prevent black/blank flashes

  const anyDeleted = deletedOrders.length > 0;

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderErrorState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
        keyExtractor={(item, index) => item?._id || String(index)}
        renderItem={({ item, index }) => renderItem({ item, index })}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={(
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        )}
        contentContainerStyle={{ paddingBottom: anyDeleted ? 80 : 0 }}
        ListEmptyComponent={renderEmptyState()}
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

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#1b5e20" />
        </View>
      )}

      {/* FAB to empty trash */}
      {/* Empty Trash FAB removed as requested */}
    </SafeAreaView>
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
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 12,
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
    paddingVertical: 12,
    paddingHorizontal: 14,
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
    color: '#1b5e20',
    marginLeft: 8,
  },
  separator: {
    height: 8,
  },
  selectAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  restore: {
    backgroundColor: '#2e7d32',
  },
  delete: {
    backgroundColor: '#d32f2f',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  empty: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: 'gray',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.6)', // subtle blur-like overlay
  },
  // Styles for removed Empty Trash FAB have been deleted
});
