import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../api/orderApi';
import Spinner from '../components/ui/Spinner';
import { formatPrice, formatDate, statusColor } from '../utils/helpers';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const StatusTimeline = ({ status }) => {
  const currentIndex = STEPS.indexOf(status);
  const isCancelled = status === 'cancelled';

  return (
    <div className="card p-6 mb-5">
      <h2 className="font-bold text-gray-900 mb-6">Order Status</h2>
      {isCancelled ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <span className="text-2xl">❌</span>
          <div>
            <p className="font-semibold text-red-700">Order Cancelled</p>
            <p className="text-sm text-red-500">This order has been cancelled.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-green-500 z-0 transition-all duration-500"
            style={{
              width: currentIndex === 0
                ? '0%'
                : `${(currentIndex / (STEPS.length - 1)) * 100}%`,
            }}
          />
          {STEPS.map((step, i) => {
            const isDone = i < currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div key={step} className="flex flex-col items-center z-10 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isDone
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}>
                  {isDone ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <p className={`text-xs mt-2 font-medium capitalize text-center ${
                  isCurrent ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step}
                </p>
                {isCurrent && (
                  <span className="text-xs text-blue-500 mt-0.5">● Now</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrderById(id)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">❌</p>
        <h2 className="text-xl font-bold text-gray-800 mb-3">{error}</h2>
        <Link to="/orders" className="btn-primary inline-block mt-2">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <Link
            to="/orders"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mb-2"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <span className={`badge ${statusColor(order.status)} capitalize text-sm px-4 py-1.5`}>
          {order.status}
        </span>
      </div>

      {/* Timeline */}
      <StatusTimeline status={order.status} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Order Items */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🛍️</span> Order Items ({order.orderItems.length})
            </h2>
            <div className="space-y-3">
              {order.orderItems.map((item) => (
                <div key={item._id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                  <Link to={`/products/${item.product}`}>
                    <img
                      src={item.image || 'https://placehold.co/60x60?text=?'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl bg-gray-50 border border-gray-100"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product}`}
                      className="font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 text-sm"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📍</span> Shipping Address
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-gray-800">{order.shippingAddress?.fullName}</p>
              {order.shippingAddress?.phone && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span>📞</span> {order.shippingAddress.phone}
                </p>
              )}
              <p className="text-sm text-gray-600 flex items-start gap-2">
                <span>🏠</span>
                <span>
                  {order.shippingAddress?.address},{' '}
                  {order.shippingAddress?.city},{' '}
                  {order.shippingAddress?.postalCode},{' '}
                  {order.shippingAddress?.country}
                </span>
              </p>
              {order.shippingAddress?.notes && (
                <p className="text-sm text-gray-500 flex items-start gap-2">
                  <span>📝</span>
                  <span>{order.shippingAddress.notes}</span>
                </p>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💳</span> Payment
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  order.isPaid ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {order.paymentMethod === 'COD'
                    ? '💵'
                    : order.paymentMethod === 'Card'
                    ? '💳'
                    : '🅿️'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{order.paymentMethod}</p>
                  <p className="text-xs text-gray-500">
                    {order.isPaid ? `Paid on ${formatDate(order.paidAt)}` : 'Payment pending'}
                  </p>
                </div>
              </div>
              <span className={`badge ${
                order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {order.isPaid ? '✓ Paid' : 'Unpaid'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h2 className="font-bold text-gray-900 mb-4">Price Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-800">{formatPrice(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={`font-medium ${order.shippingPrice === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                  {order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span className="font-medium text-gray-800">{formatPrice(order.taxPrice)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-blue-600 text-xl">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span className={`font-medium ${order.isDelivered ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.isDelivered
                    ? `✓ ${formatDate(order.deliveredAt)}`
                    : '⏳ Not delivered yet'}
                </span>
              </div>
              {order.trackingNumber && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 font-medium mb-0.5">Tracking Number</p>
                  <p className="font-mono text-sm text-blue-800 font-semibold">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                Need help?{' '}
                <a href="mailto:support@shopapp.com" className="text-blue-500 hover:underline">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;