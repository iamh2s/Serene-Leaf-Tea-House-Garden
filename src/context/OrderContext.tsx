import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { CartItem, Order } from '../types';
import * as api from '../services/api';

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (
    items: CartItem[],
    total: number,
    customerName: string,
    customerEmail: string,
    paymentId?: string
  ) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  refetch: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

function mapApi(o: api.ApiOrder): Order {
  return {
    id: String(o.id),
    items: [],
    total: Number(o.total),
    status: o.status as Order['status'],
    date: o.created_at?.split('T')[0] || '',
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    paymentId: o.razorpay_payment_id || undefined,
  };
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    const token =
      sessionStorage.getItem('sereneleaf_token') ||
      localStorage.getItem('admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getOrders(token);
      const list = Array.isArray(data) ? data : (data as any).results ?? [];
      setOrders(list.map(mapApi));
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // IMPORTANT: addOrder only updates LOCAL state.
  // The actual backend order is created in CheckoutPage via api.createOrder.
  const addOrder = useCallback(
    (
      items: CartItem[],
      total: number,
      customerName: string,
      customerEmail: string,
      paymentId?: string
    ): Order => {
      const newOrder: Order = {
        id: `LOCAL-${Date.now()}`,
        items,
        total,
        status: paymentId ? 'paid' : 'pending',
        date: new Date().toISOString().split('T')[0],
        customerName,
        customerEmail,
        paymentId,
      };
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    },
    []
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: Order['status']) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      try {
        await api.patchOrderStatus(orderId, status);
      } catch (err) {
        console.error('Failed to update status:', err);
        fetchOrders();
      }
    },
    [fetchOrders]
  );

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        addOrder,
        updateOrderStatus,
        refetch: fetchOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
}