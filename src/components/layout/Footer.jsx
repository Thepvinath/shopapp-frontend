// frontend/src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-600 text-white w-7 h-7 rounded-lg
              flex items-center justify-center font-bold text-sm">S</div>
            <span className="text-white font-bold text-lg">ShopApp</span>
          </div>
          <p className="text-sm leading-relaxed">
            Your one-stop shop for everything you need. Quality products,
            fast delivery, great prices.
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/"         className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
            <li><Link to="/cart"     className="hover:text-white transition-colors">Cart</Link></li>
            <li><Link to="/orders"   className="hover:text-white transition-colors">My Orders</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li>support@shopapp.com</li>
            <li>+1 (555) 123-4567</li>
            <li>Mon - Fri, 9am - 6pm EST</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
        <p>© {new Date().getFullYear()} ShopApp. Built with MERN Stack.</p>
      </div>
    </div>
  </footer>
);

export default Footer;