// frontend/src/pages/admin/AdminOrders.jsx
import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/orderApi';
import Spinner from '../../components/ui/Spinner';
import { formatPrice, formatDate, statusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending','processing','shipped','delivered','cancelled'];

const AdminOrders = () => {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating,   setUpdating]   = useState(null);
  const [expanded,   setExpanded]   = useState(null);

  useEffect(() => {
    getAllOrders()
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o)
      );
      toast.success(`Order status updated to "${newStatus}"`);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders
    .filter((o) => o.isPaid)
    .reduce((acc, o) => acc + o.totalPrice, 0);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">
          {orders.length} total orders •{' '}
          <span className="text-green-600 font-medium">
            {formatPrice(totalRevenue)} revenue
          </span>
        </p>
      </div>

      {/* Status Summary Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', ...STATUS_OPTIONS].map((s) => {
          const count = s === 'all'
            ? orders.length
            : orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium
                transition-colors capitalize ${
                filterStatus === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID, customer name or email..."
          className="input-field max-w-sm"
        />
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Payment</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => (
                <>
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-gray-800">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">
                        {order.user?.name || 'Deleted User'}
                      </p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                        order.isPaid
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.isPaid ? '✓ Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updating === order._id}
                        className={`text-xs font-medium px-2 py-1.5 rounded-lg
                          border cursor-pointer capitalize disabled:opacity-60
                          focus:outline-none focus:ring-2 focus:ring-blue-500
                          ${statusColor(order.status)}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-white text-gray-800">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          setExpanded(expanded === order._id ? null : order._id)
                        }
                        className="text-blue-600 hover:text-blue-800 text-xs
                          font-medium transition-colors"
                      >
                        {expanded === order._id ? 'Hide ▲' : 'Show ▼'}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row — Order Items */}
                  {expanded === order._id && (
                    <tr key={`${order._id}-expanded`}>
                      <td colSpan={7} className="px-4 pb-4 bg-gray-50">
                        <div className="pt-3">
                          <p className="text-xs font-semibold text-gray-500
                            uppercase mb-2">
                            Order Items
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {order.orderItems.map((item) => (
                              <div
                                key={item._id}
                                className="flex items-center gap-2 bg-white
                                  rounded-lg p-2 border border-gray-100"
                              >
                                <img
                                  src={item.image ||
                                    'https://placehold.co/40x40?text=?'}
                                  alt={item.name}
                                  className="w-8 h-8 rounded object-cover"
                                />
                                <div>
                                  <p className="text-xs font-medium text-gray-800">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {item.quantity} × {formatPrice(item.price)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Shipping Address */}
                          <p className="text-xs font-semibold text-gray-500
                            uppercase mb-1">
                            Shipping Address
                          </p>
                          <p className="text-xs text-gray-600">
                            {order.shippingAddress?.fullName} •{' '}
                            {order.shippingAddress?.address},{' '}
                            {order.shippingAddress?.city},{' '}
                            {order.shippingAddress?.country}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;