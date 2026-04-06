// frontend/src/pages/CheckoutPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orderApi';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Payment', 'Review'];

const PAYMENT_METHODS = [
  {
    id:    'COD',
    label: 'Cash on Delivery',
    desc:  'Pay when your order arrives',
    icon:  '💵',
  },
  {
    id:    'Card',
    label: 'Credit / Debit Card',
    desc:  'Visa, Mastercard, etc.',
    icon:  '💳',
  },
  {
    id:    'PayPal',
    label: 'PayPal',
    desc:  'Pay via PayPal account',
    icon:  '🅿️',
  },
];

// ── Step Indicator ─────────────────────────────────────
const StepBar = ({ current }) => (
  <div className="flex items-center justify-center mb-10">
    {STEPS.map((step, i) => (
      <div key={step} className="flex items-center">
        <div className="flex flex-col items-center">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center
            font-semibold text-sm transition-all ${
              i < current
                ? 'bg-green-500 text-white'
                : i === current
                ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                : 'bg-gray-100 text-gray-400'
            }`}>
            {i < current ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          <span className={`text-xs mt-1.5 font-medium ${
            i === current ? 'text-blue-600' : 'text-gray-400'
          }`}>
            {step}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`w-20 sm:w-32 h-0.5 mx-2 mb-5 transition-colors ${
            i < current ? 'bg-green-400' : 'bg-gray-200'
          }`} />
        )}
      </div>
    ))}
  </div>
);

// ── Order Summary Sidebar ──────────────────────────────
const OrderSummary = ({ cartItems, cartSubtotal, shippingPrice, taxPrice, cartTotal }) => (
  <div className="card p-5 sticky top-20">
    <h3 className="font-bold text-gray-900 mb-4 text-base">Order Summary</h3>

    {/* Items */}
    <div className="space-y-3 max-h-56 overflow-y-auto mb-4">
      {cartItems.map((item) => (
        <div key={item._id} className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={item.images?.[0]?.url || 'https://placehold.co/48x48?text=?'}
              alt={item.name}
              className="w-12 h-12 object-cover rounded-lg bg-gray-50 border border-gray-100"
            />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600
              text-white text-xs rounded-full flex items-center justify-center
              font-medium">
              {item.quantity}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 line-clamp-1">
              {item.name}
            </p>
            <p className="text-xs text-gray-400">{item.brand}</p>
          </div>
          <span className="text-sm font-semibold text-gray-800 shrink-0">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      ))}
    </div>

    {/* Price Breakdown */}
    <div className="border-t border-gray-100 pt-4 space-y-2.5">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Subtotal</span>
        <span className="font-medium text-gray-800">{formatPrice(cartSubtotal)}</span>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>Shipping</span>
        <span className={`font-medium ${
          shippingPrice === 0 ? 'text-green-600' : 'text-gray-800'
        }`}>
          {shippingPrice === 0
            ? '🎉 FREE'
            : formatPrice(shippingPrice)}
        </span>
      </div>

      {shippingPrice > 0 && (
        <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
          💡 Add {formatPrice(100 - cartSubtotal)} more for free shipping!
        </p>
      )}

      <div className="flex justify-between text-sm text-gray-600">
        <span>Tax (10%)</span>
        <span className="font-medium text-gray-800">{formatPrice(taxPrice)}</span>
      </div>

      <div className="border-t border-gray-200 pt-3 flex justify-between">
        <span className="font-bold text-gray-900">Total</span>
        <span className="font-bold text-blue-600 text-xl">
          {formatPrice(cartTotal)}
        </span>
      </div>
    </div>

    {/* Security badges */}
    <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
      {[
        { icon: '🔒', text: 'SSL Secured Checkout' },
        { icon: '🔄', text: 'Easy 30-day returns' },
        { icon: '🚚', text: 'Fast & reliable delivery' },
      ].map((badge) => (
        <div key={badge.text} className="flex items-center gap-2">
          <span className="text-sm">{badge.icon}</span>
          <span className="text-xs text-gray-500">{badge.text}</span>
        </div>
      ))}
    </div>
  </div>
);

// ── Main Checkout Page ─────────────────────────────────
const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const {
    cartItems, cartSubtotal, shippingPrice,
    taxPrice, cartTotal, clearCart,
  } = useCart();

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);

  // Shipping form state
  const [shipping, setShipping] = useState({
    fullName:   user?.name    || '',
    phone:      '',
    address:    '',
    city:       '',
    postalCode: '',
    country:    'Vietnam',
    notes:      '',
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
        <Link to="/products" className="btn-primary inline-block mt-2">
          Start Shopping
        </Link>
      </div>
    );
  }

  const handleShippingChange = (e) =>
    setShipping({ ...shipping, [e.target.name]: e.target.value });

  // Validate shipping before moving to step 2
  const handleShippingSubmit = (e) => {
    e.preventDefault();
    const required = ['fullName', 'phone', 'address', 'city', 'postalCode', 'country'];
    for (const field of required) {
      if (!shipping[field].trim()) {
        toast.error(`Please fill in: ${field}`);
        return;
      }
    }
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Place the order
  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product:  item._id,
          quantity: item.quantity,
        })),
        shippingAddress: shipping,
        paymentMethod,
      };

      const res = await createOrder(orderData);
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-6">
        <Link
          to="/cart"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium
            flex items-center gap-1 mb-3"
        >
          ← Back to Cart
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
      </div>

      {/* Step Bar */}
      <StepBar current={step} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: Steps Content ─────────────────── */}
        <div className="lg:col-span-2">

          {/* ════ STEP 0: Shipping ════ */}
          {step === 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">📍</span>
                Shipping Address
              </h2>

              <form onSubmit={handleShippingSubmit} className="space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      name="fullName"
                      value={shipping.fullName}
                      onChange={handleShippingChange}
                      placeholder="John Doe"
                      required
                      className="input-field"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={shipping.phone}
                      onChange={handleShippingChange}
                      placeholder="e.g. 0812345678"
                      required
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address *
                  </label>
                  <input
                    name="address"
                    value={shipping.address}
                    onChange={handleShippingChange}
                    placeholder="House no., Street, Soi"
                    required
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City / District *
                    </label>
                    <input
                      name="city"
                      value={shipping.city}
                      onChange={handleShippingChange}
                      placeholder="Bangkok"
                      required
                      className="input-field"
                    />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Postal Code *
                    </label>
                    <input
                      name="postalCode"
                      value={shipping.postalCode}
                      onChange={handleShippingChange}
                      placeholder="10110"
                      required
                      className="input-field"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={shipping.country}
                      onChange={handleShippingChange}
                      className="input-field"
                    >
                      {[
                        'Vietnam', 'United States', 'United Kingdom',
                        'Japan', 'Singapore', 'Australia', 'Other',
                      ].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Delivery Notes
                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    name="notes"
                    value={shipping.notes}
                    onChange={handleShippingChange}
                    rows={2}
                    placeholder="e.g. Leave at the door, call before delivery..."
                    className="input-field resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-3 text-base flex
                    items-center justify-center gap-2 mt-2"
                >
                  Continue to Payment
                  <svg className="w-4 h-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            </div>
          )}

          {/* ════ STEP 1: Payment ════ */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">💳</span>
                Payment Method
              </h2>

              <div className="space-y-3 mb-6">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2
                      cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600 accent-blue-600"
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${
                        paymentMethod === method.id
                          ? 'text-blue-700'
                          : 'text-gray-800'
                      }`}>
                        {method.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
                    </div>
                    {paymentMethod === method.id && (
                      <svg className="w-5 h-5 text-blue-500 shrink-0" fill="currentColor"
                        viewBox="0 0 20 20">
                        <path fillRule="evenodd" clipRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1
                          1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0
                          00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>

              {/* COD notice */}
              {paymentMethod === 'COD' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl
                  p-4 mb-6 flex gap-3">
                  <span className="text-xl shrink-0">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">
                      Cash on Delivery
                    </p>
                    <p className="text-xs text-yellow-700 mt-0.5">
                      Please prepare exact change. Our delivery agent will
                      collect payment upon arrival.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="btn-secondary flex-1"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    setStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  Review Order
                  <svg className="w-4 h-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ════ STEP 2: Review & Confirm ════ */}
          {step === 2 && (
            <div className="space-y-5">

              {/* Shipping Summary */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <span>📍</span> Shipping Address
                  </h2>
                  <button
                    onClick={() => setStep(0)}
                    className="text-blue-600 text-sm hover:underline font-medium"
                  >
                    Edit
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
                  <p className="font-semibold text-gray-800">{shipping.fullName}</p>
                  <p className="text-gray-600">📞 {shipping.phone}</p>
                  <p className="text-gray-600">
                    🏠 {shipping.address}, {shipping.city},
                    {shipping.postalCode}, {shipping.country}
                  </p>
                  {shipping.notes && (
                    <p className="text-gray-500 text-xs mt-1">
                      📝 {shipping.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <span>💳</span> Payment Method
                  </h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-blue-600 text-sm hover:underline font-medium"
                  >
                    Edit
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  {PAYMENT_METHODS.filter((m) => m.id === paymentMethod).map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <span className="text-2xl">{m.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{m.label}</p>
                        <p className="text-xs text-gray-500">{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items Summary */}
              <div className="card p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🛍️</span> Order Items ({cartItems.length})
                </h2>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item._id}
                      className="flex items-center gap-3 py-2 border-b
                        border-gray-50 last:border-0">
                      <img
                        src={item.images?.[0]?.url ||
                          'https://placehold.co/48x48?text=?'}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-gray-800">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Final Price Breakdown */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={shippingPrice === 0 ? 'text-green-600 font-medium' : ''}>
                      {shippingPrice === 0 ? 'FREE' : formatPrice(shippingPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (10%)</span>
                    <span>{formatPrice(taxPrice)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900
                    text-base pt-2 border-t border-gray-200">
                    <span>Total Amount</span>
                    <span className="text-blue-600 text-xl">{formatPrice(cartTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  ← Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="btn-primary flex-1 py-3 text-base flex
                    items-center justify-center gap-2"
                >
                  {placing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white
                        border-t-transparent rounded-full animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7" />
                      </svg>
                      Place Order — {formatPrice(cartTotal)}
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 pb-4">
                By placing your order, you agree to our Terms of Service
                and Privacy Policy.
              </p>
            </div>
          )}
        </div>

        {/* ── Right: Order Summary ─────────────────── */}
        <div className="lg:col-span-1">
          <OrderSummary
            cartItems={cartItems}
            cartSubtotal={cartSubtotal}
            shippingPrice={shippingPrice}
            taxPrice={taxPrice}
            cartTotal={cartTotal}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;