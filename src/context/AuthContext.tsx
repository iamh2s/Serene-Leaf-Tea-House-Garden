import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import * as api from '../services/api';

interface AuthContextType {
  isAdmin: boolean;
  token: string | null;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken]   = useState<string | null>(() => sessionStorage.getItem('sereneleaf_token'));
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('sereneleaf_admin') === 'true');

  const adminLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.loginAdmin(email, password);
      setToken(res.token);
      setIsAdmin(true);
      sessionStorage.setItem('sereneleaf_token', res.token);
      sessionStorage.setItem('sereneleaf_admin', 'true');
      return true;
    } catch {
      return false;
    }
  }, []);

  const adminLogout = useCallback(async () => {
    try { await api.logoutAdmin(); } catch { /* ok */ }
    setIsAdmin(false);
    setToken(null);
    sessionStorage.removeItem('sereneleaf_token');
    sessionStorage.removeItem('sereneleaf_admin');
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin, token, adminLogin, adminLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}