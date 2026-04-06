// frontend/src/api/authApi.js
import api from './axios';

export const registerUser = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const loginUser = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const getMyProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const updateMyProfile = async (userData) => {
  const { data } = await api.put('/auth/profile', userData);
  return data;
};

export const getAllUsers = async () => {
  const { data } = await api.get('/auth/users');
  return data;
};

export const toggleUser = async (id) => {
  const { data } = await api.put(`/auth/users/${id}/toggle`);
  return data;
};