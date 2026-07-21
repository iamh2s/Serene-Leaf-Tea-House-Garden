import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Products', to: '/products' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAdmin } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  const showTransparent = isHome && !isScrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        showTransparent
          ? 'bg-transparent'
          : 'bg-cream/95 backdrop-blur-md shadow-lg shadow-tea-900/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Leaf
              className={`w-8 h-8 transition-colors duration-300 ${
                showTransparent ? 'text-matcha-400' : 'text-matcha-600'
              } group-hover:text-matcha-500`}
            />
            <div className="flex flex-col">
              <span
                className={`font-display text-xl font-bold tracking-wide transition-colors duration-300 ${
                  showTransparent ? 'text-white' : 'text-tea-900'
                }`}
              >
                Serene Leaf
              </span>
              <span
                className={`text-[10px] uppercase tracking-[0.3em] -mt-1 transition-colors duration-300 ${
                  showTransparent ? 'text-tea-200' : 'text-tea-500'
                }`}
              >
                Tea House
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`text-sm font-medium tracking-wide uppercase transition-colors duration-300 hover:text-matcha-500 ${
                  location.pathname === link.to
                    ? showTransparent ? 'text-matcha-300' : 'text-matcha-600'
                    : showTransparent ? 'text-white/90' : 'text-tea-700'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Admin link */}
            <Link
              to={isAdmin ? '/admin' : '/admin/login'}
              className={`text-sm font-medium transition-colors duration-300 hover:text-matcha-500 ${
                showTransparent ? 'text-white/90' : 'text-tea-700'
              }`}
              title="Admin"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-full hover:bg-matcha-50/20 transition-colors"
            >
              <ShoppingCart
                className={`w-5 h-5 transition-colors ${
                  showTransparent ? 'text-white' : 'text-tea-800'
                }`}
              />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-matcha-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile right side */}
          <div className="flex md:hidden items-center gap-3">
            <Link to="/cart" className="relative p-2">
              <ShoppingCart
                className={`w-5 h-5 ${showTransparent ? 'text-white' : 'text-tea-800'}`}
              />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-matcha-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={`p-2 rounded-lg transition-colors ${
                showTransparent ? 'text-white' : 'text-tea-800'
              }`}
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-500 overflow-hidden ${
          isMobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-cream/98 backdrop-blur-md border-t border-tea-200 px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`block font-medium transition-colors ${
                location.pathname === link.to ? 'text-matcha-600' : 'text-tea-800 hover:text-matcha-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to={isAdmin ? '/admin' : '/admin/login'}
            className="block text-tea-800 font-medium hover:text-matcha-600 transition-colors"
          >
            {isAdmin ? 'Admin Dashboard' : 'Admin Login'}
          </Link>
        </div>
      </div>
    </nav>
  );
}
