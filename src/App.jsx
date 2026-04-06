// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import CheckoutPage from './pages/CheckoutPage'; // ✅ นำเข้าแล้ว
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import OrderDetailPage from './pages/OrderDetailPage';

// ── Route Guards ─────────────────────────────────────────

// Redirect to login if not authenticated
const PrivateRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

// Redirect to home if not admin
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? children : <Navigate to="/" replace />;
};

// ── Main App ─────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              fontSize: '14px',
            },
          }}
        />
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Private Routes */}
            <Route path="/profile" element={
              <PrivateRoute><ProfilePage /></PrivateRoute>
            } />
            <Route path="/orders" element={
              <PrivateRoute><OrdersPage /></PrivateRoute>
            } />
            <Route path="/orders/:id" element={
              <PrivateRoute><OrderDetailPage /></PrivateRoute>
            } />

            {/* Route Checkout  */}
            <Route path="/checkout" element={
              <PrivateRoute><CheckoutPage /></PrivateRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute><AdminDashboard /></AdminRoute>
            } />
            <Route path="/admin/products" element={
              <AdminRoute><AdminProducts /></AdminRoute>
            } />
            <Route path="/admin/orders" element={
              <AdminRoute><AdminOrders /></AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute><AdminUsers /></AdminRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;