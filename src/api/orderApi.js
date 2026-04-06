// frontend/src/api/orderApi.js
import api from './axios';

export const createOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await api.get('/orders/myorders');
  return data;
};

export const getOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

export const getAllOrders = async () => {
  const { data } = await api.get('/orders');
  return data;
};

export const updateOrderStatus = async (id, status) => {
  const { data } = await api.put(`/orders/${id}/status`, { status });
  return data;
};