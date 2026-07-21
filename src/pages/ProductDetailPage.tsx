import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Minus, Plus, ArrowLeft, Truck, Shield, RotateCcw, AlertTriangle } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products } = useProducts();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <p className="text-6xl mb-4">🍵</p>
          <h2 className="font-display text-3xl text-tea-900 mb-4">Tea Not Found</h2>
          <Link to="/products" className="text-matcha-600 hover:text-matcha-700 font-medium">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id && p.inStock).slice(0, 4);

  return (
    <div className="pt-20 bg-cream min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-tea-500">
          <Link to="/" className="hover:text-matcha-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-matcha-600">Products</Link>
          <span>/</span>
          <span className="text-tea-800">{product.name}</span>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image */}
          <div className="relative">
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 z-10 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-tea-700" />
            </button>
            <img
              src={product.image}
              alt={product.name}
              className={`w-full aspect-square object-cover rounded-2xl shadow-xl ${!product.inStock ? 'grayscale opacity-70' : ''}`}
            />
            {!product.inStock && (
              <div className="absolute inset-0 rounded-2xl bg-tea-950/40 flex items-center justify-center">
                <span className="px-6 py-3 bg-red-600 text-white text-lg font-bold rounded-full shadow-xl">
                  Out of Stock
                </span>
              </div>
            )}
            {product.inStock && product.badge && (
              <span className="absolute top-4 right-4 px-4 py-1.5 bg-matcha-600 text-white text-sm font-medium rounded-full">
                {product.badge}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <p className="text-matcha-600 uppercase tracking-[0.2em] text-sm font-medium mb-2">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)} Tea
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-tea-900 mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-tea-200'}`} />
                ))}
              </div>
              <span className="text-tea-600 text-sm">{product.rating} ({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className={`font-display text-4xl font-bold ${product.inStock ? 'text-matcha-600' : 'text-tea-400 line-through'}`}>₹{product.price}</span>
              <span className="text-tea-400 text-sm">/ {product.weight}</span>
            </div>

            <p className="text-tea-700 leading-relaxed mb-6">{product.description}</p>

            {/* Meta + Stock Info */}
            <div className="flex flex-wrap gap-3 mb-6 text-sm">
              <span className="px-3 py-1.5 bg-tea-100 rounded-full text-tea-700">📍 {product.origin}</span>
              <span className="px-3 py-1.5 bg-tea-100 rounded-full text-tea-700">📦 {product.weight}</span>
              {product.inStock ? (
                <span className="px-3 py-1.5 bg-matcha-50 rounded-full text-matcha-700 font-medium">
                  ✓ In Stock
                </span>
              ) : (
                <span className="px-3 py-1.5 bg-red-50 rounded-full text-red-700 font-medium">
                  ✗ Out of Stock
                </span>
              )}
            </div>

            {/* Out of stock notice */}
            {!product.inStock && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  This product is currently out of stock. Please check back later.
                </p>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            {product.inStock ? (
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center border border-tea-200 rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-tea-50 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-tea-600" />
                  </button>
                  <span className="px-5 text-tea-900 font-medium min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-tea-50 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-tea-600" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    addToCart(product, quantity);
                    toast.success(`${quantity}x ${product.name} added to cart!`);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 bg-matcha-600 text-white font-medium rounded-full hover:bg-matcha-700 transition-all shadow-lg shadow-matcha-600/25 hover:shadow-matcha-600/40"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart — ₹{product.price * quantity}
                </button>
              </div>
            ) : (
              <div className="mb-8">
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-300 text-gray-500 font-medium rounded-full cursor-not-allowed"
                >
                  Out of Stock
                </button>
              </div>
            )}

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4 border-t border-tea-200 pt-6">
              {[
                { icon: Truck, text: 'Free Shipping\nOrders ₹999+' },
                { icon: Shield, text: 'Freshness\nGuaranteed' },
                { icon: RotateCcw, text: '30-Day\nReturns' },
              ].map((g) => (
                <div key={g.text} className="flex flex-col items-center text-center">
                  <g.icon className="w-5 h-5 text-matcha-600 mb-1" />
                  <p className="text-tea-600 text-xs whitespace-pre-line">{g.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-bold text-tea-900 mb-8">You May Also Like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((tea) => (
                <Link
                  key={tea.id}
                  to={`/products/${tea.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500"
                >
                  <div className="h-44 overflow-hidden">
                    <img src={tea.image} alt={tea.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-tea-900 group-hover:text-matcha-700 transition-colors">{tea.name}</h3>
                    <p className="text-matcha-600 font-bold mt-1">₹{tea.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
