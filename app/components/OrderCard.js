// components/OrderCard.js
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false
};

import { useNavigation } from '@react-navigation/native';
import { differenceInMinutes, format, isBefore, parseISO, subDays } from 'date-fns';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  Vibration,
  View,
  findNodeHandle
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/OrdersStyles';
import { deleteOrder, markOrderAsPaid, updateOrderStatus } from '../utils/orderApi';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OrderCard = ({
  order,
  onActionComplete = () => { },
  showNotificationDot,
  scrollViewRef,
  isFirstRender,
  notificationSettings = { sound: false, vibration: true },
  isSelected = false,
  onLongPress = () => { }
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
  const [expanded, setExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dotPressed, setDotPressed] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeAction, setSwipeAction] = useState(null);
  const rotateAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const slideAnim = useState(new Animated.Value(0))[0];
  const fadeAnim = useState(new Animated.Value(1))[0];
  const navigation = useNavigation();
  const cardRef = useRef(null);
  const panResponderRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const router = useRouter();
  // Animation for expand/collapse
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // Enhanced pulsing animation for new orders
  useEffect(() => {
    if (showNotificationDot && isFirstRender) {
      if (notificationSettings.sound) {
        playNotificationSound();
      }

      if (notificationSettings.vibration) {
        Vibration.vibrate([500, 200, 500]);  // ✅ only if vibration is ON
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

  const toggleExpand = () => {
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
  };

  const handleDotPress = useCallback(() => {
    setDotPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Scroll the card into view with smooth animation
    if (scrollViewRef.current && cardRef.current) {
      cardRef.current.measureLayout(
        findNodeHandle(scrollViewRef.current),
        (x, y) => {
          scrollViewRef.current.scrollTo({
            y: y - 20,
            animated: true,
            duration: 500
          });
        },
        () => console.log('measurement failed')
      );
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

  const handleCallCustomer = () => {
    if (order.customer?.phone) {
      // Add haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);


      Linking.openURL(`tel:${order.customer.phone}`);
    } else {
      Alert.alert('No Phone Number', 'Customer phone number is not available');
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await updateOrderStatus(order._id, 'confirmed');
      if (typeof onActionComplete === 'function') {
        onActionComplete();
      }


      // Success animation
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();

      Alert.alert('Confirmed', 'Order has been marked as confirmed');
    } catch (err) {
      console.error('Confirm error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to confirm order');
    } finally {
      setIsProcessing(false);
    }
  };
  const handleMarkAsPaid = async () => {
    setIsProcessing(true);
    try {
      await markOrderAsPaid(order._id);  // ✅ this line missing in your latest code
      setLocalPaymentStatus('paid');
      order.status = 'confirmed'; // ✅ Update status manually for UI

      if (typeof onActionComplete === 'function') {
        onActionComplete();
      }


      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true
        })
      ]).start();

      Alert.alert('Success', 'Order marked as paid successfully');
    } catch (err) {
      console.error('Payment error:', err);
      Alert.alert(
        'Payment Failed',
        err.response?.data?.message || 'Failed to update payment status. Please check your connection.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = () => {
    if (isProcessing) return;

    const deleteConfirmation = () => {
      Alert.alert(
        'Delete Order',
        'This action cannot be undone. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', onPress: confirmDelete, style: 'destructive' }
        ]
      );
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Delete Order'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
          title: 'Confirm Order Deletion',
          message: 'This will permanently remove the order from the system',
          tintColor: '#FF3B30'
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) deleteConfirmation();
        }
      );
    } else {
      deleteConfirmation();
    }
  };

  const confirmDelete = async () => {
    setIsProcessing(true);

    // Fade out animation before deletion
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(async () => {
      try {
        const deletedFrom = order.deletedFrom || 'admin';
        await deleteOrder(order._id, { deletedFrom });

        if (typeof onActionComplete === 'function') {
          onActionComplete();
        }

      } catch (err) {
        console.error('Delete error:', err);
        Alert.alert('Error', err.response?.data?.message || 'Failed to delete order');
        fadeAnim.setValue(1); // Reset fade if error occurs
      } finally {
        setIsProcessing(false);
      }
    });
  }; const handleEdit = async () => {
    if (isProcessing) return;

    await Haptics.selectionAsync(); // ✅ Correct function

    router.push({
      pathname: '/EditOrder',
      params: {
        orderData: JSON.stringify(order)
      }
    });
  };


  const getStatusStyle = () => {
    switch (order.status.toLowerCase()) {
      case 'pending': return styles.statusPending;
      case 'confirmed': return styles.statusConfirmed;
      case 'paid': return styles.statusPaid;
      case 'completed': return styles.statusCompleted;
      case 'cancelled': return styles.statusCancelled;
      default: return styles.statusDefault;
    }
  };

  const formatTime = () => {
    return format(parseISO(order.createdAt), 'hh:mm a');
  };

  const formatDate = () => {
    return format(parseISO(order.createdAt), 'MMM dd, yyyy');
  };

  const isOrderOld = () => {
    return isBefore(parseISO(order.createdAt), subDays(new Date(), 1));
  };

  const isOrderVeryRecent = () => {
    return differenceInMinutes(new Date(), parseISO(order.createdAt)) < 5;
  };

  const showActionMenu = () => {
    const options = [
      'Call Customer',
      'Mark as Paid',
      'Edit Order',
      order.status === 'pending' ? 'Confirm Order' : null,
      'Cancel'
    ].filter(Boolean);

    const destructiveIndex = options.indexOf('Delete Order');
    const cancelIndex = options.indexOf('Cancel');

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: cancelIndex,
        destructiveButtonIndex: destructiveIndex,
        title: 'Order Actions',
        message: 'Select an action to perform on this order',
        tintColor: '#007AFF'
      },
      (buttonIndex) => {
        switch (options[buttonIndex]) {
          case 'Call Customer':
            handleCallCustomer();
            break;
          case 'Mark as Paid':
            handleMarkAsPaid();
            break;
          case 'Edit Order':
            handleEdit();
            break;
          case 'Confirm Order':
            handleConfirm();
            break;
        }
      }
    );
  };

  const renderSwipeBackground = () => {
    if (!isSwiping) return null;

    return (
      <View style={styles.swipeBackgroundContainer}>
        {swipeAction === 'call' ? (
          <View style={styles.swipeCallBackground}>
            <Icon name="call" size={30} color="#fff" />
            <Text style={styles.swipeActionText}>Call Customer</Text>
          </View>
        ) : (
          <View style={styles.swipeDeleteBackground}>
            <Icon name="delete" size={30} color="#fff" />
            <Text style={styles.swipeActionText}>Delete Order</Text>
          </View>
        )}
      </View>
    );
  };

  return (

    <Animated.View
      ref={cardRef}
      style={[
        styles.card,
        getStatusStyle(),
        {
          transform: [
            { scale: scaleAnim },
            { translateX: slideAnim }
          ],
          opacity: fadeAnim
        },
        showNotificationDot && styles.newOrderHighlight,
        dotPressed && styles.dotPressed,
        isOrderOld() && styles.oldOrder,
        isOrderVeryRecent() && styles.veryRecentOrder,
        isProcessing && styles.processingOrder,
        order.scheduledForDeletion && styles.aboutToDeleteCard,
        isSelected && styles.selectedCard // ✅ ADDED LINE
      ]}
      {...panResponderRef.current}
    >
      {renderSwipeBackground()}
      <TouchableOpacity
        onPress={toggleExpand}
        onLongPress={() => onLongPress(order._id)} // ✅ Handle long press
        delayLongPress={300}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            {showNotificationDot && (
              <TouchableOpacity
                onPress={handleDotPress}
                style={styles.notificationDotContainer}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Animated.View style={[
                  styles.notificationDot,
                  { transform: [{ scale: pulseAnim }] }
                ]} />
              </TouchableOpacity>
            )}

            <View style={styles.headerTextContainer}>
              <View style={styles.orderIdContainer}>
<Text style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</Text>
                {order.isUrgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>URGENT</Text>
                  </View>
                )}
                {isOrderVeryRecent() && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newText}>NEW</Text>
                  </View>
                )}
              </View>

              <Text style={styles.customerName} numberOfLines={1}>
                {order.customer?.name || 'No Name'}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.orderTotal}>Rs. {order.totalAmount.toFixed(2)}</Text>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Icon name="keyboard-arrow-down" size={24} color="#666" />
            </Animated.View>
          </View>
        </View>

        <View style={styles.orderMeta}>
          <Text style={styles.metaText}>
            <Icon name="access-time" size={14} /> {formatTime()}
          </Text>
          <Text style={styles.metaText}>
            <Icon name={order.orderType === 'delivery' ? 'delivery-dining' : 'restaurant'}
              size={14} /> {order.orderType}
          </Text>
          {order.tableNumber && (
            <Text style={styles.metaText}>
              <Icon name="event-seat" size={14} /> Table {order.tableNumber}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          {/* Customer Details Section */}
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>CUSTOMER DETAILS</Text>
            <View style={styles.detailRow}>
              <Icon name="person" size={18} color="#555" />
              <Text style={styles.detailText}>
                {order.customer?.name || 'Not provided'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="phone" size={18} color="#555" />
              <Text style={styles.detailText}>
                {order.customer?.phone || 'Not provided'}
              </Text>
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallCustomer}
                disabled={!order.customer?.phone}
              >
                <Icon name="call" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {order.customer?.address && (
              <View style={styles.detailRow}>
                <Icon name="location-on" size={18} color="#555" />
                <Text style={styles.detailText}>{order.customer.address}</Text>
                {order.orderType === 'delivery' && (
                  <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => Linking.openURL(`https://maps.google.com/?q=${order.customer.address}`)}
                  >
                    <Icon name="map" size={18} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Order Items Section */}
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>ORDER ITEMS</Text>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                {item.image && (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                )}

                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>
                    {item.name} ({item.size})
                  </Text>
                  {item.modifiers?.length > 0 && (
                    <Text style={styles.itemModifiers}>
                      {item.modifiers.map(m => m.name).join(', ')}
                    </Text>
                  )}
                  {item.specialInstructions && (
                    <Text style={styles.itemSpecialInstructions}>
                      Note: {item.specialInstructions}
                    </Text>
                  )}
                </View>

                <View style={styles.itemQuantityPrice}>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Order Summary Section */}
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                Rs. {order.subtotal?.toFixed(2) || order.totalAmount.toFixed(2)}
              </Text>
            </View>

            {order.deliveryFee > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                <Text style={styles.summaryValue}>
                  Rs. {order.deliveryFee.toFixed(2)}
                </Text>
              </View>
            )}

            {order.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount:</Text>
                <Text style={[styles.summaryValue, styles.discountText]}>
                  -Rs. {order.discount.toFixed(2)}
                </Text>
              </View>
            )}

            {order.taxAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax ({order.taxRate}%):</Text>
                <Text style={styles.summaryValue}>
                  Rs. {order.taxAmount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.summaryTotalRow}>
              <Text style={styles.summaryTotalLabel}>TOTAL:</Text>
              <Text style={styles.summaryTotalValue}>
                Rs. {order.totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Payment and Notes Section */}
          <View style={styles.detailSection}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentMethod}>
                <Icon name={order.paymentMethod === 'cash' ? 'attach-money' : 'credit-card'}
                  size={16} />{order?.paymentMethod?.toUpperCase?.() || 'UNKNOWN'}

              </Text>
              <Text style={[
                styles.paymentStatus,
                localPaymentStatus === 'paid' ? styles.paidStatus : styles.pendingStatus
              ]}>
                {localPaymentStatus === 'paid' ? 'PAID' : 'PENDING PAYMENT'}
              </Text>
            </View>


            {order.specialInstructions && (
              <>
                <Text style={styles.sectionTitle}>SPECIAL INSTRUCTIONS</Text>
                <Text style={styles.notesText}>{order.specialInstructions}</Text>
              </>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {order.status === 'pending' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={handleConfirm}
                disabled={isProcessing}
              >
                <Icon name="check-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Confirm</Text>
              </TouchableOpacity>
            )}

            {localPaymentStatus !== 'paid' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.payButton]}
                onPress={handleMarkAsPaid}
                disabled={isProcessing}
              >
                <Icon name="payment" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Mark Paid</Text>
              </TouchableOpacity>
            )}

            {order.deletedFrom !== 'admin' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
                disabled={isProcessing}
              >
                <Icon name="delete" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={handleEdit}
              disabled={isProcessing}
            >
              <Icon name="edit" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Edit</Text>
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

          {/* Order Footer */}
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
    </Animated.View>
  );
};

export default OrderCard;
