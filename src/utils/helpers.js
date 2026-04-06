// frontend/src/utils/helpers.js

// Format price: 79.99 → "$79.99"
export const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: 'USD',
  }).format(price);

// Format date: "2024-01-15T..." → "Jan 15, 2024"
export const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  });

// Calculate discount percentage
export const getDiscount = (original, current) => {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
};

// Truncate long text
export const truncate = (text, maxLength = 80) =>
  text?.length > maxLength ? text.slice(0, maxLength) + '...' : text;

// Order status colors for badges
export const statusColor = (status) => {
  const map = {
    pending:    'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100   text-blue-800',
    shipped:    'bg-purple-100 text-purple-800',
    delivered:  'bg-green-100  text-green-800',
    cancelled:  'bg-red-100    text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};