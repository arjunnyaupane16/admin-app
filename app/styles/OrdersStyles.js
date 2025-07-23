// styles/OrdersStyles.js
import { StyleSheet } from 'react-native';

const OrdersStyles = StyleSheet.create({
  // Base Card Styles
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

  // Status Variations
  statusPending: {
    borderLeftColor: '#FFA726', // Orange
  },
  statusConfirmed: {
    borderLeftColor: '#42A5F5', // Blue
  },
  statusPaid: {
    borderLeftColor: '#66BB6A', // Green
  },
  statusCompleted: {
    borderLeftColor: '#5C6BC0', // Indigo
  },
  statusCancelled: {
    borderLeftColor: '#EF5350', // Red
  },
  statusDefault: {
    borderLeftColor: '#BDBDBD', // Grey
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
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
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
    color: '#888',
    marginRight: 16,
  },

  // Expanded Content Styles
  expandedContent: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    minWidth: '30%',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
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
  moreButton: {
    backgroundColor: '#BDBDBD',
  },

  // Footer
  orderFooter: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  orderIdFull: {
    fontSize: 10,
    color: '#BDBDBD',
    textAlign: 'center',
    marginTop: 4,
  },
  oldOrderWarning: {
    fontSize: 12,
    color: '#EF5350',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Notification Dot
  notificationDotContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF5252',
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




});

export default OrdersStyles;
