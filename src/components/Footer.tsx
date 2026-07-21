import { Link } from 'react-router-dom';
import { Leaf, Heart, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-tea-950 text-tea-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Leaf className="w-7 h-7 text-matcha-400" />
              <div>
                <span className="font-display text-lg font-bold text-white block">Serene Leaf</span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-tea-400 -mt-1 block">
                  Tea House
                </span>
              </div>
            </Link>
            <p className="text-tea-400 text-sm leading-relaxed">
              A sanctuary for tea lovers. Premium artisan teas, mindful experiences, and moments of pure tranquility.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', to: '/' },
                { label: 'About Us', to: '/about' },
                { label: 'Products', to: '/products' },
                { label: 'Cart', to: '/cart' },
                { label: 'Contact', to: '/contact' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-tea-400 text-sm hover:text-matcha-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tea Types */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Our Teas</h4>
            <ul className="space-y-2.5">
              {['Green Tea', 'Black Tea', 'White Tea', 'Oolong', 'Herbal Infusions', 'Specialty'].map(
                (link) => (
                  <li key={link}>
                    <Link to="/products" className="text-tea-400 text-sm hover:text-matcha-400 transition-colors">
                      {link}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-tea-400 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-matcha-400 shrink-0" />
                <span>142 Willow Creek Lane, Portland, OR 97201</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-matcha-400 shrink-0" />
                <span>(503) 555-0142</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-matcha-400 shrink-0" />
                <span>hello@sereneleaf.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-matcha-400 shrink-0" />
                <span>Mon-Sun: 7AM - 9PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-tea-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-tea-500 text-sm">© 2025 Serene Leaf Tea House. All rights reserved.</p>
          <p className="text-tea-500 text-sm flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> and a lot of tea
          </p>
        </div>
      </div>
    </footer>
  );
}
