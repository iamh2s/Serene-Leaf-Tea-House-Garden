import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  MessageSquare,
  LogOut,
  Package,
  IndianRupee,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
} from 'lucide-react';
import * as api from '../services/api';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';
import toast from 'react-hot-toast';

type Tab = 'dashboard' | 'orders' | 'customers' | 'messages' | 'products';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(false);

  // ====== USE PRODUCTCONTEXT — shared with customer pages ======
  const {
    products,
    toggleStock,
    updateProduct,
    deleteProduct,
    addProduct,
    refetch: refetchProducts,
  } = useProducts();

  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // Product form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Auth check
  useEffect(() => {
    const savedToken =
      localStorage.getItem('admin_token') ||
      sessionStorage.getItem('sereneleaf_token');
    if (!savedToken) {
      navigate('/admin/login');
      return;
    }
    setToken(savedToken);
    setAuthChecked(true);
  }, [navigate]);

  // Load data
  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);
      try {
        if (activeTab === 'dashboard') {
          const data = await api.getDashboardStats(token);
          setStats(data);
        } else if (activeTab === 'orders') {
          const data = await api.getAllOrders(token);
          setOrders(Array.isArray(data) ? data : []);
        } else if (activeTab === 'customers') {
          const data = await api.getCustomers(token);
          setCustomers(Array.isArray(data) ? data : []);
        } else if (activeTab === 'messages') {
          const data = await api.getAdminMessages(token);
          setMessages(Array.isArray(data) ? data : []);
        } else if (activeTab === 'products') {
          await refetchProducts();
        }
      } catch (err: any) {
        console.error('Failed to load data:', err);
        if (err?.status === 401 || err?.status === 403) {
          toast.error('Session expired. Please log in again.', { id: 'session-expired' });
          localStorage.removeItem('admin_token');
          sessionStorage.removeItem('sereneleaf_token');
          localStorage.removeItem('admin_user');
          navigate('/admin/login');
        } else {
          toast.error(api.getApiErrorMessage(err), { id: 'load-error' });
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeTab, token, navigate, refetchProducts]);

  const handleLogout = async () => {
    try {
      if (token) await api.adminLogout(token);
    } catch {}
    localStorage.removeItem('admin_token');
    sessionStorage.removeItem('sereneleaf_token');
    localStorage.removeItem('admin_user');
    toast.success('Logged out', { id: 'logout' });
    navigate('/admin/login');
  };

  const PAID_STATUSES = ['paid', 'shipped', 'delivered'];

const refreshAllData = async () => {
  if (!token) return;
  try {
    const [statsData, ordersData] = await Promise.all([
      api.getDashboardStats(token),
      api.getAllOrders(token),
    ]);

    // Calculate revenue from PAID orders only
    const paidOrders = (ordersData || []).filter((o: any) =>
      PAID_STATUSES.includes(o.status)
    );
    const paidRevenue = paidOrders.reduce(
      (sum: number, o: any) => sum + Number(o.total || 0),
      0
    );

    setStats({
      ...statsData,
      total_revenue: paidRevenue,
      paid_orders_count: paidOrders.length,
    });
    setOrders(Array.isArray(ordersData) ? ordersData : []);
  } catch (err) {
    console.error('Failed to refresh:', err);
  }
};

const handleStatusChange = async (orderId: string, newStatus: string) => {
  if (!token) return;
  try {
    await api.updateOrderStatus(token, orderId, newStatus);
    toast.success('Status updated', { id: `status-${orderId}` });
    // Auto-refresh all data after status change
    await refreshAllData();
  } catch (err) {
    toast.error(api.getApiErrorMessage(err), { id: `status-err-${orderId}` });
  }
};

  const handleMessageRead = async (id: number) => {
    if (!token) return;
    try {
      await api.updateMessageStatus(token, id, { is_read: true });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: true } : m))
      );
    } catch (err) {
      toast.error(api.getApiErrorMessage(err), { id: `msg-err-${id}` });
    }
  };

  // ===== Product CRUD =====
  const handleToggleStock = async (productId: string) => {
    try {
      await toggleStock(productId);
      toast.success('Stock updated', { id: `stock-${productId}` });
    } catch (err) {
      toast.error(api.getApiErrorMessage(err), { id: `stock-err-${productId}` });
    }
  };

  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(productId);
      toast.success('Product deleted', { id: `delete-${productId}` });
    } catch (err) {
      toast.error(api.getApiErrorMessage(err), { id: `delete-err-${productId}` });
    }
  };

  const handleSaveProduct = async (data: any, isNew: boolean) => {
    try {
      if (isNew) {
        await addProduct({
          id: data.slug,
          name: data.name,
          category: data.category,
          price: Number(data.price),
          description: data.description,
          image: data.image,
          origin: data.origin || '',
          weight: data.weight || '',
          badge: data.badge || undefined,
          inStock: data.in_stock,
          rating: 4.5,
          reviews: 0,
        });
        toast.success('Product added — visible on website', {
          id: `add-${data.slug}`,
        });
        setShowAddForm(false);
      } else {
        await updateProduct(data.id, {
          name: data.name,
          price: Number(data.price),
          description: data.description,
          image: data.image,
          origin: data.origin || '',
          weight: data.weight || '',
          badge: data.badge || undefined,
          inStock: data.in_stock,
          category: data.category,
        });
        toast.success('Product updated — changes live on website', {
          id: `update-${data.id}`,
        });
        setEditingProduct(null);
      }
    } catch (err) {
      toast.error(api.getApiErrorMessage(err), { id: 'save-err' });
    }
  };

  if (!authChecked || !token) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-tea-500">Checking authentication...</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-tea-900">
              Admin Dashboard
            </h1>
            <p className="text-tea-500 text-sm">Serene Leaf Tea House</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-tea-900 text-white rounded-lg hover:bg-tea-800 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-xl p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-matcha-600 text-white shadow'
                  : 'text-tea-700 hover:bg-tea-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-tea-500">Loading...</div>
        ) : (
          <>
            {/* DASHBOARD */}
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={IndianRupee}
                    label="Revenue"
                    value={`₹${Number(stats.total_revenue).toLocaleString()}`}
                    color="bg-green-50 text-green-600"
                  />
                  <StatCard
                    icon={ShoppingBag}
                    label="Total Orders"
                    value={stats.total_orders}
                    color="bg-blue-50 text-blue-600"
                  />
                  <StatCard
                    icon={Users}
                    label="Customers"
                    value={stats.total_customers}
                    color="bg-purple-50 text-purple-600"
                  />
                  <StatCard
                    icon={Package}
                    label="Products"
                    value={stats.total_products}
                    color="bg-orange-50 text-orange-600"
                  />
                  <StatCard
                    icon={Clock}
                    label="Pending Orders"
                    value={stats.pending_orders}
                    color="bg-yellow-50 text-yellow-600"
                  />
                  <StatCard
                    icon={Mail}
                    label="Unread Messages"
                    value={stats.unread_messages}
                    color="bg-red-50 text-red-600"
                  />
                </div>

                {stats.recent_orders?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-display text-lg font-bold text-tea-900 mb-4">
                      Recent Orders
                    </h3>
                    <OrdersTable
                      orders={stats.recent_orders}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ORDERS */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-display text-lg font-bold text-tea-900 mb-4">
                  All Orders ({orders.length})
                </h3>
                {orders.length === 0 ? (
                  <p className="text-tea-500 text-center py-8">No orders yet</p>
                ) : (
                  <OrdersTable
                    orders={orders}
                    onStatusChange={handleStatusChange}
                  />
                )}
              </div>
            )}

            {/* PRODUCTS */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-tea-900">
                      Products ({products.length})
                    </h3>
                    <p className="text-xs text-tea-500 mt-1">
                      ✨ Changes here appear instantly on the website
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-matcha-600 text-white rounded-lg hover:bg-matcha-700 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>

                {products.length === 0 ? (
                  <p className="text-tea-500 text-center py-8">No products</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-tea-500 border-b border-tea-100">
                          <th className="py-3 px-2">Image</th>
                          <th className="py-3 px-2">Name</th>
                          <th className="py-3 px-2">Category</th>
                          <th className="py-3 px-2">Price</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr
                            key={p.id}
                            className="border-b border-tea-50 hover:bg-tea-50/40"
                          >
                            <td className="py-3 px-2">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-12 h-12 rounded-lg object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://via.placeholder.com/48?text=?';
                                }}
                              />
                            </td>
                            <td className="py-3 px-2 font-medium text-tea-900">
                              {p.name}
                              <div className="text-tea-400 text-xs">
                                {p.id}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-tea-600 capitalize">
                              {p.category}
                            </td>
                            <td className="py-3 px-2 font-medium text-tea-900">
                              ₹{Number(p.price).toLocaleString()}
                            </td>
                            <td className="py-3 px-2">
                              <button
                                onClick={() => handleToggleStock(p.id)}
                                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                                  p.inStock
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                              >
                                {p.inStock ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingProduct(p)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Edit"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteProduct(p.id, p.name)
                                  }
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {editingProduct && (
                  <ProductFormModal
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onSave={(data) => handleSaveProduct(data, false)}
                    isNew={false}
                  />
                )}

                {showAddForm && (
                  <ProductFormModal
                    product={null}
                    onClose={() => setShowAddForm(false)}
                    onSave={(data) => handleSaveProduct(data, true)}
                    isNew={true}
                  />
                )}
              </div>
            )}

            {/* CUSTOMERS */}
            {activeTab === 'customers' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-display text-lg font-bold text-tea-900 mb-4">
                  Customers ({customers.length})
                </h3>
                {customers.length === 0 ? (
                  <p className="text-tea-500 text-center py-8">No customers</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-tea-500 border-b border-tea-100">
                          <th className="py-3 px-2">Name</th>
                          <th className="py-3 px-2">Email</th>
                          <th className="py-3 px-2">Phone</th>
                          <th className="py-3 px-2">Orders</th>
                          <th className="py-3 px-2">Total Spent</th>
                          <th className="py-3 px-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((c) => (
                          <tr
                            key={c.id}
                            className="border-b border-tea-50 hover:bg-tea-50/40"
                          >
                            <td className="py-3 px-2 font-medium text-tea-900">
                              {c.name}
                            </td>
                            <td className="py-3 px-2 text-tea-600">
                              {c.email}
                            </td>
                            <td className="py-3 px-2 text-tea-600">
                              {c.phone || '-'}
                            </td>
                            <td className="py-3 px-2 text-tea-600">
                              {c.orders_count}
                            </td>
                            <td className="py-3 px-2 font-medium text-tea-900">
                              ₹{Number(c.total_spent || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-2 text-tea-500">
                              {formatDate(c.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* MESSAGES */}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-display text-lg font-bold text-tea-900 mb-4">
                  Contact Messages ({messages.length})
                </h3>
                {messages.length === 0 ? (
                  <p className="text-tea-500 text-center py-8">No messages</p>
                ) : (
                  <div className="space-y-4">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`border rounded-xl p-5 transition-all ${
                          m.is_read
                            ? 'border-tea-100 bg-white'
                            : 'border-matcha-200 bg-matcha-50/40'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-tea-900">
                              {m.name}
                              {!m.is_read && (
                                <span className="ml-2 px-2 py-0.5 bg-matcha-600 text-white text-[10px] rounded-full uppercase">
                                  New
                                </span>
                              )}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-tea-500 mt-1 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {m.email}
                              </span>
                              {m.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {m.phone}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(m.created_at)}
                              </span>
                            </div>
                          </div>
                          {!m.is_read && (
                            <button
                              onClick={() => handleMessageRead(m.id)}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-matcha-600 text-white rounded-lg hover:bg-matcha-700"
                            >
                              <CheckCircle className="w-3 h-3" /> Mark Read
                            </button>
                          )}
                        </div>
                        {m.subject && (
                          <p className="font-medium text-tea-800 mb-2">
                            {m.subject}
                          </p>
                        )}
                        <p className="text-tea-600 text-sm whitespace-pre-line">
                          {m.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ===== Product Form Modal =====

function ProductFormModal({
  product,
  onClose,
  onSave,
  isNew,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (data: any) => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState({
    id: product?.id || '',
    name: product?.name || '',
    slug: product?.id || '',
    category: product?.category || 'green',
    price: product?.price || '',
    description: product?.description || '',
    image: product?.image || '',
    origin: product?.origin || '',
    weight: product?.weight || '',
    badge: product?.badge || '',
    in_stock: product?.inStock ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error('Name and price are required', { id: 'form-validation' });
      return;
    }
    if (isNew && (!form.slug || !form.image)) {
      toast.error('Slug and image are required', { id: 'form-validation' });
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between p-5 border-b border-tea-100">
          <h3 className="font-display text-xl font-bold text-tea-900">
            {isNew ? 'Add Product' : `Edit: ${product?.name}`}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-tea-50 rounded-lg"
          >
            <X className="w-5 h-5 text-tea-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {form.image && (
            <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={form.image}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name *">
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Slug (URL ID) *">
              <input
                type="text"
                required
                disabled={!isNew}
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g. green-tea-special"
                className="input disabled:bg-tea-50"
              />
            </Field>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="input"
              >
                <option value="green">Green</option>
                <option value="black">Black</option>
                <option value="white">White</option>
                <option value="oolong">Oolong</option>
                <option value="herbal">Herbal</option>
                <option value="matcha">Matcha</option>
                <option value="specialty">Specialty</option>
              </select>
            </Field>
            <Field label="Price (₹) *">
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Origin">
              <input
                type="text"
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                placeholder="e.g. Darjeeling, India"
                className="input"
              />
            </Field>
            <Field label="Weight">
              <input
                type="text"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                placeholder="e.g. 100g"
                className="input"
              />
            </Field>
            <Field label="Badge (optional)">
              <input
                type="text"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="Popular, New, Best Seller"
                className="input"
              />
            </Field>
          </div>

          <Field label="Image URL *">
            <input
              type="url"
              required={isNew}
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://..."
              className="input"
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="input resize-none"
            />
          </Field>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.in_stock}
                onChange={(e) =>
                  setForm({ ...form, in_stock: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-tea-700">In Stock</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-tea-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-tea-700 hover:bg-tea-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-matcha-600 text-white rounded-lg hover:bg-matcha-700"
            >
              <Save className="w-4 h-4" />
              {isNew ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #1f2937;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: #2d6e30;
          box-shadow: 0 0 0 2px rgba(45, 110, 48, 0.1);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-tea-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: any;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-tea-500 text-xs uppercase tracking-wide">{label}</p>
      <p className="font-display text-2xl font-bold text-tea-900 mt-1">
        {value}
      </p>
    </div>
  );
}

function OrdersTable({
  orders,
  onStatusChange,
}: {
  orders: any[];
  onStatusChange: (id: string, status: string) => void;
}) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-tea-500 border-b border-tea-100">
            <th className="py-3 px-2">Order ID</th>
            <th className="py-3 px-2">Customer</th>
            <th className="py-3 px-2">Items</th>
            <th className="py-3 px-2">Total</th>
            <th className="py-3 px-2">Status</th>
            <th className="py-3 px-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              className="border-b border-tea-50 hover:bg-tea-50/40"
            >
              <td className="py-3 px-2 font-mono text-xs text-tea-700">
                {o.id}
              </td>
              <td className="py-3 px-2">
                <div className="font-medium text-tea-900">
                  {o.customer_name}
                </div>
                <div className="text-tea-500 text-xs">{o.customer_email}</div>
              </td>
              <td className="py-3 px-2 text-tea-600">{o.items_count}</td>
              <td className="py-3 px-2 font-medium text-tea-900">
                ₹{Number(o.total).toLocaleString()}
              </td>
              <td className="py-3 px-2">
                <select
                  value={o.status}
                  onChange={(e) => onStatusChange(o.id, e.target.value)}
                  className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${
                    statusColors[o.status] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td className="py-3 px-2 text-tea-500 text-xs">
                {formatDate(o.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}