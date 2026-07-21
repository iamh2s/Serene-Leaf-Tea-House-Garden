const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api';

// ========== TYPES ==========

export type ApiProduct = {
  id: string | number;
  slug: string;
  name: string;
  category: string;
  category_name?: string;
  price: number | string;
  description: string;
  short_description?: string;
  image: string;
  origin: string;
  weight: string;
  badge?: string;
  in_stock: boolean;
  stock_quantity?: number;
  rating: number | string;
  reviews_count: number;
  is_featured?: boolean;
};

export type ApiOrderItem = {
  id?: number;
  product_id?: string;
  product_name?: string;
  product_price?: string | number;
  product_image?: string;
  quantity: number;
  subtotal?: string | number;
};

export type ApiOrder = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  subtotal?: string | number;
  shipping_cost?: string | number;
  total: string | number;
  status: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  items?: ApiOrderItem[];
  items_count?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type ApiMessage = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  is_read: boolean;
  is_closed: boolean;
  admin_note?: string;
  created_at?: string;
};

export type CreateOrderItem = {
  product_id?: string;
  product?: string;
  quantity: number;
  price?: number;
};

export type CreateOrderPayload = {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  total?: number;
  status?: string;
  razorpay_payment_id?: string;
  items: CreateOrderItem[];
};

export type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
  key_id: string;
};

export type VerifyPaymentPayload = {
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type ContactMessagePayload = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

export type ReviewPayload = {
  product: string;
  customer_name: string;
  rating: number;
  comment: string;
};

export type AdminLoginPayload = {
  email: string;
  password: string;
};

export type AdminUser = {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
};

export type AdminLoginResponse = {
  token: string;
  user: AdminUser;
};

// ========== HELPERS ==========

function getAuthToken(): string | null {
  return (
    sessionStorage.getItem('sereneleaf_token') ||
    localStorage.getItem('admin_token')
  );
}

function authHeaders(token?: string) {
  const t = token || getAuthToken();
  return t ? { Authorization: `Token ${t}` } : {};
}

function normalizeList(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

// ========== CORE FETCH ==========

async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err: any = new Error(
      typeof data === 'string' ? data : JSON.stringify(data)
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

// ========== ERROR HELPER ==========

export function getApiErrorMessage(error: unknown): string {
  const err = error as any;

  if (err?.data) {
    if (typeof err.data === 'string') return err.data;
    if (err.data.detail) return err.data.detail;
    if (err.data.message) return err.data.message;
    if (err.data.error) return err.data.error;

    const messages: string[] = [];
    for (const key of Object.keys(err.data)) {
      const value = err.data[key];
      if (Array.isArray(value)) {
        messages.push(`${key}: ${value.join(', ')}`);
      } else if (typeof value === 'string') {
        messages.push(`${key}: ${value}`);
      }
    }
    if (messages.length > 0) return messages.join(' | ');
  }

  if (err?.message) return err.message;
  return 'Something went wrong';
}

// ========== PRODUCTS ==========

export async function getProducts(): Promise<ApiProduct[]> {
  try {
    const data = await api<any>('/products/');
    return normalizeList(data);
  } catch (err) {
    console.warn('Could not fetch products:', err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<ApiProduct | null> {
  try {
    return await api<ApiProduct>(`/products/${slug}/`);
  } catch {
    return null;
  }
}

export async function getFeaturedProducts(): Promise<ApiProduct[]> {
  try {
    const data = await api<any>('/products/featured/');
    return normalizeList(data);
  } catch {
    return [];
  }
}

export async function createProduct(payload: any): Promise<ApiProduct> {
  return api('/products/', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function patchProduct(slug: string, body: any): Promise<ApiProduct> {
  return api(`/products/${slug}/`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
}

export async function deleteProduct(slug: string): Promise<void> {
  await api(`/products/${slug}/`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function toggleStock(slug: string): Promise<ApiProduct> {
  return api(`/products/${slug}/toggle_stock/`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

// ========== CATEGORIES ==========

export async function getCategories(): Promise<any[]> {
  try {
    const data = await api<any>('/categories/');
    return normalizeList(data);
  } catch {
    return [];
  }
}

// ========== ORDERS ==========

export async function createOrder(
  payload: CreateOrderPayload
): Promise<ApiOrder> {
  return api<ApiOrder>('/orders/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getOrders(token?: string): Promise<ApiOrder[]> {
  const t = token || getAuthToken();
  if (!t) return [];
  try {
    const data = await api<any>('/orders/', {
      headers: authHeaders(t),
    });
    return normalizeList(data);
  } catch (err) {
    console.warn('Could not fetch orders:', err);
    return [];
  }
}

export async function patchOrderStatus(
  orderId: string,
  newStatus: string
): Promise<any> {
  return api(`/orders/${orderId}/update_status/`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status: newStatus }),
  });
}

// alias for admin dashboard
export const updateOrderStatus = (
  token: string,
  orderId: string,
  status: string
) =>
  api(`/orders/${orderId}/update_status/`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });

// ========== RAZORPAY ==========

export async function createRzpOrder(
  amount: number
): Promise<RazorpayOrderResponse> {
  return api<RazorpayOrderResponse>('/payment/create-order/', {
    method: 'POST',
    body: JSON.stringify({
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    }),
  });
}

export async function verifyPayment(
  payload: VerifyPaymentPayload
): Promise<any> {
  return api('/payment/verify/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ========== CONTACT MESSAGES ==========

export async function postContact(
  payload: ContactMessagePayload
): Promise<ApiMessage> {
  return api<ApiMessage>('/contact/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Alias used by ContactPage
export const sendContactMessage = postContact;

export async function getMessages(token?: string): Promise<ApiMessage[]> {
  const t = token || getAuthToken();
  if (!t) return [];
  try {
    const data = await api<any>('/admin/messages/', {
      headers: authHeaders(t),
    });
    return normalizeList(data);
  } catch (err) {
    console.warn('Could not fetch messages:', err);
    return [];
  }
}

export async function patchMessage(
  messageId: number,
  updates: { is_read?: boolean; is_closed?: boolean; admin_note?: string }
): Promise<any> {
  return api(`/admin/messages/${messageId}/`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
}

// alias
export const updateMessageStatus = (
  token: string,
  messageId: number,
  updates: { is_read?: boolean; is_closed?: boolean; admin_note?: string }
) =>
  api(`/admin/messages/${messageId}/`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(updates),
  });

// ========== REVIEWS ==========

export async function getReviews(productSlug?: string): Promise<any[]> {
  try {
    const endpoint = productSlug
      ? `/reviews/?product=${encodeURIComponent(productSlug)}`
      : '/reviews/';
    const data = await api<any>(endpoint);
    return normalizeList(data);
  } catch (err) {
    console.warn('Could not fetch reviews:', err);
    return [];
  }
}

export async function createReview(payload: ReviewPayload): Promise<any> {
  return api('/reviews/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ========== ADMIN AUTH ==========

export async function adminLogin(
  payload: AdminLoginPayload
): Promise<AdminLoginResponse> {
  return api('/admin/login/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminLogout(token?: string): Promise<any> {
  return api('/admin/logout/', {
    method: 'POST',
    headers: authHeaders(token),
  });
}

// ========== ADMIN DASHBOARD ==========

export async function getDashboardStats(token?: string): Promise<any> {
  return api('/admin/dashboard/', {
    method: 'GET',
    headers: authHeaders(token),
  });
}

export async function getCustomers(token?: string): Promise<any[]> {
  try {
    const data = await api<any>('/admin/customers/', {
      method: 'GET',
      headers: authHeaders(token),
    });
    return normalizeList(data);
  } catch {
    return [];
  }
}

export async function getAdminMessages(token?: string): Promise<ApiMessage[]> {
  return getMessages(token);
}

export async function getAllOrders(token?: string): Promise<ApiOrder[]> {
  return getOrders(token);
}