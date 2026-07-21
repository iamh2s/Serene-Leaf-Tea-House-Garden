import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { ChevronDown, Leaf, Award, Heart, Star } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

function Hero() {
  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/5975983/pexels-photo-5975983.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1920"
          alt="Tea ceremony"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-tea-950/70 via-tea-950/50 to-tea-950/80" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-fade-in-up">
          <p className="text-matcha-300 uppercase tracking-[0.4em] text-sm md:text-base mb-6 font-medium">
            Established 2018
          </p>
        </div>
        <h1 className="animate-fade-in-up animation-delay-200">
          <span className="block font-display text-5xl md:text-7xl lg:text-8xl text-white font-bold leading-tight">
            Serene Leaf
          </span>
          <span className="block font-accent text-2xl md:text-3xl lg:text-4xl text-tea-200 mt-2 italic">
            Tea House & Garden
          </span>
        </h1>
        <p className="mt-8 text-lg md:text-xl text-tea-100/80 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400 font-light">
          Discover the art of tea in a sanctuary of calm. Premium leaves, time-honored traditions,
          and moments of pure tranquility — served in every cup.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-600">
          <Link
            to="/products"
            className="px-8 py-4 bg-matcha-600 text-white font-medium rounded-full hover:bg-matcha-700 transition-all duration-300 shadow-xl shadow-matcha-900/30 hover:shadow-matcha-900/50 hover:scale-105"
          >
            Shop Our Teas
          </Link>
          <Link
            to="/about"
            className="px-8 py-4 border-2 border-white/30 text-white font-medium rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300"
          >
            Our Story
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <button
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex flex-col items-center gap-2 text-white/60 hover:text-white/80 transition-colors"
        >
          <span className="text-xs uppercase tracking-[0.3em]">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}

function Features() {
  const { ref, isVisible } = useScrollReveal();
  const features = [
    { icon: Leaf, title: 'Organic Sourcing', text: 'Hand-picked from certified organic estates across Asia.' },
    { icon: Award, title: 'Master Blenders', text: 'Decades of experience crafting perfect blends.' },
    { icon: Heart, title: 'Mindful Experience', text: 'Every cup is an invitation to reconnect.' },
  ];

  return (
    <section id="features" className="py-20 bg-cream">
      <div ref={ref} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`text-center p-8 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="w-14 h-14 mx-auto rounded-xl bg-matcha-50 flex items-center justify-center mb-4">
                <f.icon className="w-7 h-7 text-matcha-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-tea-900 mb-2">{f.title}</h3>
              <p className="text-tea-600 text-sm">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const { ref, isVisible } = useScrollReveal();
  const { addToCart } = useCart();
  const { products } = useProducts();
  const featured = products.filter((p) => p.badge && p.inStock).slice(0, 4);

  return (
    <section className="py-24 bg-warm-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`text-center max-w-2xl mx-auto mb-14 transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-matcha-600 uppercase tracking-[0.3em] text-sm font-medium mb-4">Featured Collection</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-tea-900">
            Our <span className="text-matcha-600">Best Sellers</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-matcha-500 to-matcha-300 rounded-full mt-6 mx-auto" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((tea, i) => (
            <div
              key={tea.id}
              className={`group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <Link to={`/products/${tea.id}`} className="block relative h-52 overflow-hidden">
                <img src={tea.image} alt={tea.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-tea-950/40 to-transparent" />
                {tea.badge && (
                  <span className="absolute top-3 right-3 px-3 py-1 bg-matcha-600 text-white text-xs font-medium rounded-full">{tea.badge}</span>
                )}
              </Link>
              <div className="p-5">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className={`w-3.5 h-3.5 ${si < Math.floor(tea.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-tea-200'}`} />
                  ))}
                  <span className="text-tea-400 text-xs ml-1">({tea.reviews})</span>
                </div>
                <Link to={`/products/${tea.id}`}>
                  <h3 className="font-display text-lg font-semibold text-tea-900 group-hover:text-matcha-700 transition-colors">{tea.name}</h3>
                </Link>
                <p className="text-tea-500 text-xs mt-1">{tea.origin} · {tea.weight}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-matcha-600 font-bold text-lg">₹{tea.price}</span>
                  <button
                    onClick={() => {
                      addToCart(tea);
                      toast.success(`${tea.name} added to cart!`);
                    }}
                    className="px-4 py-2 bg-matcha-600 text-white text-sm font-medium rounded-full hover:bg-matcha-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex px-8 py-3 border-2 border-matcha-600 text-matcha-600 font-medium rounded-full hover:bg-matcha-600 hover:text-white transition-all duration-300"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { ref, isVisible } = useScrollReveal();
  const reviews = [
    { name: 'Sarah Chen', text: 'The matcha is unlike anything I\'ve ever tasted. Pure, vibrant, and utterly delightful.', role: 'Tea Enthusiast' },
    { name: 'James Whitfield', text: 'The attention to detail is extraordinary. You can feel the passion in every cup.', role: 'Food Blogger' },
    { name: 'Amara Okafor', text: 'My go-to place for peace and the most incredible chamomile blend.', role: 'Regular Customer' },
  ];

  return (
    <section className="py-24 bg-tea-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`text-center mb-14 transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-matcha-400 uppercase tracking-[0.3em] text-sm font-medium mb-4">Testimonials</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
            Loved by Tea <span className="text-matcha-400">Lovers</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div
              key={r.name}
              className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-tea-100/80 font-accent text-lg italic mb-6">"{r.text}"</p>
              <div>
                <p className="text-white font-semibold">{r.name}</p>
                <p className="text-tea-400 text-sm">{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="py-20 bg-matcha-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
        <div className="absolute bottom-10 right-20 w-48 h-48 border-2 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 border border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="relative max-w-3xl mx-auto px-4 text-center">
        <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
          Ready to Discover Your Perfect Tea?
        </h2>
        <p className="text-matcha-100/80 text-lg mb-8">
          Browse our curated collection and find the blend that speaks to your soul.
        </p>
        <Link
          to="/products"
          className="inline-flex px-8 py-4 bg-white text-matcha-700 font-semibold rounded-full hover:bg-matcha-50 transition-colors shadow-xl"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <FeaturedProducts />
      <Testimonials />
      <CTABanner />
    </>
  );
}
