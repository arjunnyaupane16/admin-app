// styles/OrdersStyles.js
import { StyleSheet } from 'react-native';

const OrdersStyles = StyleSheet.create({
  // Base Card Styles
  container: {
    flex: 1,
    backgroundColor: '#fff', // White background
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderLeftWidth: 6,
    borderLeftColor: '#ddd', // Default color, will be overridden by status
  },

  // New styles used by OrderCard.js (polished look)
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 6,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,      // Thinner status indicator
    borderWidth: 1,          // Card border
    borderLeftColor: '#6a1b9a',
    borderColor: '#6a1b9a',
    minHeight: 90,          // Reduced minimum height
  },
  // Status-specific styles
  orderCardPending: {
    borderLeftColor: '#FFA726', // Dark yellow/orange for pending
    borderColor: '#FFA726',
  },
  orderCardConfirmed: {
    borderLeftColor: '#66BB6A', // Green for confirmed
    borderColor: '#66BB6A',
  },
  orderCardDefault: {
    borderLeftColor: '#6a1b9a', // Purple for default
    borderColor: '#6a1b9a',
  },
  expandedCard: {
    borderWidth: 2,
    borderColor: '#4299e1',
  },
  orderCardContent: {
    padding: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  highlightTable: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a237e',
    marginRight: 8,
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6a1b9a',
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 2,
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6a1b9a',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 6,
    alignSelf: 'flex-start',
    gap: 6,
  },
  phoneText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  customerInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#eee',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  orderItems: {
    marginTop: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  itemName: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    minWidth: 80,
    textAlign: 'right',
  },
  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  orderTotal: {
    fontSize: 26, // Increased from 22
    fontWeight: '900', // Bolder
    color: '#1b5e20', // Darker green for better contrast
  },
  orderFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderDate: {
    fontSize: 15,
    color: '#888',
    fontFamily: 'monospace',
  },
  orderTime: {
    fontSize: 12, // Set to 12px
    color: '#5c6bc0',
    fontFamily: 'monospace',
    fontWeight: '500',
  },

  // Enhanced Status Colors
  statusPending: {
    borderLeftColor: '#FFA726', // Orange
    backgroundColor: 'transparent',
  },
  statusConfirmed: {
    borderLeftColor: '#42A5F5', // Blue
    backgroundColor: 'transparent',
  },
  statusPaid: {
    borderLeftColor: '#66BB6A',
    backgroundColor: 'transparent',
  },
  statusCompleted: {
    borderLeftColor: '#5C6BC0',
    backgroundColor: '#E8EAF6',
  },
  statusCancelled: {
    borderLeftColor: '#EF5350',
    backgroundColor: '#FFEBEE',
  },
  statusDefault: {
    borderLeftColor: '#BDBDBD', // Grey
  },

  // Confirmation States
  confirmedHighlight: {
    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  paidHighlight: {
    shadowColor: '#66BB6A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  // Special State Styles
  newOrderHighlight: {
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  dotPressed: {
    transform: [{ scale: 1.02 }],
  },
  oldOrder: {
    opacity: 0.8,
    backgroundColor: '#FAFAFA',
  },
  veryRecentOrder: {
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  processingOrder: {
    opacity: 0.7,
  },

  // Header Styles
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
  },
  // Badge Styles
  urgentBadge: {
    backgroundColor: '#FF5252',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  urgentText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  newBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  newText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Meta Information
  orderMeta: {
    flexDirection: 'row',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,

// Expanded Content Styles
expandedContent: {
marginTop: 12,
borderTopWidth: 1,
borderTopColor: '#eee',
paddingTop: 12,
},
orderItems: {
marginTop: 10,
borderTopWidth: 1,
borderTopColor: '#f0f0f0',
paddingTop: 10,
},
specialInstructionsContainer: {
backgroundColor: '#f8f9fa',
borderRadius: 8,
padding: 12,
marginVertical: 10,
borderLeftWidth: 4,
borderLeftColor: '#6a1b9a',
},
specialInstructionsLabel: {
fontWeight: '600',
color: '#4a4a4a',
marginBottom: 4,
fontSize: 14,
},
specialInstructionsText: {
color: '#666',
fontSize: 14,
lineHeight: 20,
},
detailSection: {
marginBottom: 16,
},
sectionTitle: {
fontSize: 12,
fontWeight: 'bold',
color: '#888',
marginBottom: 8,
textTransform: 'uppercase',
letterSpacing: 0.5,
},
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Detail Rows
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },

  // Button Styles
  callButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  mapButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // Item Styles
  itemRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  itemModifiers: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic',
  },
  itemSpecialInstructions: {
    fontSize: 12,
    color: '#E91E63',
    marginTop: 2,
  },
  itemQuantityPrice: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },

  // Summary Section
  summarySection: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  discountText: {
    color: '#E91E63',
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  // Payment Status
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#333',
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paidStatus: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  pendingStatus: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  },

  // Notes
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginTop: 4,
  },

  // Action Buttons
  actionButtonsContainer: {
    marginTop: 10,
  },
  actionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 6,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  moreButton: {
    backgroundColor: '#757575',
  },
  confirmButton: {
    backgroundColor: '#42A5F5',
  },
  payButton: {
    backgroundColor: '#66BB6A',
  },
  editButton: {
    backgroundColor: '#FFA726',
  },
  deleteButton: {
    backgroundColor: '#EF5350',
  },

  // Footer
  orderFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  // Swipe Backgrounds
  swipeBackgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  swipeCallBackground: {
    backgroundColor: '#4CAF50',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
  },
  swipeDeleteBackground: {
    backgroundColor: '#EF5350',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  swipeActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  summaryFilterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },

  statCircle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#ddd',
  },

  selectedStatCircle: {
    backgroundColor: '#E0F7FA',
    borderColor: '#00ACC1',
  },

  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedFilterText: {
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  liveHeadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },

  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },

  liveHeadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  aboutToDeleteCard: {
    borderWidth: 2,
    borderColor: '#FF9800', // Warning Orange
    backgroundColor: '#FFF8E1', // Light Yellow BG
  },
  // Highlight for deleted + selected orders
  deletedSelectedCard: {
    backgroundColor: '#FEF2F2',  // Light red background
    borderColor: '#DC2626',      // Red border
    borderWidth: 1.5,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },

  // Interactive States
  pressedState: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  disabledState: {
    opacity: 0.6,
  },

  // Enhanced Buttons
  primaryButton: {
    backgroundColor: '#6a1b9a',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Consistent Spacing
  smallSpacing: {
    marginVertical: 4,
  },
  mediumSpacing: {
    marginVertical: 8,
  },
  largeSpacing: {
    marginVertical: 12,
  },

  // Typography
  heading1: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a5568',
  },

  // Elevation Levels
  elevation1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  elevation2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  elevation3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6a1b9a',
  },
  statusBadgePending: {
    borderColor: '#FFA726', // Orange
  },
  statusBadgeConfirmed: {
    borderColor: '#42A5F5', // Blue
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default OrdersStyles;
