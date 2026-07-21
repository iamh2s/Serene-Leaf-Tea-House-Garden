import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, CreditCard, Shield, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import * as api from '../services/api';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type CheckoutForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

type FormErrors = Partial<Record<keyof CheckoutForm, string>>;

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

// ===== VALIDATION HELPERS =====
const validators = {
  name: (val: string): string => {
    if (!val.trim()) return 'Name is required';
    if (val.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(val)) return 'Name should only contain letters';
    return '';
  },
  email: (val: string): string => {
    if (!val.trim()) return 'Email is required';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(val.trim())) return 'Enter a valid email (e.g. name@example.com)';
    return '';
  },
  phone: (val: string): string => {
    if (!val.trim()) return 'Phone number is required';
    if (!/^\d+$/.test(val)) return 'Phone must contain only digits';
    if (val.length !== 10) return 'Phone must be exactly 10 digits';
    if (!/^[6-9]/.test(val)) return 'Phone must start with 6, 7, 8, or 9';
    return '';
  },
  address: (val: string): string => {
    if (!val.trim()) return 'Address is required';
    if (val.trim().length < 10) return 'Address must be at least 10 characters';
    return '';
  },
  city: (val: string): string => {
    if (!val.trim()) return '';
    if (!/^[a-zA-Z\s]+$/.test(val)) return 'City should only contain letters';
    return '';
  },
  state: (val: string): string => {
    if (!val.trim()) return '';
    if (!/^[a-zA-Z\s]+$/.test(val)) return 'State should only contain letters';
    return '';
  },
  pincode: (val: string): string => {
    if (!val.trim()) return '';
    if (!/^\d+$/.test(val)) return 'Pincode must contain only digits';
    if (val.length !== 6) return 'Pincode must be exactly 6 digits';
    return '';
  },
};

// ===== INPUT FILTERS (block invalid characters as user types) =====
const filterInput = (field: keyof CheckoutForm, value: string): string => {
  switch (field) {
    case 'name':
    case 'city':
    case 'state':
      // Only letters and spaces
      return value.replace(/[^a-zA-Z\s]/g, '');
    case 'phone':
      // Only digits, max 10
      return value.replace(/\D/g, '').slice(0, 10);
    case 'pincode':
      // Only digits, max 6
      return value.replace(/\D/g, '').slice(0, 6);
    case 'email':
      // No spaces in email
      return value.replace(/\s/g, '');
    default:
      return value;
  }
};

function extractProductId(product: any): string | null {
  if (!product) return null;
  const id =
    product.id ??
    product._id ??
    product.uuid ??
    product.product_id ??
    product.slug ??
    null;
  if (id === null || id === undefined || id === '') return null;
  return String(id);
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, totalItems } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const [form, setForm] = useState<CheckoutForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CheckoutForm, boolean>>>({});

  const shipping = totalPrice >= 999 ? 0 : 99;
  const grandTotal = totalPrice + shipping;
  const amountInPaise = Math.round(grandTotal * 100);

  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayReady(true);
      return;
    }

    const existing = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`
    );

    if (existing) {
      existing.addEventListener('load', () => setRazorpayReady(true));
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    script.onerror = () =>
      toast.error('Failed to load Razorpay. Please refresh.');
    document.body.appendChild(script);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name as keyof CheckoutForm;
    const filtered = filterInput(field, e.target.value);

    setForm((prev) => ({ ...prev, [field]: filtered }));

    // Live validate if field was touched
    if (touched[field]) {
      const errorMsg = validators[field](filtered);
      setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const field = e.target.name as keyof CheckoutForm;
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validators[field](form[field]);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    const allTouched: Partial<Record<keyof CheckoutForm, boolean>> = {};

    (Object.keys(form) as Array<keyof CheckoutForm>).forEach((field) => {
      const err = validators[field](form[field]);
      if (err) newErrors[field] = err;
      allTouched[field] = true;
    });

    setErrors(newErrors);
    setTouched(allTouched);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the errors in the form');
      return false;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return false;
    }

    if (!razorpayReady || !window.Razorpay) {
      toast.error('Payment gateway loading...');
      return false;
    }

    return true;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);

    try {
      const mappedItems = items.map((item) => {
        const productId = extractProductId(item.product);
        if (!productId) {
          throw new Error(`Product "${item.product?.name}" has no valid ID`);
        }
        return {
          product_id: productId,
          quantity: Number(item.quantity),
        };
      });

      const orderPayload = {
        customer_name: form.name.trim(),
        customer_email: form.email.trim(),
        customer_phone: form.phone.trim(),
        shipping_address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        items: mappedItems,
      };

      console.log('=== CHECKOUT: Creating backend order ===');
      const backendOrder = await api.createOrder(orderPayload);
      console.log('✅ Backend order:', backendOrder.id);

      console.log('=== CHECKOUT: Creating Razorpay order ===');
      const razorpayOrder = await api.createRzpOrder(amountInPaise);
      console.log('✅ Razorpay order:', razorpayOrder.id);

      const options = {
        key: razorpayOrder.key_id,
        amount: amountInPaise,
        currency: 'INR',
        name: 'Serene Leaf Tea House',
        description: `Order of ${totalItems} item(s)`,
        order_id: razorpayOrder.id,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        notes: {
          backend_order_id: String(backendOrder.id),
          address: `${form.address}, ${form.city}, ${form.state} ${form.pincode}`,
        },
        theme: { color: '#2d6e30' },
        handler: async (response: any) => {
          try {
            await api.verifyPayment({
              order_id: String(backendOrder.id),
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const frontendOrder = addOrder(
              items,
              grandTotal,
              form.name,
              form.email,
              response.razorpay_payment_id
            );

            clearCart();
            toast.success('Payment successful! 🎉');

            navigate('/order-success', {
              state: {
                order: JSON.parse(JSON.stringify(frontendOrder ?? backendOrder)),
              },
            });
          } catch (error) {
            console.error('❌ Verify payment failed:', error);
            toast.error('Payment captured but verification failed. Contact support.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast('Payment cancelled', { icon: '⚠️' });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (res: any) => {
        setLoading(false);
        toast.error(res?.error?.description || 'Payment failed. Please try again.');
      });
      rzp.open();
    } catch (error) {
      console.error('❌ Checkout error:', error);
      setLoading(false);
      toast.error(api.getApiErrorMessage(error));
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🛒</p>
          <h2 className="font-display text-2xl text-tea-900 mb-2">Nothing to checkout</h2>
          <p className="text-tea-500 mb-6">Add some teas to your cart first.</p>
          <Link
            to="/products"
            className="px-6 py-3 bg-matcha-600 text-white rounded-full font-medium hover:bg-matcha-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // Helper to get input styling based on validation state
  const getInputClass = (field: keyof CheckoutForm) => {
    const baseClass =
      'w-full px-4 py-3 rounded-xl border bg-tea-50/50 text-tea-900 placeholder:text-tea-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors';

    if (errors[field] && touched[field]) {
      return `${baseClass} border-red-400 focus:ring-red-400 bg-red-50/30`;
    }
    if (touched[field] && !errors[field] && form[field]) {
      return `${baseClass} border-matcha-300 focus:ring-matcha-500 bg-matcha-50/30`;
    }
    return `${baseClass} border-tea-200 focus:ring-matcha-500`;
  };

  // Helper to render validation icon
  const renderFieldStatus = (field: keyof CheckoutForm) => {
    if (!touched[field] || !form[field]) return null;
    if (errors[field]) {
      return <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />;
    }
    return <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-matcha-600" />;
  };

  return (
    <div className="pt-20 min-h-screen bg-cream">
      <section className="py-10 bg-tea-900">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1 text-tea-300 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
            <Lock className="w-7 h-7 text-matcha-400" /> Secure Checkout
          </h1>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <form
              onSubmit={handlePayment}
              noValidate
              className="bg-white rounded-2xl shadow-md p-6 md:p-8"
            >
              <h2 className="font-display text-xl font-bold text-tea-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-matcha-600" /> Shipping & Payment Details
              </h2>

              <div className="grid sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-tea-700 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="John Doe"
                      maxLength={50}
                      className={getInputClass('name')}
                    />
                    {renderFieldStatus('name')}
                  </div>
                  {errors.name && touched.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-tea-700 mb-1.5">
                    Email *
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="name@example.com"
                      className={getInputClass('email')}
                    />
                    {renderFieldStatus('email')}
                  </div>
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-tea-700 mb-1.5">
                    Phone * <span className="text-tea-400 text-xs">(10 digits)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tea-500 text-sm font-medium">
                      +91
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      value={form.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`${getInputClass('phone')} pl-12`}
                    />
                    {renderFieldStatus('phone')}
                  </div>
                  {errors.phone && touched.phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-tea-700 mb-1.5">
                    Pincode <span className="text-tea-400 text-xs">(6 digits)</span>
                  </label>
                  <div className="relative">
                    <input
                      name="pincode"
                      type="text"
                      inputMode="numeric"
                      value={form.pincode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="110001"
                      maxLength={6}
                      className={getInputClass('pincode')}
                    />
                    {renderFieldStatus('pincode')}
                  </div>
                  {errors.pincode && touched.pincode && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.pincode}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-tea-700 mb-1.5">
                    Address *
                  </label>
                  <div className="relative">
                    <input
                      name="address"
                      type="text"
                      value={form.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="House/Flat No, Street, Landmark"
                      maxLength={200}
                      className={getInputClass('address')}
                    />
                    {renderFieldStatus('address')}
                  </div>
                  {errors.address && touched.address && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-tea-700 mb-1.5">
                    City
                  </label>
                  <div className="relative">
                    <input
                      name="city"
                      type="text"
                      value={form.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Mumbai"
                      maxLength={50}
                      className={getInputClass('city')}
                    />
                    {renderFieldStatus('city')}
                  </div>
                  {errors.city && touched.city && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-tea-700 mb-1.5">
                    State
                  </label>
                  <div className="relative">
                    <input
                      name="state"
                      type="text"
                      value={form.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Maharashtra"
                      maxLength={50}
                      className={getInputClass('state')}
                    />
                    {renderFieldStatus('state')}
                  </div>
                  {errors.state && touched.state && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading || !razorpayReady}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-matcha-600 text-white font-semibold rounded-xl hover:bg-matcha-700 transition-all shadow-lg shadow-matcha-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-4 h-4" />
                  {loading
                    ? 'Processing...'
                    : !razorpayReady
                    ? 'Loading payment gateway...'
                    : `Pay ₹${grandTotal} with Razorpay`}
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-tea-400 text-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>Secured by Razorpay · 256-bit SSL Encryption</span>
              </div>
            </form>
          </div>

          <div>
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-28">
              <h3 className="font-display text-xl font-bold text-tea-900 mb-6">
                Order Summary
              </h3>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={extractProductId(item.product) || item.product?.name}
                    className="flex items-center gap-3"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-tea-900 text-sm font-medium truncate">
                        {item.product.name}
                      </p>
                      <p className="text-tea-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-tea-800 text-sm font-medium">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-tea-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-tea-600">
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-tea-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-matcha-600">Free</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                <div className="border-t border-tea-200 pt-2 flex justify-between font-bold text-tea-900 text-lg">
                  <span>Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}