import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <div className="pt-20 min-h-screen bg-cream">
      {/* Header */}
      <section className="py-12 bg-tea-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Shopping Cart</h1>
          <p className="text-tea-300 mt-2">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-tea-300 mx-auto mb-4" />
            <h2 className="font-display text-2xl text-tea-800 mb-2">Your cart is empty</h2>
            <p className="text-tea-500 mb-6">Looks like you haven't found your perfect tea yet.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-matcha-600 text-white font-medium rounded-full hover:bg-matcha-700 transition-colors"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white rounded-xl shadow-sm p-4 md:p-6 flex gap-4 md:gap-6 items-center"
                >
                  <Link to={`/products/${item.product.id}`} className="shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product.id}`}>
                      <h3 className="font-display font-semibold text-tea-900 hover:text-matcha-700 transition-colors truncate">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-tea-500 text-sm">{item.product.weight} · {item.product.origin}</p>
                    <p className="text-matcha-600 font-bold mt-1">₹{item.product.price}</p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center border border-tea-200 rounded-full">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 hover:bg-tea-50 rounded-l-full transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5 text-tea-600" />
                    </button>
                    <span className="px-3 text-sm font-medium text-tea-900 min-w-[2.5rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-2 hover:bg-tea-50 rounded-r-full transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-tea-600" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right hidden sm:block">
                    <p className="font-bold text-tea-900">₹{item.product.price * item.quantity}</p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-tea-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-6 sticky top-28">
                <h3 className="font-display text-xl font-bold text-tea-900 mb-6">Order Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-tea-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-tea-600">
                    <span>Shipping</span>
                    <span>{totalPrice >= 999 ? <span className="text-matcha-600">Free</span> : '₹99'}</span>
                  </div>
                  {totalPrice < 999 && (
                    <p className="text-xs text-matcha-600 bg-matcha-50 p-2 rounded-lg">
                      Add ₹{999 - totalPrice} more for free shipping!
                    </p>
                  )}
                  <div className="border-t border-tea-200 pt-3 flex justify-between font-bold text-tea-900 text-lg">
                    <span>Total</span>
                    <span>₹{totalPrice + (totalPrice >= 999 ? 0 : 99)}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-matcha-600 text-white font-medium rounded-full hover:bg-matcha-700 transition-all shadow-lg shadow-matcha-600/25"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/products"
                  className="mt-3 w-full flex items-center justify-center gap-2 px-6 py-3 border border-tea-200 text-tea-700 font-medium rounded-full hover:bg-tea-50 transition-colors text-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
