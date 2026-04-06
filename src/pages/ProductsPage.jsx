// frontend/src/pages/ProductsPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/productApi';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';
import Pagination from '../components/ui/Pagination';

const CATEGORIES = [
  'All', 'Electronics', 'Clothing', 'Books',
  'Home & Garden', 'Sports', 'Beauty', 'Toys', 'Food',
];

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'price-asc',      label: 'Price: Low to High' },
  { value: 'price-desc',     label: 'Price: High to Low' },
  { value: 'rating-desc',    label: 'Top Rated' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);

  // Filter state
  const [keyword,  setKeyword]  = useState(searchParams.get('keyword')  || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy,   setSortBy]   = useState('createdAt-desc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState(searchParams.get('keyword') || '');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [sortField, sortOrder] = sortBy.split('-');
      const params = {
        page,
        limit: 12,
        sortBy: sortField,
        order: sortOrder,
      };
      if (keyword)               params.keyword  = keyword;
      if (category !== 'All')    params.category = category;
      if (minPrice)              params.minPrice = minPrice;
      if (maxPrice)              params.maxPrice = maxPrice;

      const res = await getProducts(params);
      setProducts(res.data);
      setTotalPages(res.pages);
      setTotalCount(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [keyword, category, sortBy, minPrice, maxPrice, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(search);
    setPage(1);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setSearch('');
    setCategory('All');
    setSortBy('createdAt-desc');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Page Header ──────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
        <p className="text-gray-500 mt-1">{totalCount} products found</p>
      </div>

      {/* ── Search Bar ───────────────────────────────── */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary px-6">
          Search
        </button>
        {(keyword || category !== 'All' || minPrice || maxPrice) && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="btn-secondary px-4 text-sm"
          >
            Clear
          </button>
        )}
      </form>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Sidebar Filters ──────────────────────── */}
        <aside className="w-full lg:w-56 shrink-0">
          <div className="card p-5 space-y-6 sticky top-20">

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase
                tracking-wide">
                Category
              </h3>
              <ul className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategoryChange(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm
                        transition-colors ${
                          category === cat
                            ? 'bg-blue-600 text-white font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase
                tracking-wide">
                Price Range
              </h3>
              <div className="space-y-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  placeholder="Min $"
                  className="input-field text-sm py-2"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  placeholder="Max $"
                  className="input-field text-sm py-2"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* ── Products Grid ────────────────────────── */}
        <div className="flex-1">

          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-800">{products.length}</span> of{' '}
              <span className="font-medium text-gray-800">{totalCount}</span> results
            </p>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="input-field w-auto text-sm py-2 pr-8"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <Spinner />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filters
              </p>
              <button onClick={handleClearFilters} className="btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;