// frontend/src/components/product/ProductCard.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import StarRating from '../ui/StarRating';
import { formatPrice, getDiscount } from '../../utils/helpers';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const discount = getDiscount(product.originalPrice, product.price);

  return (
    <div className="card group flex flex-col overflow-hidden">
      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.images?.[0]?.url || 'https://placehold.co/400x400?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105
              transition-transform duration-300"
          />
        </Link>

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 badge bg-red-500 text-white">
            -{discount}%
          </span>
        )}

        {/* Featured Badge */}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 badge bg-blue-600 text-white">
            Featured
          </span>
        )}

        {/* Out of Stock Overlay */}
        {product.countInStock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">
          {product.brand}
        </p>

        <Link
          to={`/products/${product._id}`}
          className="font-semibold text-gray-800 hover:text-blue-600
            transition-colors line-clamp-2 text-sm leading-snug"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <StarRating rating={product.rating} numReviews={product.numReviews} />

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => addToCart(product)}
          disabled={product.countInStock === 0}
          className="btn-primary w-full mt-2 text-sm py-2"
        >
          {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;