// frontend/src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/productApi';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';

const CATEGORIES = [
  { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&q=80' },
  { name: 'Clothing', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&q=80' },
  { name: 'Books', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&q=80' },
  { name: 'Sports', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&q=80' },
  { name: 'Home & Garden', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=200&q=80' },
  { name: 'Beauty', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&q=80' },
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featRes, latestRes] = await Promise.all([
          getProducts({ isFeatured: true, limit: 4 }),
          getProducts({ limit: 8, sortBy: 'createdAt', order: 'desc' }),
        ]);
        setFeatured(featRes.data);
        setLatest(latestRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero Section (เปลี่ยนเป็นแบบใส่รูปภาพ) ─────────────────────────────── */}
      <section
        className="text-white relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay สีเข้มทับรูป */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content ต้องใส่ relative เพื่อให้อยู่เหนือ overlay */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="inline-block bg-blue-600/60 text-blue-50 text-sm font-medium px-3 py-1 rounded-full mb-4">
              New Arrivals 2026
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">
              Shop Smarter,<br />Live Better
            </h1>
            <p className="text-gray-100 text-lg mb-8 leading-relaxed">
              Discover thousands of products at unbeatable prices.
              Fast shipping, easy returns, and 24/7 support.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Shop Now
              </Link>
              <Link
                to="/products?isFeatured=true"
                className="bg-white/10 backdrop-blur-sm border border-white/40 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition-colors"
              >
                View Featured
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '10,000+', label: 'Products' },
              { value: '50,000+', label: 'Customers' },
              { value: 'Free', label: 'Shipping over $100' },
              { value: '24/7', label: 'Customer Support' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              className="group bg-gray-50 rounded-2xl p-4 flex flex-col items-center transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 border border-transparent hover:border-blue-100"
            >
              <div className="w-16 h-16 mb-3 overflow-hidden rounded-full">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────── */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-500 text-sm mt-1">Handpicked quality items for you</p>
            </div>
            <Link to="/products" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View all →
            </Link>
          </div>

          {loading ? <Spinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Latest Products ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Latest Products</h2>
          <Link to="/products" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View all →
          </Link>
        </div>

        {loading ? <Spinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latest.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── Banner ───────────────────────────────────── */}
      <section className="bg-blue-600 text-white mx-4 sm:mx-8 mb-14 rounded-3xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-14 text-center">
          <h2 className="text-3xl font-bold mb-3">Free Shipping on Orders Over $100</h2>
          <p className="text-blue-100 mb-8">
            Use code <span className="font-bold text-white px-2 py-1 bg-blue-500 rounded">FREESHIP</span> at checkout
          </p>
          <Link
            to="/products"
            className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl transition-all shadow-lg inline-block"
          >
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;