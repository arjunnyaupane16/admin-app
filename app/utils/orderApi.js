import axios from 'axios';
import {
  ORDER_API
} from './constants';

// Create axios instance with baseURL and 30s timeout
const baseURL = ORDER_API.replace('/orders', ''); // remove /orders to get base API URL

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000, // 30 seconds timeout
});

// ✅ Fetch all active (non-deleted) orders
export const fetchOrders = async ({ excludeOrderCardDeleted = false } = {}) => {
  const res = await axiosInstance.get('/orders', {
    params: { excludeOrderCardDeleted }
  });
  return res.data;
};

// ✅ Fetch soft-deleted (trashed) orders
export const fetchDeletedOrders = async () => {
  const res = await axiosInstance.get('/orders/deleted');
  return res.data;
};

// ✅ Fetch all orders (including deleted) — for dashboard
export const fetchAdminOrders = async () => {
  const res = await axiosInstance.get('/orders/admin');
  return res.data;
};

// ✅ Restore a soft-deleted order
export const restoreOrder = async (id) => {
  const res = await axiosInstance.put(`/orders/${id}/restore`);
  return res.data;
};

// ✅ Permanently delete one soft-deleted order
export const permanentlyDeleteOrder = async (id) => {
  const res = await axiosInstance.delete(`/orders/${id}?permanent=true`);
  return res.data;
};

// ✅ Permanently delete all soft-deleted orders
export const emptyTrash = async () => {
  const res = await axiosInstance.delete('/orders/empty-trash');
  return res.data;
};

// ✅ Soft delete an active order
export const deleteOrder = async (id, data = { deletedFrom: 'admin' }) => {
  const res = await axiosInstance.delete(`/orders/${id}`, { data });
  return res.data;
};

// ✅ Mark order as paid
export const markOrderAsPaid = async (id) => {
  const res = await axiosInstance.put(`/orders/${id}`, { paymentStatus: 'paid' });
  return res.data;
};

// ✅ Update order status
export const updateOrderStatus = async (id, status) => {
  const res = await axiosInstance.put(`/orders/${id}`, { status });
  return res.data;
};

// ✅ Update full order
export const updateOrder = async (id, updatedData) => {
  const res = await axiosInstance.put(`/orders/${id}`, updatedData);
  return res.data;
};

// ✅ Get order statistics
export const getOrderStats = async (viewMode = 'daily') => {
  const res = await axiosInstance.get(`/stats`, {
    params: { viewMode }
  });
  return res.data;
};

// ✅ Export orders data
export const exportOrders = async () => {
  const res = await axiosInstance.get('/orders/export');
  return res.data;
};

// ✅ Fetch archived orders
export const fetchArchivedOrders = async () => {
  const res = await axiosInstance.get('/orders/archived');
  return res.data;
};

// ✅ Export all functions in a default object
export default {
  fetchOrders,
  fetchDeletedOrders,
  fetchArchivedOrders,
  deleteOrder,
  fetchAdminOrders,
  restoreOrder,
  permanentlyDeleteOrder,
  emptyTrash,
  markOrderAsPaid,
  updateOrderStatus,
  updateOrder,
  getOrderStats,
  exportOrders,
};
