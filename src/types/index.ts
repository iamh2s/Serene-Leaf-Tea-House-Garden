export interface Product {
  id: string;
  name: string;
  category: 'green' | 'black' | 'herbal' | 'specialty' | 'oolong' | 'white';
  price: number;
  description: string;
  image: string;
  origin: string;
  badge?: string;
  weight: string;
  inStock: boolean;
  rating: number;
  reviews: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered';
  date: string;
  customerName: string;
  customerEmail: string;
  paymentId?: string;
}
