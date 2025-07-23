import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { updateOrder } from './utils/orderApi';

const EditOrder = () => {
  const { orderData } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderData) {
      try {
        setOrder(JSON.parse(orderData));
      } catch (e) {
        console.error('Invalid order data:', e);
      }
    }
  }, [orderData]);

  if (!order) {
    return (
      <View style={styles.container}>
        <Text>Loading order...</Text>
      </View>
    );
  }

  // Save handler to update order in backend
  const handleSave = async () => {
    try {
      await updateOrder(order._id, order);
      Alert.alert('Success', 'Order updated successfully!');
      router.back();
    } catch (error) {
      console.error('Failed to update order:', error);
      Alert.alert('Error', 'Failed to update order. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Edit Order</Text>

      {/* Order ID (readonly) */}
      <Text style={styles.label}>Order ID</Text>
      <TextInput
        value={order._id}
        editable={false}
        style={[styles.input, { backgroundColor: '#eee' }]}
      />

      {/* Customer Name */}
      <Text style={styles.label}>Customer Name</Text>
      <TextInput
        value={order.customer?.name || ''}
        onChangeText={(text) =>
          setOrder({
            ...order,
            customer: { ...order.customer, name: text }
          })
        }
        style={styles.input}
      />

      {/* Customer Phone */}
      <Text style={styles.label}>Customer Phone</Text>
      <TextInput
        value={order.customer?.phone || ''}
        onChangeText={(text) =>
          setOrder({
            ...order,
            customer: { ...order.customer, phone: text }
          })
        }
        keyboardType="phone-pad"
        style={styles.input}
      />

      {/* Special Instructions */}
      <Text style={styles.label}>Special Instructions</Text>
      <TextInput
        value={order.specialInstructions || ''}
        onChangeText={(text) =>
          setOrder({ ...order, specialInstructions: text })
        }
        style={[styles.input, { height: 80 }]}
        multiline
      />

      {/* Payment Method */}
      <Text style={styles.label}>Payment Method</Text>
      <TextInput
        value={order.paymentMethod || ''}
        onChangeText={(text) =>
          setOrder({ ...order, paymentMethod: text })
        }
        style={styles.input}
      />

      {/* --- New: Edit Items --- */}
      <Text style={styles.title}>Edit Items</Text>
      {order.items && order.items.length > 0 ? (
        order.items.map((item, index) => (
          <View key={item.id || index} style={styles.itemContainer}>

            <Text style={styles.label}>Item Name</Text>
            <TextInput
              value={item.name}
              onChangeText={(text) => {
                const newItems = [...order.items];
                newItems[index].name = text;
                setOrder({ ...order, items: newItems });
              }}
              style={styles.input}
            />

            <Text style={styles.label}>Quantity</Text>
            <TextInput
              value={String(item.quantity)}
              keyboardType="numeric"
              onChangeText={(text) => {
                const qty = parseInt(text) || 0;
                const newItems = [...order.items];
                newItems[index].quantity = qty;
                setOrder({ ...order, items: newItems });
              }}
              style={styles.input}
            />

            <Text style={styles.label}>Modifiers (comma separated)</Text>
            <TextInput
              value={item.modifiers ? item.modifiers.join(', ') : ''}
              onChangeText={(text) => {
                const newItems = [...order.items];
                newItems[index].modifiers = text
                  .split(',')
                  .map((m) => m.trim())
                  .filter((m) => m.length > 0);
                setOrder({ ...order, items: newItems });
              }}
              style={styles.input}
            />
          </View>
        ))
      ) : (
        <Text>No items found.</Text>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditOrder;

const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8
  },
  label: {
    fontSize: 16,
    marginTop: 12
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginTop: 4
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center'
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  itemContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fafafa'
  }
});
