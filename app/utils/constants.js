// utils/constants.js

const BACKEND_URL = "https://drift-and-sip-backend-l3pr.onrender.com";

const ORDER_API = `${BACKEND_URL}/api/orders`;
const STATS_API = `${BACKEND_URL}/api/stats`;
const DELETED_ORDERS_API = `${ORDER_API}/deleted`;
const ARCHIVED_ORDERS_API = `${ORDER_API}/archived`;
const EXPORT_ORDERS_API = `${ORDER_API}/export`;

const ESEWA_API = `${BACKEND_URL}/api/payment/esewa`;
const KHALTI_API = `${BACKEND_URL}/api/payment/khalti`;
const BANK_API = `${BACKEND_URL}/api/payment/bank`;

const LOGIN_API = `${BACKEND_URL}/api/auth/login`;
const REGISTER_API = `${BACKEND_URL}/api/auth/register`;

export {
  ARCHIVED_ORDERS_API, BACKEND_URL, BANK_API, DELETED_ORDERS_API, ESEWA_API, EXPORT_ORDERS_API, KHALTI_API, LOGIN_API, ORDER_API, REGISTER_API, STATS_API
};

export default {
  BACKEND_URL,
  ORDER_API,
  STATS_API,
  DELETED_ORDERS_API,
  ARCHIVED_ORDERS_API,
  EXPORT_ORDERS_API,
  ESEWA_API,
  KHALTI_API,
  BANK_API,
  LOGIN_API,
  REGISTER_API,
};
