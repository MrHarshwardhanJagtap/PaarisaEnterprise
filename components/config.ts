// If the env variable is missing, it defaults to localhost:5001
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/auth`,
  PRODUCTS: `${API_BASE_URL}/products`,
  ORDERS: `${API_BASE_URL}/orders`,
  STOCK_LOGS: `${API_BASE_URL}/stocklogs`,
};