import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn } from 'lucide-react';
import * as api from '../services/api';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await api.adminLogin(form);

      // Save token in BOTH places so contexts and admin dashboard both work
      localStorage.setItem('admin_token', res.token);
      sessionStorage.setItem('sereneleaf_token', res.token);
      localStorage.setItem('admin_user', JSON.stringify(res.user));

      toast.success(`Welcome back, ${res.user.username}!`);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      toast.error(api.getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tea-900 flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-matcha-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-matcha-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-tea-900">
              Admin Login
            </h1>
            <p className="text-tea-500 text-sm mt-1">Serene Leaf Tea House</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-tea-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tea-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-tea-200 bg-tea-50/50 focus:outline-none focus:ring-2 focus:ring-matcha-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-tea-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tea-400" />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-tea-200 bg-tea-50/50 focus:outline-none focus:ring-2 focus:ring-matcha-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-matcha-600 text-white font-medium rounded-xl hover:bg-matcha-700 transition-all shadow-lg shadow-matcha-600/25 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-tea-500">
            <p>Username: admin@sereneleaf.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}