// components/OrderCard.new.js
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Linking,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
  Vibration,
  findNodeHandle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
// Using inline styles since the external styles file might not exist
const styles = {
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 10,
    marginVertical: 8,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 6,
    borderLeftColor: '#6a1b9a',
  },
  orderCardContent: {
    padding: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 4,
  },
  orderStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginRight: 12,
    overflow: 'hidden',
  },
  pulsingDot: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  expandedContent: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  phoneText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderColor: '#f0f0f0',
    borderWidth: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2c3e50',
    marginRight: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  moreButton: {
    backgroundColor: '#8E8E93',
  },
  orderFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  orderIdFull: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  oldOrderWarning: {
    fontSize: 12,
    color: '#FF3B30',
    fontStyle: 'italic',
    marginTop: 4,
  },
};
import { deleteOrder, markOrderAsPaid, updateOrderStatus } from '../utils/orderApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OrderCard = ({
  order,
  onActionComplete = () => {},
  showNotificationDot = false,
  scrollViewRef,
  isFirstRender = false,
  notificationSettings = { sound: false, vibration: true },
  isSelected = false,
  onLongPress = () => {},
}) => {
  // State
  const [expanded, setExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dotPressed, setDotPressed] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeAction, setSwipeAction] = useState(null);
  
  // Refs
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const cardRef = useRef(null);
  const panResponderRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  
  // Setup pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    if (showNotificationDot) {
      pulse.start();
    } else {
      pulse.stop();
      pulseAnim.setValue(1);
    }
    
    return () => pulse.stop();
  }, [showNotificationDot, pulseAnim]);
  
  // Navigation
  const navigation = useNavigation();
  const router = useRouter();

  // Animation for expand/collapse
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // Play notification sound
  const playNotificationSound = useCallback(async () => {
    if (!notificationSettings.sound) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }, [notificationSettings.sound]);

  // Setup pan responder for swipe gestures
  useEffect(() => {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, gestureState) => {
        touchStartX.current = gestureState.x0;
        touchStartY.current = gestureState.y0;
      },
      onPanResponderMove: (e, gestureState) => {
        const dx = gestureState.moveX - touchStartX.current;
        const dy = gestureState.moveY - touchStartY.current;

        if (Math.abs(dx) > Math.abs(dy) * 2 && Math.abs(dx) > 10) {
          setIsSwiping(true);
          slideAnim.setValue(dx);
          setSwipeAction(dx > 0 ? 'call' : 'delete');
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        const dx = gestureState.moveX - touchStartX.current;

        if (Math.abs(dx) > SCREEN_WIDTH * 0.3) {
          Animated.timing(slideAnim, {
            toValue: dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true
          }).start(() => {
            if (dx > 0) {
              handleCallCustomer();
            } else {
              handleDelete();
            }
            slideAnim.setValue(0);
            setIsSwiping(false);
          });
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 10,
            useNativeDriver: true
          }).start(() => {
            setIsSwiping(false);
          });
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 10,
          useNativeDriver: true
        }).start(() => {
          setIsSwiping(false);
        });
      }
    });
  }, [handleCallCustomer, handleDelete, slideAnim]);

  // Toggle expand/collapse
  const toggleExpand = useCallback(() => {
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: expanded ? 0 : 1,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: expanded ? 1 : 1.02,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      })
    ]).start();
    setExpanded(!expanded);
  }, [expanded, rotateAnim, scaleAnim]);

  // Handle dot press with animation
  const handleDotPress = useCallback(() => {
    setDotPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Scroll the card into view
    if (scrollViewRef?.current && cardRef?.current) {
      cardRef.current.measureLayout(
        findNodeHandle(scrollViewRef.current),
        (x, y) => {
          scrollViewRef.current?.scrollTo({
            y: y - 20,
            animated: true,
            duration: 500
          });
        },
        () => console.log('measurement failed')
      );
    }

    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true
      })
    ]).start();

    // Reset after animation
    setTimeout(() => setDotPressed(false), 1500);
  }, [scrollViewRef, scaleAnim]);

  // Handle call customer
  const handleCallCustomer = useCallback(() => {
    if (order.customer?.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Linking.openURL(`tel:${order.customer.phone}`);
    } else {
      Alert.alert('No Phone Number', 'Customer phone number is not available');
    }
  }, [order.customer?.phone]);

  // Handle mark as paid with confirmation
  const handleMarkAsPaid = useCallback(() => {
    Alert.alert(
      'Confirm',
      'Mark this order as paid?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark as Paid', style: 'default', onPress: async () => {
            try {
              setIsProcessing(true);
              console.log('Marking order as paid:', order._id);
              const response = await markOrderAsPaid(order._id);
              console.log('Mark as paid response:', response);

              if (!response) throw new Error('No response from server');

              const updatedOrder = {
                ...order,
                paymentStatus: 'paid',
                status: 'confirmed',
                ...response
              };

              onActionComplete?.(updatedOrder, 'paid');
              // No success message, UI will update automatically
            } catch (error) {
              console.error('Error marking order as paid:', error);
              Alert.alert('Error', error.message || 'Failed to mark order as paid');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  }, [order, onActionComplete]);

  // Handle delete order with confirmation
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Order',
      'Are you sure you want to delete this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              setIsProcessing(true);
              console.log('Deleting order:', order._id);
              const response = await deleteOrder(order._id, 'orderCard');
              console.log('Delete response:', response);

              if (!response) throw new Error('No response from server');

              const deletedOrder = {
                ...order,
                status: 'deleted',
                deletedFrom: 'orderCard',
                ...response
              };

              onActionComplete?.(deletedOrder, 'deleted');

              // Fade out animation before deletion
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
              }).start(() => {
                Alert.alert('Success', 'Order deleted');
              });
            } catch (error) {
              console.error('Error deleting order:', error);
              Alert.alert('Error', error.message || 'Failed to delete order');
              fadeAnim.setValue(1);
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  }, [order, onActionComplete, fadeAnim]);

  // Format date and time for display
  const formatDate = useCallback(() => {
    try {
      return format(new Date(order.createdAt), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  }, [order.createdAt]);

  const formatTime = useCallback(() => {
    try {
      return format(new Date(order.createdAt), 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Unknown time';
    }
  }, [order.createdAt]);

  // Show action menu
  const showActionMenu = useCallback(() => {
    console.log('Showing action menu');
  }, []);

  return (
    <Animated.View 
      style={[
        styles.orderCard,
        { 
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }]
        }
      ]}
      ref={cardRef}
      {...(panResponderRef.current?.panHandlers || {})}
    >
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={toggleExpand}
        onLongPress={onLongPress}
        style={styles.orderCardContent}
        disabled={isProcessing}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>
              Order #{order.orderNumber || order._id?.slice(-4) || 'N/A'}
            </Text>
            <Text style={styles.orderStatus}>
              {order.status === 'confirmed' ? 'Confirmed' : 'Pending'}
              {order.paymentStatus === 'paid' ? ' • Paid' : ' • Unpaid'}
            </Text>
          </View>
          
          <View style={styles.orderActions}>
            {showNotificationDot && (
              <TouchableOpacity onPress={handleDotPress} style={styles.notificationDot}>
                <Animated.View 
                  style={[
                    styles.pulsingDot, 
                    { transform: [{ scale: dotPressed ? 1 : pulseAnim }] }
                  ]} 
                />
              </TouchableOpacity>
            )}
            
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Icon name="keyboard-arrow-down" size={24} color="#666" />
            </Animated.View>
          </View>
        </View>

        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>
                {order.customer?.name || 'Guest Customer'}
              </Text>
              {order.customer?.phone && (
                <TouchableOpacity 
                  style={styles.phoneButton}
                  onPress={handleCallCustomer}
                  disabled={isProcessing}
                >
                  <Icon name="phone" size={16} color="#fff" />
                  <Text style={styles.phoneText}>
                    {order.customer.phone}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.orderItems}>
              {order.items?.map((item, index) => (
                <View key={`${item.id || index}`} style={styles.orderItem}>
                  <Text style={styles.itemName}>
                    {item.quantity}x {item.name}
                  </Text>
                  <Text style={styles.itemPrice}>
                    Rs.{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.orderTotal}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>
                Rs.{order.total?.toFixed(2) || '0.00'}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              {order.paymentStatus !== 'paid' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                  onPress={handleMarkAsPaid}
                  disabled={isProcessing}
                  testID="mark-paid-button"
                >
                  <Icon name="check" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Mark as Paid</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#f44336' }]}
                onPress={handleDelete}
                disabled={isProcessing}
                testID="delete-button"
              >
                <Icon name="delete" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.moreButton]}
                onPress={showActionMenu}
                disabled={isProcessing}
              >
                <Icon name="more-horiz" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>More</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.orderFooter}>
              <Text style={styles.orderDate}>
                Ordered on {formatDate()} at {formatTime()}
              </Text>
              <Text style={styles.orderIdFull}>
                Order ID: {order._id || 'N/A'}
              </Text>
              {order.scheduledForDeletion && (
                <Text style={styles.oldOrderWarning}>
                  This order is older than 24 hours and will be automatically deleted soon
                </Text>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default OrderCard;
