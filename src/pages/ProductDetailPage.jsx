// frontend/src/pages/ProductDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, addReview } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/ui/StarRating';
import Spinner from '../components/ui/Spinner';
import { formatPrice, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id }          = useParams();
  const { addToCart }   = useCart();
  const { user }        = useAuth();

  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [qty,      setQty]      = useState(1);
  const [imgIndex, setImgIndex] = useState(0);

  // Review form
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProduct = async () => {
    try {
      const res = await getProductById(id);
      setProduct(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProduct(); }, [id]);

  const handleAddToCart = () => {
    addToCart(product, qty);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addReview(id, { rating, comment });
      toast.success('Review submitted!');
      setComment('');
      setRating(5);
      fetchProduct(); // Refresh reviews
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (!product) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Product not found.</p>
      <Link to="/products" className="btn-primary mt-4 inline-block">
        Back to Products
      </Link>
    </div>
  );

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-blue-600">Products</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* ── Product Section ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

        {/* Images */}
        <div>
          <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-square mb-3">
            <img
              src={product.images?.[imgIndex]?.url || 'https://placehold.co/600x600?text=No+Image'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === imgIndex ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-blue-600 font-medium mb-1">{product.brand}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <StarRating rating={product.rating} numReviews={product.numReviews} size="md" />
            <span className="text-sm text-gray-500">
              {product.numReviews} review{product.numReviews !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 py-3 border-y border-gray-100">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-gray-400 line-through text-lg">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="badge bg-red-100 text-red-700 text-sm">
                  -{discount}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="badge bg-gray-100 text-gray-600">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            {product.countInStock > 0 ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <span className="text-green-700 font-medium">
                  In Stock ({product.countInStock} available)
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                <span className="text-red-600 font-medium">Out of Stock</span>
              </>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          {product.countInStock > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2.5 hover:bg-gray-100 transition-colors text-lg font-medium"
                >
                  −
                </button>
                <span className="px-4 py-2.5 font-semibold text-gray-800 min-w-[3rem] text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(Math.min(product.countInStock, qty + 1))}
                  className="px-3 py-2.5 hover:bg-gray-100 transition-colors text-lg font-medium"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews Section ───────────────────────────── */}
      <div className="border-t border-gray-100 pt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Customer Reviews ({product.numReviews})
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Review List */}
          <div className="space-y-4">
            {product.reviews?.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              product.reviews.map((review) => (
                <div key={review._id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700
                        flex items-center justify-center text-sm font-bold">
                        {review.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-sm text-gray-800">
                        {review.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                  <p className="text-gray-600 text-sm mt-2">{review.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Write Review Form */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Write a Review</h3>

            {!user ? (
              <p className="text-gray-500 text-sm">
                Please{' '}
                <Link to="/login" className="text-blue-600 hover:underline">
                  sign in
                </Link>{' '}
                to write a review.
              </p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-2xl transition-transform hover:scale-110"
                      >
                        {star <= rating ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Comment
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    required
                    placeholder="Share your experience with this product..."
                    className="input-field resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;