// frontend/src/pages/admin/AdminProducts.jsx
import { useState, useEffect } from 'react';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
} from '../../api/productApi';
import Spinner from '../../components/ui/Spinner';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Electronics','Clothing','Books',
  'Home & Garden','Sports','Beauty','Toys','Food','Other',
];

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '',
  category: 'Electronics', brand: '', countInStock: '',
  imageUrl: '', isFeatured: false, tags: '',
};

// ── Product Form Modal ─────────────────────────────────
const ProductModal = ({ product, onClose, onSave }) => {
  const [form,    setForm]    = useState(
    product
      ? {
          ...product,
          imageUrl:      product.images?.[0]?.url || '',
          tags:          product.tags?.join(', ')  || '',
          originalPrice: product.originalPrice     || '',
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name:          form.name,
        description:   form.description,
        price:         Number(form.price),
        originalPrice: Number(form.originalPrice) || 0,
        category:      form.category,
        brand:         form.brand,
        countInStock:  Number(form.countInStock),
        isFeatured:    form.isFeatured,
        tags:          form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        images:        form.imageUrl
          ? [{ url: form.imageUrl, alt: form.name }]
          : [],
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl
          max-h-[90vh] overflow-y-auto">

          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Product Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Wireless Headphones"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price ($) *
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="79.99"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Original Price ($)
                </label>
                <input
                  name="originalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.originalPrice}
                  onChange={handleChange}
                  placeholder="129.99"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Brand
                </label>
                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="e.g. Samsung"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Stock Quantity *
                </label>
                <input
                  name="countInStock"
                  type="number"
                  min="0"
                  value={form.countInStock}
                  onChange={handleChange}
                  required
                  placeholder="50"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="sale, new, featured"
                  className="input-field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Image URL
                </label>
                <input
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="input-field"
                />
                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="mt-2 h-24 w-24 object-cover rounded-lg border border-gray-200"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Describe your product..."
                  className="input-field resize-none"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label
                  htmlFor="isFeatured"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Mark as Featured Product
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent
                      rounded-full animate-spin" />
                    Saving...
                  </>
                ) : product ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── Main Admin Products Page ───────────────────────────
const AdminProducts = () => {
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [search,    setSearch]    = useState('');
  const [deleting,  setDeleting]  = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ limit: 100 });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleCreate = async (payload) => {
    await createProduct(payload);
    toast.success('Product created!');
    fetchProducts();
  };

  const handleUpdate = async (payload) => {
    await updateProduct(editing._id, payload);
    toast.success('Product updated!');
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} total products</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, category or brand..."
          className="input-field max-w-sm"
        />
      </div>

      {/* Table */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Stock</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Featured</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]?.url ||
                            'https://placehold.co/40x40?text=?'}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                        />
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1 max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-gray-100 text-gray-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                        product.countInStock === 0
                          ? 'bg-red-100 text-red-700'
                          : product.countInStock < 5
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {product.countInStock === 0
                          ? 'Out of stock'
                          : `${product.countInStock} in stock`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {product.isFeatured ? (
                        <span className="badge bg-blue-100 text-blue-700">Featured</span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditing(product); setShowModal(true); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50
                            rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0
                              002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828
                              15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deleting === product._id}
                          className="p-1.5 text-red-500 hover:bg-red-50
                            rounded-lg transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2
                              2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0
                              00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProductModal
          product={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={editing ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
};

export default AdminProducts;