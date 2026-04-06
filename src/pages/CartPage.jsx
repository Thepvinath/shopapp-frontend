// frontend/src/pages/CartPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity,
          cartSubtotal, shippingPrice, taxPrice, cartTotal } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate       = useNavigate();

  const handleCheckout = () => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-6">🛒</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">
          Looks like you haven't added anything yet.
        </p>
        <Link to="/products" className="btn-primary inline-block px-8">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Shopping Cart
        <span className="text-lg font-normal text-gray-500 ml-3">
          ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Cart Items ───────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="card p-4 flex gap-4 items-start">

              {/* Image */}
              <Link to={`/products/${item._id}`} className="shrink-0">
                <img
                  src={item.images?.[0]?.url || 'https://placehold.co/100x100?text=No+Image'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-50"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item._id}`}
                  className="font-semibold text-gray-800 hover:text-blue-600
                    transition-colors line-clamp-2 text-sm"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">{item.brand}</p>

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-gray-200 rounded-lg
                    overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1 hover:bg-gray-100 transition-colors
                        disabled:opacity-40 text-sm font-medium"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-sm font-semibold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      disabled={item.quantity >= item.countInStock}
                      className="px-2.5 py-1 hover:bg-gray-100 transition-colors
                        disabled:opacity-40 text-sm font-medium"
                    >
                      +
                    </button>
                  </div>

                  {/* Price + Remove */}
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0
                          01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1
                          1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link
            to="/products"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium
              flex items-center gap-1 mt-2"
          >
            ← Continue Shopping
          </Link>
        </div>

        {/* ── Order Summary ────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-800">
                  {formatPrice(cartSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={`font-medium ${
                  shippingPrice === 0 ? 'text-green-600' : 'text-gray-800'
                }`}>
                  {shippingPrice === 0 ? 'FREE' : formatPrice(shippingPrice)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span className="font-medium text-gray-800">
                  {formatPrice(taxPrice)}
                </span>
              </div>

              {cartSubtotal < 100 && (
                <p className="text-xs text-blue-600 bg-blue-50 rounded-lg p-2.5">
                  Add {formatPrice(100 - cartSubtotal)} more for free shipping!
                </p>
              )}

              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-gray-900 text-base">Total</span>
                <span className="font-bold text-blue-600 text-lg">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="btn-primary w-full mt-5 py-3 text-base"
            >
              Proceed to Checkout
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2
                  2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;