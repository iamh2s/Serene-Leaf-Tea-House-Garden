import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Search, Star, ShoppingCart, Filter } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

type Category = 'all' | 'green' | 'black' | 'herbal' | 'specialty' | 'oolong' | 'white';

const categories: { label: string; value: Category }[] = [
  { label: 'All Teas', value: 'all' },
  { label: 'Green Tea', value: 'green' },
  { label: 'Black Tea', value: 'black' },
  { label: 'Herbal', value: 'herbal' },
  { label: 'Oolong', value: 'oolong' },
  { label: 'White Tea', value: 'white' },
  { label: 'Specialty', value: 'specialty' },
];

type SortOption = 'default' | 'price-low' | 'price-high' | 'rating' | 'name';

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('default');
  const { addToCart } = useCart();
  const { products } = useProducts();
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();

  let filtered = activeCategory === 'all' ? [...products] : products.filter((p) => p.category === activeCategory);

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.origin.toLowerCase().includes(q)
    );
  }

  switch (sort) {
    case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
    case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
    case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
    case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
  }

  // Sort so that in-stock items appear first
  filtered.sort((a, b) => (a.inStock === b.inStock ? 0 : a.inStock ? -1 : 1));

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-16 md:py-20 bg-tea-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.pexels.com/photos/9025660/pexels-photo-9025660.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=1920"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <p className="text-matcha-400 uppercase tracking-[0.3em] text-sm font-medium mb-4">Our Collection</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
            Premium Artisan Teas
          </h1>
          <p className="text-tea-200/70 text-lg max-w-xl mx-auto">
            Explore our hand-selected collection from the world's finest tea gardens.
          </p>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-8 bg-cream border-b border-tea-200 sticky top-20 z-40 backdrop-blur-md bg-cream/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tea-400" />
              <input
                type="text"
                placeholder="Search teas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-tea-200 bg-white text-tea-900 text-sm placeholder:text-tea-400 focus:outline-none focus:ring-2 focus:ring-matcha-500 focus:border-transparent"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 flex-1 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    activeCategory === cat.value
                      ? 'bg-matcha-600 text-white shadow-md'
                      : 'bg-white text-tea-700 border border-tea-200 hover:border-matcha-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-tea-500" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="py-2 px-3 rounded-lg border border-tea-200 bg-white text-tea-700 text-sm focus:outline-none focus:ring-2 focus:ring-matcha-500"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">A to Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 bg-warm-white min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p ref={headerRef} className={`text-tea-500 text-sm mb-6 transition-all duration-500 ${headerVisible ? 'opacity-100' : 'opacity-0'}`}>
            Showing {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🍵</p>
              <h3 className="font-display text-2xl text-tea-800 mb-2">No teas found</h3>
              <p className="text-tea-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((tea) => (
                <div
                  key={tea.id}
                  className={`group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${
                    !tea.inStock ? 'opacity-75' : ''
                  }`}
                >
                  <Link to={`/products/${tea.id}`} className="block relative h-56 overflow-hidden">
                    <img src={tea.image} alt={tea.name} className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${!tea.inStock ? 'grayscale' : ''}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-tea-950/40 to-transparent" />
                    {!tea.inStock && (
                      <div className="absolute inset-0 bg-tea-950/50 flex items-center justify-center">
                        <span className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-full shadow-lg">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    {tea.inStock && tea.badge && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-matcha-600 text-white text-xs font-medium rounded-full">{tea.badge}</span>
                    )}
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-tea-700 text-xs font-medium rounded-full">
                      📍 {tea.origin}
                    </span>
                  </Link>
                  <div className="p-5">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(tea.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-tea-200'}`} />
                      ))}
                      <span className="text-tea-400 text-xs ml-1">{tea.rating} ({tea.reviews})</span>
                    </div>
                    <Link to={`/products/${tea.id}`}>
                      <h3 className="font-display text-lg font-semibold text-tea-900 group-hover:text-matcha-700 transition-colors">{tea.name}</h3>
                    </Link>
                    <p className="text-tea-500 text-xs mt-1 mb-1">{tea.weight} · {tea.category.charAt(0).toUpperCase() + tea.category.slice(1)}</p>
                    <p className="text-tea-500 text-sm line-clamp-2">{tea.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className={`font-bold text-xl ${tea.inStock ? 'text-matcha-600' : 'text-tea-400 line-through'}`}>₹{tea.price}</span>
                      {tea.inStock ? (
                        <button
                          onClick={() => {
                            addToCart(tea);
                            toast.success(`${tea.name} added to cart!`);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-matcha-600 text-white text-sm font-medium rounded-full hover:bg-matcha-700 transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-gray-200 text-gray-500 text-sm font-medium rounded-full cursor-not-allowed">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
