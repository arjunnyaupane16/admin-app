import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import DashboardStyles from '../styles/DashboardStyles';
import { deleteOrder, fetchAdminOrders } from '../utils/orderApi';

const screenWidth = Dimensions.get('window').width;
// Account for container padding (15*2) and chart card padding (15*2)
const chartWidth = Math.max(220, screenWidth - 60);

export default function DashboardIndexScreen() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [dateFilterModalVisible, setDateFilterModalVisible] = useState(false);
  const [dateFilterType, setDateFilterType] = useState('daily');

  const styles = DashboardStyles;
  // Load orders when screen focused
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [selectedDate, dateFilterType])
  );

  // Filter logic
  useEffect(() => {
    applyFilters();
  }, [orders, search, activeFilter]);

  // Load all orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await fetchAdminOrders();

      // Filter by date range
      let dateFilteredOrders = allOrders.filter(order => {
        const createdAt = new Date(order.createdAt);
        switch (dateFilterType) {
          case 'daily':
            return isSameDay(createdAt, selectedDate);
          case 'weekly':
            return isSameWeek(createdAt, selectedDate);
          case 'monthly':
            return isSameMonth(createdAt, selectedDate);
          case 'yearly':
            return isSameYear(createdAt, selectedDate);
          default:
            return isSameDay(createdAt, selectedDate);
        }
      });

      // Exclude all soft-deleted from display (regardless of source)
      const visibleOrders = dateFilteredOrders.filter(order => order.status !== 'deleted');
      setOrders(visibleOrders);

      // Compute stats from full filtered list
      const statsData = computeStats(dateFilteredOrders);
      setStats(statsData);

    } catch (err) {
      console.error('Error loading orders:', err);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Date comparison functions
  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isSameWeek = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(Math.abs((date1 - date2) / oneDay));
    return diffDays < 7 && date1.getDay() <= date2.getDay();
  };

  const isSameMonth = (date1, date2) => {
    return (
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isSameYear = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear();
  };

  const computeStats = (orders) => {
    const confirmed = orders.filter(o => o.status === 'confirmed');
    const pending = orders.filter(o => o.status === 'pending');
    const deleted = orders.filter(o => o.status === 'deleted' && o.deletedFrom === 'admin');
    const earnings = confirmed.reduce((sum, o) => sum + o.totalAmount, 0);
    const loss = deleted.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      total: orders.length,
      confirmed: confirmed.length,
      pending: pending.length,
      deleted: deleted.length,
      earnings,
      loss,
      popularItems: getPopularItems(orders),
      orderTypes: getOrderTypes(orders),
      hourlyData: getHourlyData(orders),
    };
  };

  const getPopularItems = (orders) => {
    const itemCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = `${item.name}-${item.size}`;
        itemCounts[key] = (itemCounts[key] || 0) + item.quantity;
      });
    });

    return Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([item, count]) => ({ item, count }));
  };

  const getOrderTypes = (orders) => {
    const types = {};
    orders.forEach(order => {
      types[order.orderType] = (types[order.orderType] || 0) + 1;
    });
    return types;
  };

  const getHourlyData = (orders) => {
    const hours = Array(24).fill(0);
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hours[hour]++;
    });
    return hours;
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (activeFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === activeFilter);
    }

    if (search.trim()) {
      filtered = filtered.filter(
        (o) =>
          o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
          o.customer?.phone?.includes(search) ||
          o._id.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const exportCSV = async () => {
    try {
      if (!filteredOrders || filteredOrders.length === 0) {
        Alert.alert('No Data', 'There are no orders to export for the selected filters.');
        return;
      }

      const escapeCSV = (val) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        // escape quotes by doubling them and wrap in quotes if contains comma or quote or newline
        if (/[",\n]/.test(str)) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };

      const header = ['ID', 'Name', 'Phone', 'Type', 'Table', 'Items', 'Total', 'Status', 'Payment', 'Date'];
      const body = filteredOrders.map((o) => [
        o._id,
        o.customer?.name || 'N/A',
        o.customer?.phone || 'N/A',
        o.orderType,
        o.tableNumber || '-',
        o.items.map(i => `${i.name}(${i.size})x${i.quantity}`).join('; '),
        o.totalAmount,
        o.status,
        o.paymentMethod,
        new Date(o.createdAt).toLocaleString(),
      ]);

      const csv = [header, ...body]
        .map(row => row.map(escapeCSV).join(','))
        .join('\n');

      // Sanitize filename and provide web/native implementations
      const rawName = `Drift&Sip_orders_${selectedDate.toISOString().split('T')[0]}.csv`;
      const filename = rawName.replace(/[\\/:*?"<>|]/g, '_');

      if (Platform.OS === 'web') {
        // Web: trigger a download via Blob
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert('Exported', 'CSV downloaded.');
        return;
      }

      // Native: save and share
      const path = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Export Orders' });
      } else {
        Alert.alert('Exported', `CSV saved to: ${path}`);
      }
    } catch (err) {
      console.error('Export failed:', err);
      Alert.alert('Error', 'Failed to export CSV');
    }
  };

  const handleOrderPress = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleDeleteOrder = async () => {
    try {
      await deleteOrder(selectedOrder._id, { deletedFrom: 'admin' });
      setShowOrderModal(false);
      loadOrders();
      Alert.alert('Success', 'Order moved to trash');
    } catch (err) {
      console.error('Delete failed:', err);
      Alert.alert('Error', 'Failed to delete order');
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        item.status === 'confirmed' && styles.cardConfirmed,
        item.status === 'pending' && styles.cardPending,
        item.status === 'deleted' && styles.cardDeleted,
      ]}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.customer?.name || 'No Name'}</Text>
        <Text style={styles.orderId}>#{item._id.slice(-6)}</Text>
      </View>
      <Text>{item.customer?.phone || 'No Phone'}</Text>
      <Text>
        {item.orderType} {item.tableNumber ? `(Table ${item.tableNumber})` : ''}
      </Text>
      <Text>{item.paymentMethod}</Text>
      <Text>{item.items.reduce((sum, i) => sum + i.quantity, 0)} items</Text>
      <Text style={styles.totalAmount}>Rs. {item.totalAmount}</Text>
      <View style={[
        styles.statusBadge,
        item.status === 'confirmed' && styles.statusConfirmed,
        item.status === 'pending' && styles.statusPending,
        item.status === 'deleted' && styles.statusDeleted,
      ]}>
        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );

  const StatButton = ({ label, count, filterKey, icon }) => (
    <TouchableOpacity
      style={[styles.statCard, activeFilter === filterKey && styles.activeCard]}
      onPress={() => {
        if (label === 'Total') {
          router.push({
            pathname: '/total-orders',
            params: {
              orders: JSON.stringify(orders),
              dateFilterType,
              selectedDate: selectedDate.toISOString()
            }
          });
        } else if (label === 'Deleted') {
          router.push('/deleted-orders');
        } else {
          setActiveFilter(filterKey);
        }
      }}
    >
      <Text style={styles.statLabel}>{icon} {label}</Text>
      <Text style={styles.statValue}>{count}</Text>
    </TouchableOpacity>
  );

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderDateFilterModal = () => (
    <Modal
      visible={dateFilterModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setDateFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.dateFilterModal}>
          <Text style={styles.modalTitle}>Select Date Range</Text>

          <TouchableOpacity
            style={[styles.dateFilterOption, dateFilterType === 'daily' && styles.selectedFilter]}
            onPress={() => {
              setDateFilterType('daily');
              setDateFilterModalVisible(false);
            }}
          >
            <Text style={styles.dateFilterText}>Daily</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateFilterOption, dateFilterType === 'weekly' && styles.selectedFilter]}
            onPress={() => {
              setDateFilterType('weekly');
              setDateFilterModalVisible(false);
            }}
          >
            <Text style={styles.dateFilterText}>Weekly</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateFilterOption, dateFilterType === 'monthly' && styles.selectedFilter]}
            onPress={() => {
              setDateFilterType('monthly');
              setDateFilterModalVisible(false);
            }}
          >
            <Text style={styles.dateFilterText}>Monthly</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateFilterOption, dateFilterType === 'yearly' && styles.selectedFilter]}
            onPress={() => {
              setDateFilterType('yearly');
              setDateFilterModalVisible(false);
            }}
          >
            <Text style={styles.dateFilterText}>Yearly</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeFilterButton}
            onPress={() => setDateFilterModalVisible(false)}
          >
            <Text style={styles.closeFilterText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>


      <Text style={styles.heading}>📊 Restaurant Dashboard</Text>

      <View style={styles.dateFilterContainer}>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.datePickerText}>📅 {formatDate(selectedDate)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateTypeButton}
          onPress={() => setDateFilterModalVisible(true)}
        >
          <Text style={styles.dateTypeText}>
            {dateFilterType.charAt(0).toUpperCase() + dateFilterType.slice(1)}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="green" style={styles.loading} />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <StatButton label="Total" count={stats.total} filterKey="all" />
            <StatButton label="Confirmed" count={stats.confirmed} filterKey="confirmed" />
            <StatButton label="Pending" count={stats.pending} filterKey="pending" />
            <StatButton label="Deleted" count={stats.deleted} filterKey="deleted" />
          </View>

          {/* Charts Section */}
          <View style={styles.chartsContainer}>
            <Text style={styles.sectionTitle}>📈 Order Trends</Text>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Orders by Hour ({dateFilterType})</Text>
              <BarChart
                data={{
                  labels: Array.from({ length: 24 }, (_, i) => String(i)),
                  datasets: [{
                    data: stats.hourlyData || Array(24).fill(0)
                  }]
                }}
                width={chartWidth}
                height={220}
                yAxisLabel=""
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  barPercentage: 0.7,
                  color: (opacity = 1) => `rgba(71, 123, 68, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                  propsForBackgroundLines: {
                    stroke: '#e5e7eb',
                    strokeDasharray: '0',
                  },
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
                fromZero
              />
            </View>

            <View style={styles.chartRow}>
              <View style={[styles.chartCard, { flex: 1 }]}>
                <Text style={styles.chartTitle}>Order Types</Text>
                {Object.keys(stats.orderTypes || {}).length ? (
                  <PieChart
                    data={Object.entries(stats.orderTypes || {}).map(([name, count], index) => ({
                      name,
                      count,
                      color: ['#477b44', '#1f5265', '#3a7ca5', '#2f6690', '#16425b'][index % 5],
                      legendFontColor: '#6b7280',
                      legendFontSize: 12
                    }))}
                    width={Math.max(180, chartWidth / 2 - 15)}
                    height={160}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                    }}
                    accessor="count"
                    backgroundColor="transparent"
                    paddingLeft="8"
                    absolute
                  />
                ) : (
                  <Text style={{ color: '#6b7280' }}>No order type data</Text>
                )}
              </View>

              <View style={[styles.chartCard, { flex: 1 }]}>
                <Text style={styles.chartTitle}>Popular Items</Text>
                <View style={styles.popularItems}>
                  {stats.popularItems?.map((item, index) => (
                    <View key={index} style={styles.popularItem}>
                      <Text style={styles.popularItemName}>
                        {index + 1}. {item.item.split('-')[0]}
                      </Text>
                      <Text style={styles.popularItemCount}>x{item.count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Search and Export */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Search by name, phone or ID"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.exportContainer}>
            <TouchableOpacity style={styles.exportButton} onPress={exportCSV}>
              <Text style={styles.exportText}>📥 Export CSV</Text>
            </TouchableOpacity>
          </View>

          {/* Orders List */}
          <Text style={styles.sectionTitle}>
            🛒 Orders ({filteredOrders.length})
          </Text>

          {filteredOrders.length === 0 ? (
            <Text style={styles.emptyText}>No orders found</Text>
          ) : (
            <FlatList
              data={filteredOrders}
              keyExtractor={(item) => item._id}
              renderItem={renderOrderItem}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          )}
        </ScrollView>
      )}

      {/* Order Detail Modal */}
      <Modal
        visible={showOrderModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowOrderModal(false)}
      >
        {selectedOrder && (
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalTitle}>Order Details</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order ID:</Text>
                <Text style={styles.detailValue}>#{selectedOrder._id}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Customer:</Text>
                <Text style={styles.detailValue}>
                  {selectedOrder.customer?.name || 'No Name'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>
                  {selectedOrder.customer?.phone || 'No Phone'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order Type:</Text>
                <Text style={styles.detailValue}>{selectedOrder.orderType}</Text>
              </View>

              {selectedOrder.tableNumber && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Table:</Text>
                  <Text style={styles.detailValue}>{selectedOrder.tableNumber}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment:</Text>
                <Text style={styles.detailValue}>{selectedOrder.paymentMethod}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={[
                  styles.statusBadge,
                  selectedOrder.status === 'confirmed' && styles.statusConfirmed,
                  selectedOrder.status === 'pending' && styles.statusPending,
                  selectedOrder.status === 'deleted' && styles.statusDeleted,
                ]}>
                  <Text style={styles.statusText}>{selectedOrder.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </Text>
              </View>

              <Text style={styles.itemsTitle}>Order Items:</Text>
              {selectedOrder.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemName}>
                    {item.quantity}x {item.name} ({item.size})
                  </Text>
                  <Text style={styles.itemPrice}>Rs. {item.price * item.quantity}</Text>
                </View>
              ))}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>Rs. {selectedOrder.totalAmount}</Text>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowOrderModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>

              {selectedOrder.status !== 'deleted' && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteOrder}
                >
                  <Text style={styles.deleteButtonText}>Delete Order</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </Modal>

      {/* Date Filter Modal */}
      {renderDateFilterModal()}
    </View>
  );
}
