import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Send, Quote } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useProducts } from '../context/ProductContext';
import * as api from '../services/api';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  customerName: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
}

const initialReviews: Review[] = [
  {
    id: 'r1', customerName: 'Sarah Chen', productId: 'imperial-matcha',
    productName: 'Imperial Matcha', rating: 5,
    comment: 'This matcha is unlike anything I\'ve ever tasted. Pure, vibrant, and utterly delightful. The ceremonial grade quality really shows — smooth with zero bitterness. I make it every single morning now!',
    date: '2025-06-10',
  },
  {
    id: 'r2', customerName: 'James Whitfield', productId: 'earl-grey-supreme',
    productName: 'Earl Grey Supreme', rating: 5,
    comment: 'The bergamot aroma is heavenly. I\'ve tried dozens of Earl Grey teas and this one beats them all. The cornflower petals add a beautiful touch. Perfect afternoon tea.',
    date: '2025-06-09',
  },
  {
    id: 'r3', customerName: 'Amara Okafor', productId: 'chamomile-dreams',
    productName: 'Chamomile Dreams', rating: 5,
    comment: 'I struggle with sleep and this tea has become my nightly ritual. The lavender and chamomile blend is so calming. I actually look forward to bedtime now!',
    date: '2025-06-08',
  },
  {
    id: 'r4', customerName: 'David Park', productId: 'jasmine-pearl',
    productName: 'Jasmine Pearl', rating: 4,
    comment: 'Watching these pearls unfurl in hot water is mesmerising. The jasmine scent fills the entire room. Great quality, but I wish the packet was a bit larger for the price.',
    date: '2025-06-07',
  },
  {
    id: 'r5', customerName: 'Elena Rossi', productId: 'iced-matcha-latte',
    productName: 'Iced Matcha Latte Kit', rating: 5,
    comment: 'This kit is genius! The bamboo whisk makes all the difference. I\'ve been making café-quality matcha lattes at home and saving so much money. The recipe card is a nice touch.',
    date: '2025-06-06',
  },
  {
    id: 'r6', customerName: 'Priya Sharma', productId: 'golden-assam',
    productName: 'Golden Assam', rating: 5,
    comment: 'Bold, malty, and full-bodied — exactly how I like my morning chai. This Assam tea stands up beautifully to milk and sugar. Reminds me of my grandmother\'s tea. Absolutely love it.',
    date: '2025-06-05',
  },
  {
    id: 'r7', customerName: 'Liam O\'Brien', productId: 'iron-goddess-oolong',
    productName: 'Iron Goddess Oolong', rating: 5,
    comment: 'I got 6 infusions out of one serving and each one tasted different! The orchid notes are beautiful. This is now my go-to for afternoon tea meditation sessions.',
    date: '2025-06-03',
  },
  {
    id: 'r8', customerName: 'Mei Lin', productId: 'silver-needle-white',
    productName: 'Silver Needle White Tea', rating: 5,
    comment: 'The most delicate and refined tea I\'ve ever had. You can taste the craft that went into this. The sweet, honeyed finish is incredible. Worth every penny.',
    date: '2025-06-01',
  },
];

export default function ReviewsPage() {
  const { products } = useProducts();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterRating, setFilterRating] = useState(0);
  const [form, setForm] = useState({ name: '', productId: '', rating: 5, comment: '' });
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();

  // Fetch reviews from backend on mount
  useEffect(() => {
    api.getReviews().then((data) => {
      const list = Array.isArray(data) ? data : [];
      if (list.length > 0) {
        setReviews(list.map((r) => ({
          id: String(r.id), customerName: r.customer_name,
          productId: r.product_slug || String(r.product),
          productName: r.product_name || '', rating: r.rating,
          comment: r.comment, date: r.created_at?.split('T')[0] || '',
        })));
      }
    }).catch(() => { /* use local data */ });
  }, []);

  const filteredReviews = reviews.filter((r) => {
    if (filterProduct !== 'all' && r.productId !== filterProduct) return false;
    if (filterRating > 0 && r.rating !== filterRating) return false;
    return true;
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: reviews.filter((rv) => rv.rating === r).length,
    pct: reviews.length ? Math.round((reviews.filter((rv) => rv.rating === r).length / reviews.length) * 100) : 0,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.productId || !form.comment) {
      toast.error('Please fill all fields');
      return;
    }
    const product = products.find((p) => p.id === form.productId);
    const newReview: Review = {
      id: `r-${Date.now()}`,
      customerName: form.name,
      productId: form.productId,
      productName: product?.name || '',
      rating: form.rating,
      comment: form.comment,
      date: new Date().toISOString().split('T')[0],
    };
    setReviews((prev) => [newReview, ...prev]);
    setForm({ name: '', productId: '', rating: 5, comment: '' });
    setShowForm(false);
    toast.success('Thank you for your review! 🍵');
    // Post to backend
    api.postReview({ product: form.productId, customer_name: form.name, rating: form.rating, comment: form.comment }).catch(() => {});
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-tea-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img src="https://images.pexels.com/photos/7037467/pexels-photo-7037467.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=1920" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <p className="text-matcha-400 uppercase tracking-[0.3em] text-sm font-medium mb-4">What Our Customers Say</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">Customer Reviews</h1>
          <p className="text-tea-200/70 text-lg max-w-xl mx-auto">Real experiences from our tea-loving community.</p>
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats + CTA */}
          <div ref={headerRef} className={`grid md:grid-cols-3 gap-6 mb-12 transition-all duration-800 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Rating summary */}
            <div className="md:col-span-1 bg-white rounded-2xl shadow-sm p-8 text-center">
              <p className="font-display text-6xl font-bold text-tea-900">{avgRating}</p>
              <div className="flex justify-center gap-1 mt-2 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(avgRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-tea-200'}`} />
                ))}
              </div>
              <p className="text-tea-500 text-sm">{reviews.length} reviews</p>
              <button onClick={() => setShowForm(!showForm)}
                className="mt-6 w-full px-5 py-2.5 bg-matcha-600 text-white font-medium text-sm rounded-full hover:bg-matcha-700 transition-colors">
                Write a Review
              </button>
            </div>

            {/* Rating bars */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-8">
              <h3 className="font-display text-lg font-semibold text-tea-900 mb-4">Rating Breakdown</h3>
              <div className="space-y-3">
                {ratingCounts.map((r) => (
                  <button key={r.star} onClick={() => setFilterRating(filterRating === r.star ? 0 : r.star)}
                    className={`flex items-center gap-3 w-full group ${filterRating === r.star ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}>
                    <span className="text-sm font-medium text-tea-700 w-12 flex items-center gap-1">{r.star} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /></span>
                    <div className="flex-1 h-3 bg-tea-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${filterRating === r.star ? 'bg-matcha-500' : 'bg-yellow-400'}`} style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="text-sm text-tea-500 w-8 text-right">{r.count}</span>
                  </button>
                ))}
              </div>
              {filterRating > 0 && (
                <button onClick={() => setFilterRating(0)} className="mt-3 text-xs text-matcha-600 hover:underline">Clear rating filter</button>
              )}
            </div>
          </div>

          {/* Write Review Form */}
          {showForm && (
            <div className="mb-10 bg-white rounded-2xl shadow-md p-6 md:p-8 animate-fade-in-up">
              <h3 className="font-display text-xl font-bold text-tea-900 mb-6">Write Your Review</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-tea-700 mb-1.5">Your Name *</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl border border-tea-200 bg-tea-50/50 text-tea-900 placeholder:text-tea-400 focus:outline-none focus:ring-2 focus:ring-matcha-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-tea-700 mb-1.5">Product *</label>
                    <select required value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-tea-200 bg-tea-50/50 text-tea-900 focus:outline-none focus:ring-2 focus:ring-matcha-500">
                      <option value="">Select a tea...</option>
                      {products.filter((p) => p.inStock).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-tea-700 mb-1.5">Rating *</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })}>
                        <Star className={`w-8 h-8 transition-colors ${s <= form.rating ? 'fill-yellow-400 text-yellow-400' : 'text-tea-200 hover:text-yellow-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-tea-700 mb-1.5">Your Review *</label>
                  <textarea rows={4} required value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    placeholder="Share your experience with this tea..."
                    className="w-full px-4 py-3 rounded-xl border border-tea-200 bg-tea-50/50 text-tea-900 placeholder:text-tea-400 focus:outline-none focus:ring-2 focus:ring-matcha-500 focus:border-transparent resize-none" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-matcha-600 text-white font-medium rounded-xl hover:bg-matcha-700 transition-colors">
                    <Send className="w-4 h-4" /> Submit Review
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border border-tea-200 text-tea-600 rounded-xl hover:bg-tea-50 transition-colors">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Product filter */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <span className="text-tea-600 text-sm font-medium">Filter by product:</span>
            <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)}
              className="px-4 py-2 rounded-lg border border-tea-200 bg-white text-tea-700 text-sm focus:outline-none focus:ring-2 focus:ring-matcha-500">
              <option value="all">All Products</option>
              {[...new Set(reviews.map((r) => r.productId))].map((pid) => {
                const p = products.find((pr) => pr.id === pid);
                return <option key={pid} value={pid}>{p?.name || pid}</option>;
              })}
            </select>
            {filterProduct !== 'all' && (
              <button onClick={() => setFilterProduct('all')} className="text-xs text-matcha-600 hover:underline">Clear</button>
            )}
            <span className="ml-auto text-tea-400 text-sm">{filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Reviews list */}
          <div className="space-y-6">
            {filteredReviews.map((review) => {
              const product = products.find((p) => p.id === review.productId);
              return (
                <div key={review.id} className="bg-white rounded-2xl shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <Quote className="w-8 h-8 text-matcha-200 shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div>
                          <p className="font-display text-lg font-semibold text-tea-900">{review.customerName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-tea-200'}`} />
                              ))}
                            </div>
                            <span className="text-tea-400 text-xs">· {review.date}</span>
                          </div>
                        </div>
                        {product && (
                          <Link to={`/products/${product.id}`} className="flex items-center gap-2 px-3 py-1.5 bg-tea-50 rounded-full hover:bg-tea-100 transition-colors">
                            <img src={product.image} alt="" className="w-6 h-6 rounded-full object-cover" />
                            <span className="text-tea-700 text-xs font-medium">{product.name}</span>
                          </Link>
                        )}
                      </div>
                      <p className="text-tea-700 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredReviews.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🍵</p>
                <p className="text-tea-500 font-medium">No reviews match your filter.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
