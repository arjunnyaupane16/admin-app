import { StyleSheet } from 'react-native';

const OrdersStyles = StyleSheet.create({
  // Base Card Styles
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 10,
    marginVertical: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderLeftWidth: 6,
    borderLeftColor: '#ddd',
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
  
  orderId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 2,
  },
  
  tableNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6a1b9a',
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  
  orderTime: {
    fontSize: 14,
    color: '#666',
  },
  
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  orderTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2c3e50',
  },
  
  expandedContent: {
    marginTop: 8,
  },
  
  customerInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6a1b9a',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  
  phoneText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  orderItems: {
    marginTop: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
    marginBottom: 8,
  },
  
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  
  itemName: {
    fontSize: 15,
    color: '#2c3e50',
    flex: 1,
  },
  
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    minWidth: 80,
    textAlign: 'right',
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
    color: '#555',
    fontWeight: '600',
  },
  
  totalAmount: {
    fontSize: 22,
    color: '#2c3e50',
    fontWeight: '800',
    marginRight: 8,
  },
  
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#6a1b9a',
    gap: 6,
    flex: 1,
    minWidth: '30%',
    justifyContent: 'center',
  },
  
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  
  payButton: {
    backgroundColor: '#2196F3',
  },
  
  buttonDisabled: {
    opacity: 0.6,
  },
  
  orderFooter: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  
  orderDate: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
  },
  
  // Status Styles
  statusPending: {
    borderLeftColor: '#FFA726',
    backgroundColor: '#FFF3E0',
  },
  
  statusConfirmed: {
    borderLeftColor: '#42A5F5',
    backgroundColor: '#E3F2FD',
  },
  
  statusPaid: {
    borderLeftColor: '#66BB6A',
    backgroundColor: '#E8F5E9',
  },
  
  statusCompleted: {
    borderLeftColor: '#5C6BC0',
    backgroundColor: '#E8EAF6',
  },
  
  statusCancelled: {
    borderLeftColor: '#EF5350',
    backgroundColor: '#FFEBEE',
  },
  
  // Highlight for new orders
  highlightTable: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6a1b9a',
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  // Status badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#e3f2fd',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976d2',
  },
});

export default OrdersStyles;
