import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Order } from '../types';

export default function OrderSuccessPage() {
  const location = useLocation();
  const order = location.state?.order as Order | undefined;

  return (
    <div className="pt-20 min-h-screen bg-cream flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 text-center py-20">
        <div className="w-20 h-20 mx-auto bg-matcha-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-matcha-600" />
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-tea-900 mb-3">
          Order Placed Successfully!
        </h1>
        <p className="text-tea-600 text-lg mb-8">
          Thank you for your purchase. Your tea is on its way! 🍵
        </p>

        {order && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8 text-left">
            <h3 className="font-display text-lg font-semibold text-tea-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-matcha-600" />
              Order Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-tea-500">Order ID</span>
                <span className="text-tea-900 font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-tea-500">Date</span>
                <span className="text-tea-900">{order.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-tea-500">Status</span>
                <span className="px-2 py-0.5 bg-matcha-100 text-matcha-700 text-xs font-medium rounded-full capitalize">{order.status}</span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between">
                  <span className="text-tea-500">Payment ID</span>
                  <span className="text-tea-900 font-mono text-xs">{order.paymentId}</span>
                </div>
              )}
              <div className="border-t border-tea-200 pt-2 flex justify-between font-bold text-tea-900">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-matcha-600 text-white font-medium rounded-full hover:bg-matcha-700 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-tea-200 text-tea-700 font-medium rounded-full hover:bg-tea-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
