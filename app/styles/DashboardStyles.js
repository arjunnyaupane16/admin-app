// app/styles/DashboardStyles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  dateFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  datePickerButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginRight: 10,
  },
  datePickerText: {
    textAlign: 'center',
    fontSize: 16,
  },
  dateTypeButton: {
    backgroundColor: '#477b44',
    padding: 10,
    borderRadius: 8,
    width: 100,
  },
  dateTypeText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeCard: {
    borderColor: '#477b44',
    borderWidth: 2,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  chartsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  chartCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  popularItems: {
    marginTop: 10,
  },
  popularItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  popularItemName: {
    fontSize: 14,
    color: '#333',
  },
  popularItemCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#477b44',
  },
  searchContainer: {
    marginBottom: 10,
  },
  exportContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exportButton: {
    backgroundColor: '#477b44',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardConfirmed: {
    borderLeftWidth: 5,
    borderLeftColor: '#477b44',
  },
  cardPending: {
    borderLeftWidth: 5,
    borderLeftColor: '#FFA500',
  },
  cardDeleted: {
    borderLeftWidth: 5,
    borderLeftColor: '#FF0000',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderId: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#477b44',
    marginTop: 5,
  },
  statusBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusConfirmed: {
    backgroundColor: '#e8f5e9',
  },
  statusPending: {
    backgroundColor: '#fff3e0',
  },
  statusDeleted: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  modalContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 100,
    color: '#333',
  },
  detailValue: {
    flex: 1,
    color: '#333',
  },
  itemsTitle: {
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingLeft: 10,
  },
  itemName: {
    color: '#333',
  },
  itemPrice: {
    fontWeight: 'bold',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#477b44',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  closeButtonText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    flex: 1,
  },
  deleteButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateFilterModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  dateFilterOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedFilter: {
    backgroundColor: '#e8f5e9',
  },
  dateFilterText: {
    fontSize: 16,
    color: '#333',
  },
  closeFilterButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#477b44',
    borderRadius: 8,
  },
  closeFilterText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  loading: {
    marginTop: 50,
  },
});
