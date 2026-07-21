import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import * as api from '../services/api';

export interface ContactMessage {
  id: string; name: string; email: string; phone: string;
  subject: string; message: string; date: string;
  isRead: boolean; isClosed: boolean; adminNote: string;
}

interface MessageContextType {
  messages: ContactMessage[];
  loading: boolean;
  addMessage: (msg: Omit<ContactMessage, 'id' | 'date' | 'isRead' | 'isClosed' | 'adminNote'>) => Promise<void>;
  markAsRead: (id: string) => void;
  closeMessage: (id: string) => void;
  reopenMessage: (id: string) => void;
  addAdminNote: (id: string, note: string) => void;
  unreadCount: number;
  openCount: number;
  closedCount: number;
  refetch: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

function mapApi(m: api.ApiMessage): ContactMessage {
  return {
    id: String(m.id), name: m.name, email: m.email,
    phone: m.phone || '', subject: m.subject || '',
    message: m.message, date: m.created_at?.split('T')[0] || '',
    isRead: m.is_read, isClosed: m.is_closed, adminNote: m.admin_note || '',
  };
}

export function MessageProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    const token = sessionStorage.getItem('sereneleaf_token');
    if (!token) { setLoading(false); return; }
    try {
      setLoading(true);
      const data = await api.getMessages();
      const list = Array.isArray(data) ? data : (data as any).results ?? [];
      setMessages(list.map(mapApi));
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const addMessage = useCallback(async (
    msg: Omit<ContactMessage, 'id' | 'date' | 'isRead' | 'isClosed' | 'adminNote'>
  ) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(msg.email)) throw new Error('Please enter a valid email address.');
    const created = await api.postContact({
      name: msg.name, email: msg.email,
      phone: msg.phone, subject: msg.subject, message: msg.message,
    });
    setMessages(prev => [mapApi(created), ...prev]);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
    try { await api.patchMessage(Number(id), { is_read: true }); } catch { /* ok */ }
  }, []);

  const closeMessage = useCallback(async (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isClosed: true, isRead: true } : m));
    try { await api.patchMessage(Number(id), { is_closed: true, is_read: true }); } catch { /* ok */ }
  }, []);

  const reopenMessage = useCallback(async (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isClosed: false } : m));
    try { await api.patchMessage(Number(id), { is_closed: false }); } catch { /* ok */ }
  }, []);

  const addAdminNote = useCallback(async (id: string, note: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, adminNote: note, isRead: true } : m));
    try { await api.patchMessage(Number(id), { admin_note: note, is_read: true }); } catch { /* ok */ }
  }, []);

  const unreadCount = messages.filter(m => !m.isRead && !m.isClosed).length;
  const openCount   = messages.filter(m => !m.isClosed).length;
  const closedCount = messages.filter(m => m.isClosed).length;

  return (
    <MessageContext.Provider value={{
      messages, loading, addMessage, markAsRead, closeMessage,
      reopenMessage, addAdminNote, unreadCount, openCount, closedCount,
      refetch: fetchMessages,
    }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error('useMessages must be used within MessageProvider');
  return ctx;
}