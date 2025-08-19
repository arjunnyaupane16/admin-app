import axios from 'axios';
import { Platform } from 'react-native';
import { getItem } from '../utils/storage';
import {
  ORDER_API
} from './constants';

// Create axios instance with baseURL and longer timeout (Render free cold starts can take ~50s)
const baseURL = ORDER_API.replace('/orders', ''); // remove /orders to get base API URL

const axiosInstance = axios.create({
  baseURL,
  timeout: 90000, // 90 seconds timeout to survive cold starts
});

// Generic helper to try multiple request fallbacks
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isRetriableError = (err) => {
  const status = err?.response?.status;
  const code = err?.code;
  // Timeout, network error (no response), or transient server errors
  return (
    code === 'ECONNABORTED' ||
    !err?.response ||
    (status >= 500 && status <= 504)
  );
};

const requestWithFallbacks = async (tries) => {
  const errors = [];

  // Validate input
  if (!Array.isArray(tries) || tries.length === 0) {
    throw new Error('No API endpoints provided to try');
  }

  for (const t of tries) {
    try {
      if (!t || typeof t !== 'object') {
        throw new Error('Invalid request configuration');
      }

      const { method = 'get', url, data, params = {}, headers = {} } = t;

      if (!url) {
        throw new Error('Missing URL in request configuration');
      }

      console.log('[API try]', method.toUpperCase(), `${baseURL}${url}`, { params });

      const config = {
        method,
        url,
        data,
        params,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      // Up to 3 attempts per try with backoff for transient errors
      let attempt = 0;
      let lastErr = null;
      while (attempt < 3) {
        try {
          const res = await axiosInstance.request(config);
          return res;
        } catch (err) {
          lastErr = err;
          attempt += 1;
          const retriable = isRetriableError(err);
          console.warn('[API attempt failed]', method.toUpperCase(), url, `attempt ${attempt}`, retriable ? 'retriable' : 'not retriable', err?.message);
          if (!retriable || attempt >= 3) break;
          // Exponential backoff: 1s, 2s
          await sleep(1000 * attempt);
        }
      }
      throw lastErr || new Error('Unknown request error');

    } catch (err) {
      const status = err?.response?.status;
      const body = err?.response?.data || err.message;
      const errorUrl = t?.url || 'unknown';
      const errorMethod = t?.method?.toUpperCase?.() || 'UNKNOWN';

      console.warn('[API fallback failed]', errorMethod, errorUrl, status, body);

      // Only add to errors if we have valid error info
      if (errorUrl !== 'unknown' || status || body) {
        errors.push({
          url: errorUrl,
          method: errorMethod,
          status,
          body: body instanceof Error ? body.message : body
        });
      }

      // If we're out of retries, throw the accumulated errors
      if (tries.indexOf(t) === tries.length - 1) {
        const summary = errors.length > 0
          ? errors.map(e =>
            `${e.method} ${e.url}: ${e.status || 'ERR'} ${typeof e.body === 'string' ? e.body : JSON.stringify(e.body)}`
          ).join(' | ')
          : 'No valid error information available';

        const error = new Error(`All fallbacks failed: ${summary}`);
        error.attempts = errors;
        throw error;
      }
    }
  }
};

// Attach Authorization token if present and basic request id for tracing
axiosInstance.interceptors.request.use(async (config) => {
  try {
    const token = await getItem('authToken');
    // Attach for any non-empty string token (web uses a dummy token during dev)
    if (token && typeof token === 'string' && token.trim().length > 0) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {
    // ignore
  }
  return config;
});

// Centralized error logging
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const url = error?.config?.url;
    console.warn('API error:', status, url, data || error.message);
    return Promise.reject(error);
  }
);

// Mock orders for web fallback (CORS in dev)
const mockOrders = [
  {
    _id: 'mock-1',
    orderNumber: 'A101',
    tableNumber: 3,
    createdAt: new Date().toISOString(),
    status: 'pending',
    paymentStatus: 'unpaid',
    totalAmount: 580,
    items: [
      { name: 'Cappuccino', size: 'Full', price: 180, quantity: 2 },
      { name: 'Veg Sandwich', size: 'Full', price: 220, quantity: 1 },
    ],
    customer: { name: 'Web Dev (Mock)', phone: '+9779800000000' },
    specialInstructions: 'Extra hot cappuccino',
  },
  {
    _id: 'mock-2',
    orderNumber: 'A102',
    tableNumber: 5,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'confirmed',
    paymentStatus: 'paid',
    totalAmount: 350,
    items: [
      { name: 'Americano', size: 'Full', price: 150, quantity: 1 },
      { name: 'Blueberry Muffin', size: 'Full', price: 200, quantity: 1 },
    ],
    customer: { name: 'Test User', phone: '+9779811111111' },
  },
];

// ✅ Fetch all active (non-deleted) orders
export const fetchOrders = async ({ excludeOrderCardDeleted = false } = {}) => {
  try {
    const res = await axiosInstance.get('/orders', {
      params: { excludeOrderCardDeleted, t: Date.now() }
    });
    return res.data;
  } catch (err) {
    // Web dev CORS fallback to mock data so UI can render
    if (Platform.OS === 'web') {
      console.warn('CORS blocked fetchOrders on web. Returning mock data.');
      return mockOrders;
    }
    throw err;
  }
};

// ✅ Fetch soft-deleted (trashed) orders
export const fetchDeletedOrders = async () => {
  const res = await axiosInstance.get('/orders/deleted');
  return res.data;
};

// ✅ Fetch all orders (including deleted) — for dashboard
export const fetchAdminOrders = async () => {
  try {
    const res = await axiosInstance.get('/orders/admin');
    return res.data;
  } catch (err) {
    if (Platform.OS === 'web') {
      console.warn('CORS blocked fetchAdminOrders on web. Returning mock data.');
      return mockOrders;
    }
    throw err;
  }
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
  const deletedFrom = data?.deletedFrom || 'admin';
  const res = await requestWithFallbacks([
    // DELETE with body
    { method: 'delete', url: `/orders/${id}`, data },
    // DELETE with query param
    { method: 'delete', url: `/orders/${id}`, params: { deletedFrom } },
    // POST explicit delete route
    { method: 'post', url: `/orders/${id}/delete`, data: { deletedFrom } },
    // PATCH status to deleted as last resort
    { method: 'patch', url: `/orders/${id}`, data: { status: 'deleted', deletedFrom } },
  ]);
  return res.data;
};

// ✅ Mark order as paid
export const markOrderAsPaid = async (id) => {
  if (!id) {
    throw new Error('Order ID is required');
  }

  try {
    const nowIso = new Date().toISOString();
    const payload = {
      paymentStatus: 'paid',
      status: 'confirmed',
      isPaid: true,
      paidAt: nowIso
    };

    console.log(`Marking order ${id} as paid`, { payload });

    const res = await requestWithFallbacks([
      // Try dedicated payment endpoints first
      {
        method: 'post',
        url: `/orders/${id}/mark-paid`,
        data: { paidAt: nowIso },
        headers: { 'Content-Type': 'application/json' }
      },
      {
        method: 'post',
        url: `/orders/${id}/pay`,
        data: { timestamp: nowIso },
        headers: { 'Content-Type': 'application/json' }
      },
      // Fallback to direct update
      {
        method: 'patch',
        url: `/orders/${id}`,
        data: payload,
        headers: { 'Content-Type': 'application/json' }
      },
      {
        method: 'put',
        url: `/orders/${id}`,
        data: payload,
        headers: { 'Content-Type': 'application/json' }
      },
    ]);

    console.log(`Successfully marked order ${id} as paid`, res.data);
    return res.data;

  } catch (error) {
    console.error(`Failed to mark order ${id} as paid:`, error);
    throw error; // Re-throw to be handled by the caller
  }
};

// ✅ Update order status
export const updateOrderStatus = async (id, status) => {
  const res = await requestWithFallbacks([
    { method: 'put', url: `/orders/${id}`, data: { status } },
    { method: 'patch', url: `/orders/${id}`, data: { status } },
    { method: 'post', url: `/orders/${id}/status`, data: { status } },
  ]);
  return res.data;
};

// ✅ Update full order
export const updateOrder = async (id, updatedData) => {
  const res = await requestWithFallbacks([
    { method: 'put', url: `/orders/${id}`, data: updatedData },
    { method: 'patch', url: `/orders/${id}`, data: updatedData },
  ]);
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
