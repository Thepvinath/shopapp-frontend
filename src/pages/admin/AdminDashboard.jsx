// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders } from '../../api/orderApi';
import { getProducts } from '../../api/productApi';
import { getAllUsers } from '../../api/authApi';
import Spinner from '../../components/ui/Spinner';
import { formatPrice, formatDate, statusColor } from '../../utils/helpers';

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div className="card p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`text-3xl`}>{icon}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [orders,   setOrders]   = useState([]);
  const [products, setProducts] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ordRes, prodRes, userRes] = await Promise.all([
          getAllOrders(),
          getProducts({ limit: 100 }),
          getAllUsers(),
        ]);
        setOrders(ordRes.data);
        setProducts(prodRes.data);
        setUsers(userRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <Spinner />;

  // Calculate stats
  const totalRevenue   = orders
    .filter((o) => o.isPaid)
    .reduce((acc, o) => acc + o.totalPrice, 0);
  const pendingOrders  = orders.filter((o) => o.status === 'pending').length;
  const lowStock       = products.filter((p) => p.countInStock < 5).length;
  const recentOrders   = [...orders].slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="text-sm text-gray-400">{formatDate(new Date())}</div>
      </div>

      {/* ── Stat Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatPrice(totalRevenue)}
          subtitle="From paid orders"
          icon="💰"
          color="text-green-600"
        />
        <StatCard
          title="Total Orders"
          value={orders.length}
          subtitle={`${pendingOrders} pending`}
          icon="📦"
          color="text-blue-600"
        />
        <StatCard
          title="Total Products"
          value={products.length}
          subtitle={`${lowStock} low stock`}
          icon="🛍️"
          color="text-purple-600"
        />
        <StatCard
          title="Total Users"
          value={users.length}
          subtitle={`${users.filter((u) => u.role === 'admin').length} admins`}
          icon="👥"
          color="text-orange-600"
        />
      </div>

      {/* ── Quick Nav ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            to: '/admin/products',
            label: 'Manage Products',
            desc: 'Add, edit, or delete products',
            icon: '📦',
            color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
            textColor: 'text-purple-700',
          },
          {
            to: '/admin/orders',
            label: 'Manage Orders',
            desc: 'Update order status & track',
            icon: '🧾',
            color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
            textColor: 'text-blue-700',
          },
          {
            to: '/admin/users',
            label: 'Manage Users',
            desc: 'View and manage accounts',
            icon: '👥',
            color: 'bg-green-50 border-green-200 hover:bg-green-100',
            textColor: 'text-green-700',
          },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-4 p-5 rounded-xl border
              transition-colors ${item.color}`}
          >
            <span className="text-3xl">{item.icon}</span>
            <div>
              <p className={`font-semibold ${item.textColor}`}>{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Recent Orders ────────────────────────── */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-blue-600 text-sm hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between py-2
                  border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    #{order._id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {order.user?.name} • {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${statusColor(order.status)} capitalize text-xs`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Low Stock Alert ──────────────────────── */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">
              Low Stock Alert
              {lowStock > 0 && (
                <span className="ml-2 badge bg-red-100 text-red-700">
                  {lowStock}
                </span>
              )}
            </h2>
            <Link
              to="/admin/products"
              className="text-blue-600 text-sm hover:underline"
            >
              Manage →
            </Link>
          </div>
          <div className="space-y-3">
            {products
              .filter((p) => p.countInStock < 5)
              .slice(0, 5)
              .map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between py-2
                    border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0]?.url}
                      alt={product.name}
                      className="w-9 h-9 rounded-lg object-cover bg-gray-100"
                    />
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">
                      {product.name}
                    </p>
                  </div>
                  <span className={`badge text-xs ${
                    product.countInStock === 0
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {product.countInStock === 0
                      ? 'Out of stock'
                      : `${product.countInStock} left`}
                  </span>
                </div>
              ))}
            {lowStock === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                All products are well stocked ✅
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;