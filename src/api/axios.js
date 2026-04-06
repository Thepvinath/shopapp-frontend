// frontend/src/api/axios.js
import axios from 'axios';

/**
 * สร้าง Instance ของ Axios 
 * โดยใช้ Base URL จาก Environment Variable (Vite)
 */
const api = axios.create({
  // หากไม่มี VITE_API_URL ใน .env ให้ fallback ไปที่ localhost:5000
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ───────────────────────────
// แนบ JWT Token ไปกับทุก Request โดยอัตโนมัติ
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────
// จัดการกรณี Token หมดอายุ (401 Unauthorized) แบบ Global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ลบข้อมูลผู้ใช้และส่งกลับไปหน้า Login ทันที
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;