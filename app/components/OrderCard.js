// components/OrderCard.js
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  Vibration,
  View,
  findNodeHandle
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import styles from '../styles/OrdersStyles';
import { deleteOrder, markOrderAsPaid, updateOrderStatus } from '../utils/orderApi';
import { useConfirm } from './ConfirmProvider';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OrderCard = ({
  order,
  onActionComplete = () => { },
  showNotificationDot,
  scrollViewRef,
  isFirstRender,
  notificationSettings = { sound: false, vibration: true },
  isSelected = false,
  onLongPress = () => { },
  // New: control whether to navigate to deleted-orders after delete
  navigateToDeletedOnDelete = false
}) => {
  // Now you can directly use `isSelected` safely


  const playNotificationSound = async () => {
    if (!notificationSettings.sound) return;

    try {
      console.warn('Sound file not available yet. Skipping playback.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // optional fallback
    } catch (error) {
      console.error('Failed to play fallback feedback:', error);
    }
  };

  const [localPaymentStatus, setLocalPaymentStatus] = useState(order.paymentStatus);

  // Log order items to inspect structure
  useEffect(() => {
    if (order?.items) {
      console.log('Order items:', JSON.stringify(order.items, null, 2));
    }
  }, [order]);
  const [expanded, setExpanded] = useState(false);
  const isFocused = useRef(false);
  const isFirstRenderRef = useRef(isFirstRender !== undefined ? isFirstRender : true);
  const router = useRouter();
  const navigation = useNavigation();
  const { confirm } = useConfirm();
  const [showActions, setShowActions] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Calculate if order is old or very recent
  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const now = new Date();
  const hoursSinceCreation = (now - orderDate) / (1000 * 60 * 60);
  const isOld = hoursSinceCreation > 24; // More than 24 hours old
  const isVeryRecent = hoursSinceCreation < 1; // Less than 1 hour old

  const [isProcessing, setIsProcessing] = useState(false);
  const [dotPressed, setDotPressed] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeAction, setSwipeAction] = useState(null);
  const rotateAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const slideAnim = useState(new Animated.Value(0))[0];
  const cardRef = useRef(null);
  const panResponderRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Handle layout measurements
  const handleLayout = (event) => {
    // This can be used to get layout measurements if needed
    const { width, height } = event.nativeEvent.layout;
  };

  // Animation for expand/collapse
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // Enhanced pulsing animation for new orders
  useEffect(() => {
    if (showNotificationDot && isFirstRenderRef.current) {
      if (notificationSettings.sound) {
        playNotificationSound();
      }

      if (notificationSettings.vibration) {
        Vibration.vibrate([500, 200, 500]);  // only if vibration is ON
      }

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          })
        ]),
        { iterations: 3 }
      );

      pulse.start();
      return () => pulse.stop();
    }
  }, [showNotificationDot, isFirstRender, notificationSettings]);

  // Setup pan responder for swipe gestures
  useEffect(() => {
    panResponderRef.current = {
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, gestureState) => {
        touchStartX.current = gestureState.x0;
        touchStartY.current = gestureState.y0;
      },
      onPanResponderMove: (e, gestureState) => {
        const dx = gestureState.moveX - touchStartX.current;
        const dy = gestureState.moveY - touchStartY.current;

        // Only consider horizontal swipes with minimal vertical movement
        if (Math.abs(dx) > Math.abs(dy) * 2 && Math.abs(dx) > 10) {
          setIsSwiping(true);
          slideAnim.setValue(dx);

          // Determine swipe action based on direction
          if (dx > 0) {
            setSwipeAction('call');
          } else {
            setSwipeAction('delete');
          }
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        const dx = gestureState.moveX - touchStartX.current;

        if (Math.abs(dx) > SCREEN_WIDTH * 0.3) {
          // Swipe threshold reached
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
          // Swipe cancelled
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
    };
  }, []);

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

  const handleDotPress = useCallback(() => {
    setDotPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Scroll the card into view with smooth animation (web-safe)
    try {
      const listRef = scrollViewRef?.current;
      if (listRef && cardRef.current && cardRef.current.measureLayout) {
        const parentNode = findNodeHandle(listRef);
        cardRef.current.measureLayout(
          parentNode,
          (x, y) => {
            // Prefer FlatList API when available
            if (typeof listRef.scrollToOffset === 'function') {
              listRef.scrollToOffset({ offset: Math.max(y - 20, 0), animated: true });
            } else if (typeof listRef.scrollTo === 'function') {
              listRef.scrollTo({ y: Math.max(y - 20, 0), animated: true });
            }
          },
          () => console.log('measurement failed')
        );
      }
    } catch (_) {
      // no-op on platforms where measuring/scrolling isn't supported
    }

    // Bounce animation when dot is pressed
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
  }, [scrollViewRef]);

  const handleCallCustomer = useCallback(() => {
    if (order.customer?.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Linking.openURL(`tel:${order.customer.phone}`);
    } else {
      Alert.alert('No Phone Number', 'Customer phone number is not available');
    }
  }, [order.customer?.phone]);

  const handleOrderConfirm = useCallback(async () => {
    const ok = await confirm({
      title: 'Confirm Order',
      message: 'Mark this order as confirmed?',
      confirmText: 'Confirm Order',
      cancelText: 'Cancel',
    });
    if (!ok) return;
    try {
      setIsProcessing(true);
      const response = await updateOrderStatus(order._id, 'confirmed');
      if (response) {
        onActionComplete({ ...order, status: 'confirmed' }, 'confirmed');
      }
    } catch (error) {
      console.error('Error confirming order:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [order, onActionComplete, confirm]);

  const handleMarkAsPaid = useCallback(async () => {
    const ok = await confirm({
      title: 'Confirm Payment',
      message: 'Mark this order as paid?',
      confirmText: 'Mark as Paid',
      cancelText: 'Cancel',
    });
    if (!ok) return;
    try {
      setIsProcessing(true);
      const response = await markOrderAsPaid(order._id);
      if (response) {
        onActionComplete({ ...order, paymentStatus: 'paid' }, 'paid');
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [order, onActionComplete, confirm]);

  const handleDelete = useCallback(async () => {
    const ok = await confirm({
      title: 'Delete Order',
      message: 'Are you sure you want to delete this order? It will move to Deleted Orders.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true,
    });
    if (!ok) return;

    try {
      setIsProcessing(true);

      // Start fade out animation immediately for better UX
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();

      try {
        console.log('Attempting to soft-delete order:', order._id);
        const response = await deleteOrder(order._id, { deletedFrom: 'admin' });
        console.log('Soft delete response:', response);

        if (!response) {
          throw new Error('No response received from server');
        }

        const deletedOrder = {
          ...order,
          status: 'deleted',
          deletedAt: new Date().toISOString(),
          deletedFrom: 'admin',
          ...response,
        };

        // Update parent list
        onActionComplete?.(deletedOrder, 'deleted');

        // Optionally navigate to Deleted Orders
        if (navigateToDeletedOnDelete) {
          try {
            router.replace('/deleted-orders?refresh=1');
          } catch (navErr) {
            console.warn('Navigation to deleted-orders failed:', navErr?.message);
          }
        }
      } catch (apiError) {
        console.error('API Error deleting order:', apiError);
        fadeAnim.setValue(1);
        throw apiError;
      }
    } catch (error) {
      console.error('Error in delete handler:', error);
      // Avoid browser alert; rely on logs/UI updates
    } finally {
      setIsProcessing(false);
      closeAllActions?.();
    }
  }, [order, fadeAnim, onActionComplete, closeAllActions, navigateToDeletedOnDelete, confirm, router]);

  // Navigate to Edit Order screen
  const handleEdit = useCallback(() => {
    try {
      router.push({ pathname: '/EditOrder', params: { orderData: JSON.stringify(order) } });
    } catch (e) {
      console.error('Failed to navigate to EditOrder:', e);
      Alert.alert('Error', 'Unable to open edit screen.');
    } finally {
      closeAllActions();
    }
  }, [order, router]);

  // Format date and time for display
  const formatDate = () => {
    try {
      return format(new Date(order.createdAt), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  const formatTime = () => {
    try {
      return format(new Date(order.createdAt), 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Unknown time';
    }
  };

  // Close all action menus (use function declaration so it's hoisted)
  function closeAllActions() {
    // Implementation depends on your action menu implementation
    // This is a placeholder for the actual implementation
    console.log('Closing all action menus');
  }

  // Show action menu
  const showActionMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Call Customer'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleCallCustomer();
          }
        }
      );
    } else if (Platform.OS === 'web') {
      // Use in-app confirm for web too
      (async () => {
        const ok = await confirm({ title: 'Call Customer', message: 'Call customer?', confirmText: 'Call', cancelText: 'Cancel' });
        if (ok) handleCallCustomer();
      })();
    } else {
      // Android and others: Alert
      Alert.alert('Actions', 'Choose an action', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Customer', onPress: handleCallCustomer },
      ]);
    }
  };

  return (
    <Animated.View
      ref={cardRef} // Attach ref to the card container
      onLayout={handleLayout}
      style={[
        styles.orderCard,
        order.status === 'pending' && styles.orderCardPending,
        order.status === 'confirmed' && styles.orderCardConfirmed,
        (!order.status || (order.status !== 'pending' && order.status !== 'confirmed')) && styles.orderCardDefault,
        expanded && styles.expandedCard,
        isOld && styles.oldOrder,
        isVeryRecent && styles.veryRecentOrder,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={toggleExpand}
        onLongPress={onLongPress}
        style={[
          styles.orderCardContent,
          order.status === 'confirmed' && styles.statusConfirmed,
          order.status === 'completed' && styles.statusCompleted,
          order.status === 'paid' && styles.statusPaid,
          order.status === 'cancelled' && styles.statusCancelled,
          (!order.status || order.status === 'pending') && styles.statusPending,
        ]}
      >
        <View style={[styles.orderHeader, { padding: 8 }]}>
          <View style={[styles.orderInfo, { flex: 1 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.highlightTable}>
                  Table {order.tableNumber || 'N/A'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.orderId, { marginRight: 8, fontSize: 18 }]}>
                  {order.orderNumber}
                </Text>
                <Text style={styles.orderTime}>
                  {format(new Date(order.createdAt), 'h:mm a')}
                </Text>
              </View>
            </View>

            {expanded && (
              <View style={[styles.statusContainer, { alignItems: 'center', justifyContent: 'center' }]}>
                {order.status && order.status !== 'confirmed' && (
                  <View style={[
                    styles.statusBadge,
                    order.status === 'pending' && styles.statusBadgePending,
                    order.status === 'confirmed' && styles.statusBadgeConfirmed,
                    order.status === 'cancelled' && styles.statusCancelledBadge,
                    order.status === 'paid' && styles.statusPaidBadge,
                    order.status === 'completed' && styles.statusCompletedBadge,
                  ]}>
                    <Text style={styles.statusText}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.orderActions}>
            <Text style={[styles.orderTotal, { color: '#1b5e20', fontSize: 18, fontWeight: '800' }]}>
              Rs.{
                (typeof order.totalAmount === 'number'
                  ? order.totalAmount
                  : (typeof order.total === 'number' ? order.total : 0)
                ).toFixed(2)
              }
            </Text>
            <TouchableOpacity
              onPress={toggleExpand}
              disabled={isProcessing}
              style={styles.moreButton}
            >
              <Icon name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={18} color="#4a5568" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.customerInfo}>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>
                {order.customer?.name || 'Guest Customer'}
              </Text>
            {order.customer?.phone && (
              <Text style={[styles.customerName, { fontSize: 14, color: '#555', marginTop: 4 }]}>
                {order.customer.phone}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.phoneButton}
            onPress={handleCallCustomer}
            disabled={isProcessing}
          >
            <Icon name="phone" size={16} color="#fff" />
            <Text style={styles.phoneText}>Call</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orderItems}>
          {order.items?.map((item, index) => {
            // Get size from item (Half/Full)
            const size = item.size || 'Full'; // Default to Full if size is not specified

            // Clean the item name by removing any size in parentheses
            const itemName = item.name ?
              item.name.replace(/\s*\(Half|Full\)/i, '').trim() : 'Unnamed Item';

            // Format as "Item Name (Size)"
            const displayName = `${itemName} (${size})`;

            return (
              <View key={index} style={styles.orderItem}>
                <Text style={styles.itemName}>
                  {item.quantity}x {displayName}
                </Text>
                <Text style={styles.itemPrice}>
                  Rs.{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.orderTotalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>
            Rs.{
              (typeof order.totalAmount === 'number'
                ? order.totalAmount
                : (typeof order.total === 'number' ? order.total : 0)
              ).toFixed(2)
            }
          </Text>
        </View>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <View style={styles.specialInstructionsContainer}>
            <Text style={styles.specialInstructionsLabel}>Special Instructions:</Text>
            <Text style={styles.specialInstructionsText}>{order.specialInstructions}</Text>
          </View>
        )}

        <View style={styles.actionButtonsContainer}>
          {/* First Row */}
          <View style={styles.actionButtonRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.confirmButton,
                order.status === 'confirmed' && styles.buttonDisabled
              ]}
              onPress={handleOrderConfirm}
              disabled={isProcessing || order.status === 'confirmed'}
              testID="confirm-button"
            >
              <Icon name="check" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>
                {order.status === 'confirmed' ? 'Confirmed' : 'Confirm'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: '#FFA726' }
              ]}
              onPress={handleEdit}
              disabled={isProcessing}
              testID="edit-button"
            >
              <Icon name="edit" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: '#f44336' }
              ]}
              onPress={handleDelete}
              disabled={isProcessing}
              testID="delete-button"
            >
              <Icon name="delete" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>

          {/* Second Row */}
          <View style={[styles.actionButtonRow, { marginTop: 8 }]}>
            {order.paymentStatus !== 'paid' && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.payButton,
                  order.paymentStatus === 'paid' && styles.buttonDisabled
                ]}
                onPress={handleMarkAsPaid}
                disabled={isProcessing || order.paymentStatus === 'paid'}
                testID="mark-paid-button"
              >
                <Icon name="check" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>
                  {order.paymentStatus === 'paid' ? 'Paid' : 'Mark Paid'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.moreButton,
                { flex: 1, maxWidth: 120 }
              ]}
              onPress={showActionMenu}
              disabled={isProcessing}
            >
              <Icon name="more-horiz" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>More</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderDate}>
            Ordered on {formatDate()} at {formatTime()}
          </Text>
          <Text style={styles.orderIdFull}>
            Order ID: {order._id}
          </Text>
          {order.scheduledForDeletion && (
            <Text style={styles.oldOrderWarning}>
              This order is older than 24 hours and will be automatically deleted soon
            </Text>
          )}
        </View>
      </View>
    )}
    </Animated.View >
  );
};

export default OrderCard;
