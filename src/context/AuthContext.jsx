// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/authApi';
import toast from 'react-hot-toast';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  const saveUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Login function
  const login = async (credentials) => {
    const res = await loginUser(credentials);
    saveUser(res.data);
    toast.success(res.message || 'Login successful!');
    return res;
  };

  // Register function
  const register = async (userData) => {
    const res = await registerUser(userData);
    saveUser(res.data);
    toast.success(res.message || 'Account created!');
    return res;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  // Helper checks
  const isAdmin = user?.role === 'admin';
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAdmin, isLoggedIn, saveUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook for easy usage
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};