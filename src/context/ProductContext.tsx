import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { Product } from '../types';
import { initialProducts } from '../data/products';
import * as api from '../services/api';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  toggleStock: (productId: string) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  refetch: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

function mapApi(p: any): Product {
  return {
    id: p.slug || String(p.id),
    name: p.name,
    category: p.category as Product['category'],
    price: Number(p.price),
    description: p.description || p.short_description || '',
    image: p.image,
    origin: p.origin || '',
    weight: p.weight || '',
    badge: p.badge || undefined,
    inStock: p.in_stock,
    rating: Number(p.rating) || 4.5,
    reviews: p.reviews_count || 0,
  };
}

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      const list = Array.isArray(data) ? data : (data as any).results ?? [];
      if (list.length > 0) {
        setProducts(list.map(mapApi));
      }
    } catch (err) {
      console.warn('Using local products:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleStock = useCallback(
    async (productId: string) => {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p))
      );
      try {
        await api.toggleStock(productId);
        await fetchProducts(); // sync with backend
      } catch (err) {
        console.error('Toggle stock failed:', err);
        await fetchProducts(); // rollback
      }
    },
    [fetchProducts]
  );

  const updateProduct = useCallback(
    async (productId: string, updates: Partial<Product>) => {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id !== productId ? p : { ...p, ...updates }))
      );
      try {
        const body: Record<string, unknown> = {};
        if (updates.name !== undefined) body.name = updates.name;
        if (updates.price !== undefined) body.price = updates.price;
        if (updates.description !== undefined) body.description = updates.description;
        if (updates.image !== undefined) body.image_url = updates.image;
        if (updates.origin !== undefined) body.origin = updates.origin;
        if (updates.weight !== undefined) body.weight = updates.weight;
        if (updates.badge !== undefined) body.badge = updates.badge || '';
        if (updates.inStock !== undefined) body.in_stock = updates.inStock;
        if (updates.category !== undefined) body.category_slug = updates.category;

        await api.patchProduct(productId, body);
        await fetchProducts(); // sync with backend
      } catch (err) {
        console.error('Update product failed:', err);
        await fetchProducts(); // rollback
        throw err;
      }
    },
    [fetchProducts]
  );

  const deleteProduct = useCallback(
    async (productId: string) => {
      // Optimistic update
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      try {
        await api.deleteProduct(productId);
      } catch (err) {
        console.error('Delete failed:', err);
        await fetchProducts(); // rollback
        throw err;
      }
    },
    [fetchProducts]
  );

  const addProduct = useCallback(
    async (product: Product) => {
      // Optimistic update
      setProducts((prev) => [product, ...prev]);
      try {
        await api.createProduct({
          name: product.name,
          slug: product.id,
          category_slug: product.category,
          price: product.price,
          description: product.description,
          short_description: '',
          image_url: product.image,
          origin: product.origin,
          weight: product.weight,
          badge: product.badge || '',
          in_stock: product.inStock,
          stock_quantity: 50,
          is_featured: false,
        });
        await fetchProducts(); // sync
      } catch (err) {
        console.error('Add product failed:', err);
        await fetchProducts(); // rollback
        throw err;
      }
    },
    [fetchProducts]
  );

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        toggleStock,
        updateProduct,
        deleteProduct,
        addProduct,
        refetch: fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
}