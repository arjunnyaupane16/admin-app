import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import { updateOrder } from './utils/orderApi';

const EditOrder = () => {
  const { orderData } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Initialize order data
  useEffect(() => {
    const initOrder = async () => {
      try {
        if (!orderData) {
          throw new Error('No order data provided');
        }

        // Parse the order data
        const parsedOrder = typeof orderData === 'string' 
          ? JSON.parse(orderData) 
          : orderData;

        // Ensure required fields exist
        if (!parsedOrder?._id) {
          throw new Error('Invalid order data: Missing required fields');
        }

        // Initialize with default values if they don't exist
        const initializedOrder = {
          _id: parsedOrder._id,
          customer: {
            name: '',
            phone: '',
            ...(parsedOrder.customer || {})
          },
          specialInstructions: parsedOrder.specialInstructions || '',
          paymentMethod: parsedOrder.paymentMethod || '',
          items: Array.isArray(parsedOrder.items) 
            ? parsedOrder.items.map(item => ({
                id: item.id || Math.random().toString(36).substr(2, 9),
                name: item.name || '',
                quantity: item.quantity || 1,
                modifiers: Array.isArray(item.modifiers) ? item.modifiers : []
              }))
            : [],
          ...parsedOrder
        };

        setOrder(initializedOrder);
        setError(null);
      } catch (err) {
        console.error('Error initializing order:', err);
        setError(err.message || 'Failed to load order data');
      } finally {
        setIsLoading(false);
      }
    };

    initOrder();
  }, [orderData]);

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  // Show error state
  if (error || !order) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>
          {error || 'Failed to load order details'}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Save handler to update order in backend
  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple saves
    
    try {
      setIsSaving(true);
      
      // Basic validation
      if (!order.customer?.name?.trim()) {
        throw new Error('Customer name is required');
      }
      
      if (!order.customer?.phone?.trim()) {
        throw new Error('Customer phone number is required');
      }
      
      // Prepare the order data for submission
      const orderToUpdate = {
        ...order,
        customer: {
          name: order.customer.name.trim(),
          phone: order.customer.phone.trim()
        },
        specialInstructions: order.specialInstructions?.trim() || undefined,
        paymentMethod: order.paymentMethod?.trim() || undefined,
        // Ensure items have required fields
        items: order.items?.map(item => ({
          ...item,
          name: item.name?.trim() || 'Unnamed Item',
          quantity: Number(item.quantity) || 1,
          modifiers: Array.isArray(item.modifiers) 
            ? item.modifiers.filter(Boolean).map(m => m.trim())
            : []
        })).filter(item => item.name !== 'Unnamed Item' || item.quantity > 0)
      };
      
      console.log('Updating order:', orderToUpdate);
      
      await updateOrder(order._id, orderToUpdate);
      
      if (Platform.OS === 'web') {
        alert('Order updated successfully!');
        router.back();
      } else {
        Alert.alert(
          'Success', 
          'Order updated successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => router.back() 
            }
          ]
        );
      }
      
    } catch (error) {
      console.error('Failed to update order:', error);
      
      let errorMessage = 'Failed to update order. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setOrder(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle customer field changes
  const handleCustomerChange = (field, value) => {
    setOrder(prev => ({
      ...prev,
      customer: {
        ...(prev.customer || {}),
        [field]: value
      }
    }));
  };

  // Update item field
  const updateItem = (index, field, value) => {
    // If updating name and it contains (Half) or (Full), extract the plate type
    if (field === 'name') {
      const halfMatch = value.match(/\(Half\)/i);
      const fullMatch = value.match(/\(Full\)/i);
      
      setOrder(prev => {
        const newItems = [...prev.items];
        const newItem = { ...newItems[index] };
        
        // Remove any existing plate type from the name
        const cleanName = value.replace(/\(Half\)/i, '').replace(/\(Full\)/i, '').trim();
        
        newItem.name = cleanName;
        
        // Update plateType based on the name
        if (halfMatch) {
          newItem.plateType = 'half';
        } else if (fullMatch) {
          newItem.plateType = 'full';
        } else if (!newItem.plateType) {
          // Default to full if no plate type is specified
          newItem.plateType = 'full';
        }
        
        newItems[index] = newItem;
        return { ...prev, items: newItems };
      });
    } else {
      setOrder(prev => {
        const newItems = [...prev.items];
        newItems[index] = { ...newItems[index], [field]: value };
        return { ...prev, items: newItems };
      });
    }
  };

  // Toggle plate type between half and full
  const togglePlateType = (index) => {
    setOrder(prev => {
      const newItems = [...prev.items];
      const currentType = newItems[index].plateType || 'full';
      newItems[index] = {
        ...newItems[index],
        plateType: currentType === 'half' ? 'full' : 'half'
      };
      return { ...prev, items: newItems };
    });
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    updateItem(index, field, value);
  };

  // Add new item
  const addNewItem = () => {
    setOrder(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: '',
          quantity: 1,
          plateType: 'full', // Default to full plate
          modifiers: []
        }
      ]
    }));
  };

  // Remove item
  const removeItem = (index) => {
    setOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Add modifier to item
  const addModifier = (itemIndex, modifier) => {
    setOrder(prev => {
      const newItems = [...prev.items];
      const item = { ...newItems[itemIndex] };
      
      if (!item.modifiers) {
        item.modifiers = [];
      }
      
      if (modifier.trim() && !item.modifiers.includes(modifier.trim())) {
        item.modifiers = [...item.modifiers, modifier.trim()];
      }
      
      newItems[itemIndex] = item;
      return { ...prev, items: newItems };
    });
  };

  // Remove modifier from item
  const removeModifier = (itemIndex, modifierIndex) => {
    setOrder(prev => {
      const newItems = [...prev.items];
      const item = { ...newItems[itemIndex] };
      
      if (Array.isArray(item.modifiers)) {
        item.modifiers = item.modifiers.filter((_, i) => i !== modifierIndex);
      }
      
      newItems[itemIndex] = item;
      return { ...prev, items: newItems };
    });
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Edit Order #{order._id.substring(0, 6)}</Text>

      {/* Order ID (readonly) */}
      <Text style={styles.label}>Order ID</Text>
      <TextInput
        value={order._id}
        editable={false}
        style={[styles.input, { backgroundColor: '#eee' }]}
      />

      {/* Customer Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        
        {/* Customer Name */}
        <Text style={styles.label}>Name *</Text>
        <TextInput
          value={order.customer?.name || ''}
          onChangeText={(text) => handleCustomerChange('name', text)}
          style={styles.input}
          placeholder="Enter customer name"
          placeholderTextColor="#999"
          autoCapitalize="words"
          returnKeyType="next"
        />

        {/* Customer Phone */}
        <Text style={styles.label}>Phone *</Text>
        <TextInput
          value={order.customer?.phone || ''}
          onChangeText={(text) => handleCustomerChange('phone', text.replace(/[^0-9+\-() ]/g, ''))}
          style={styles.input}
          placeholder="Enter phone number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          returnKeyType="next"
        />
      </View>

      {/* Order Items Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <TouchableOpacity onPress={addNewItem} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>
        </View>

        {order.items?.map((item, index) => (
          <View key={item.id} style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemNumber}>#{index + 1}</Text>
              <TouchableOpacity 
                onPress={() => removeItem(index)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <TextInput
                value={item.name}
                onChangeText={(text) => updateItem(index, 'name', text)}
                style={[styles.input, styles.itemInput, { flex: 1, marginRight: 8 }]}
                placeholder="Item name"
                placeholderTextColor="#999"
                autoCapitalize="words"
                returnKeyType="next"
              />
              <TouchableOpacity 
                onPress={() => togglePlateType(index)}
                style={[styles.plateButton, { backgroundColor: item.plateType === 'half' ? '#6a1b9a' : '#9c27b0' }]}
              >
                <Text style={styles.plateButtonText}>
                  {item.plateType === 'half' ? '½' : 'Full'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              value={String(item.quantity || 1)}
              onChangeText={(text) => updateItem(index, 'quantity', text)}
              style={styles.input}
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Modifiers</Text>
            <View style={styles.modifiersContainer}>
              {item.modifiers?.map((modifier, modIndex) => (
                <View key={modIndex} style={styles.modifierTag}>
                  <Text style={styles.modifierText}>{modifier}</Text>
                  <TouchableOpacity 
                    onPress={() => removeModifier(index, modIndex)}
                    style={styles.removeModifierButton}
                  >
                    <Text style={styles.removeModifierText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              <View style={styles.addModifierContainer}>
                <TextInput
                  placeholder="Add modifier"
                  placeholderTextColor="#999"
                  style={[styles.input, styles.modifierInput]}
                  onSubmitEditing={(e) => {
                    addModifier(index, e.nativeEvent.text);
                    e.nativeEvent.text = '';
                  }}
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Order Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Details</Text>
        
        {/* Special Instructions */}
        <Text style={styles.label}>Special Instructions</Text>
        <TextInput
          value={order.specialInstructions || ''}
          onChangeText={(text) => handleInputChange('specialInstructions', text)}
          style={[styles.input, { height: 80 }]}
          multiline
          placeholder="Any special instructions for this order?"
          placeholderTextColor="#999"
        />

        {/* Payment Method */}
        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.paymentMethodContainer}>
          {['Cash', 'Credit Card', 'Mobile Payment', 'Other'].map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.paymentMethodButton,
                order.paymentMethod === method && styles.paymentMethodSelected
              ]}
              onPress={() => handleInputChange('paymentMethod', method)}
            >
              <Text style={[
                styles.paymentMethodText,
                order.paymentMethod === method && styles.paymentMethodTextSelected
              ]}>
                {method}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
          disabled={isSaving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.saveButton,
            isSaving && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={isSaving || !order.customer?.name?.trim() || !order.customer?.phone?.trim()}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditOrder;

const styles = StyleSheet.create({
  // Layout
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  // Typography
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#444',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#555',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  // Sections
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  // Form Elements
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#A0C8FF',
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Items
  itemContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemNumber: {
    fontWeight: 'bold',
    color: '#666',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#f44336',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
    marginTop: -2,
  },
  
  // Quantity & Price
  quantityRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quantityContainer: {
    flex: 1,
  },
  priceContainer: {
    flex: 1,
  },
  quantityInput: {
    textAlign: 'center',
    padding: 10,
  },
  priceInput: {
    textAlign: 'center',
    padding: 10,
  },
  
  // Modifiers
  modifiersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  modifierTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingVertical: 4,
    paddingLeft: 10,
    paddingRight: 6,
  },
  modifierText: {
    fontSize: 13,
    color: '#1565c0',
    marginRight: 4,
  },
  removeModifierButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#bbdefb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeModifierText: {
    color: '#0d47a1',
    fontSize: 14,
    lineHeight: 16,
  },
  addModifierContainer: {
    flex: 1,
    minWidth: 120,
  },
  modifierInput: {
    height: 32,
    padding: 6,
    fontSize: 13,
    marginBottom: 0,
  },
  
  // Payment Methods
  paymentMethodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  paymentMethodButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  paymentMethodSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#90caf9',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#555',
  },
  paymentMethodTextSelected: {
    color: '#1976d2',
    fontWeight: '500',
  },
  
  // Retry Button
  retryButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
