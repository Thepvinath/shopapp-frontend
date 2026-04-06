// frontend/src/pages/OrdersPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api/orderApi';
import Spinner from '../components/ui/Spinner';
import { formatPrice, formatDate, statusColor } from '../utils/helpers';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📦</p>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
          <Link to="/products" className="btn-primary inline-block">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-5">
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                  <p className="font-mono text-sm font-semibold text-gray-800">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-xs text-gray-400 mb-0.5">Placed on</p>
                  <p className="text-sm text-gray-700">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`badge ${statusColor(order.status)} capitalize text-xs`}>
                  {order.status}
                </span>
                <span className="font-bold text-blue-600 text-lg">
                  {formatPrice(order.totalPrice)}
                </span>
              </div>

              {/* Order Items */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {order.orderItems.map((item) => (
                  <div
                    key={item._id}
                    className="shrink-0 flex items-center gap-2 bg-gray-50 rounded-lg p-2 min-w-[180px]"
                  >
                    <img
                      src={item.image || 'https://placehold.co/50x50?text=?'}
                      alt={item.name}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        x{item.quantity} • {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>
                    {order.isPaid ? '✅ Paid' : '⏳ Payment pending'}
                  </span>
                  <span>•</span>
                  <span>via {order.paymentMethod}</span>
                </div>
                <Link
                  to={`/orders/${order._id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;