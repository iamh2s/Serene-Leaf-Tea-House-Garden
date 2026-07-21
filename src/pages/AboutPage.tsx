import { useScrollReveal } from '../hooks/useScrollReveal';
import { Leaf, Award, Heart, Users, Globe, Coffee } from 'lucide-react';

const stats = [
  { number: '50+', label: 'Tea Varieties', icon: '🍃' },
  { number: '12', label: 'Origin Countries', icon: '🌍' },
  { number: '15K+', label: 'Cups Served', icon: '🍵' },
  { number: '4.9', label: 'Average Rating', icon: '⭐' },
];

const values = [
  { icon: Leaf, title: 'Sustainability', text: 'We partner with farms that practice regenerative agriculture and fair trade principles.' },
  { icon: Globe, title: 'Global Sourcing', text: 'Direct relationships with growers in Japan, China, India, Taiwan, and beyond.' },
  { icon: Heart, title: 'Mindfulness', text: 'We believe tea is a practice, not just a beverage. Slow down and savor.' },
  { icon: Award, title: 'Quality First', text: 'Every leaf is tested, graded, and curated by our master blenders.' },
  { icon: Users, title: 'Community', text: 'We host workshops, tastings, and ceremonies to bring tea lovers together.' },
  { icon: Coffee, title: 'Innovation', text: 'From classic brews to modern matcha lattes — we honor tradition while evolving.' },
];

const team = [
  { name: 'Mei Lin', role: 'Founder & Head Tea Master', emoji: '👩‍🍳', desc: 'Studied tea arts in Kyoto for 5 years before founding Serene Leaf.' },
  { name: 'Raj Patel', role: 'Head of Sourcing', emoji: '🧑‍💼', desc: 'Travels to 12 countries annually to find the finest leaves.' },
  { name: 'Emma Liu', role: 'Lead Blender', emoji: '👩‍🔬', desc: 'Creates our signature blends with a background in food science.' },
  { name: 'Thomas Green', role: 'Experience Director', emoji: '🧑‍🏫', desc: 'Designs our workshops, ceremonies, and tasting events.' },
];

export default function AboutPage() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal();
  const { ref: storyRef, isVisible: storyVisible } = useScrollReveal();
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollReveal();
  const { ref: teamRef, isVisible: teamVisible } = useScrollReveal();

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-24 md:py-32 bg-tea-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.pexels.com/photos/8952399/pexels-photo-8952399.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1920"
            alt="Tea ceremony background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <p className="text-matcha-400 uppercase tracking-[0.3em] text-sm font-medium mb-4">Our Story</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
            A Journey Through Tea & Tradition
          </h1>
          <p className="text-tea-200/80 text-lg md:text-xl max-w-2xl mx-auto">
            From a small dream to your favorite tea house — this is how Serene Leaf came to be.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-matcha-700">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl mb-1">{s.icon}</p>
              <p className="font-display text-3xl font-bold text-white">{s.number}</p>
              <p className="text-matcha-100/70 text-sm uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={storyRef}
            className={`grid lg:grid-cols-2 gap-16 items-center transition-all duration-1000 ${
              storyVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/5555488/pexels-photo-5555488.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=640"
                alt="Tea setup"
                className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/5]"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-6 max-w-[200px]">
                <p className="font-display text-4xl font-bold text-matcha-600">2018</p>
                <p className="text-tea-600 text-sm mt-1">Year Founded</p>
              </div>
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-matcha-300/30 rounded-2xl -z-10" />
            </div>

            <div>
              <h2 className="font-display text-4xl font-bold text-tea-900 mb-6">
                Born from a <span className="text-matcha-600">Passion</span> for Tea
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-matcha-500 to-matcha-300 rounded-full mb-8" />
              <div className="space-y-4 text-tea-700 leading-relaxed">
                <p>
                  Serene Leaf was founded in 2018 by Mei Lin, a tea master trained in Kyoto who dreamed of creating a space
                  where ancient tea traditions meet modern mindfulness. What began as a small pop-up in Portland's Pearl District
                  has grown into the city's most beloved tea house.
                </p>
                <p>
                  Our philosophy is simple: great tea starts at the source. We travel directly to family-owned gardens in Japan,
                  China, India, and Taiwan, building relationships that span generations. Every leaf in our collection tells a
                  story of place, craft, and care.
                </p>
                <p>
                  Today, Serene Leaf is more than a tea shop — it's a community. We host weekly tastings, seasonal ceremonies,
                  and workshops that help people slow down, connect, and discover the extraordinary depth of flavors hidden in
                  every humble tea leaf.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 bg-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={valuesRef}
            className={`text-center max-w-2xl mx-auto mb-14 transition-all duration-800 ${
              valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-matcha-600 uppercase tracking-[0.3em] text-sm font-medium mb-4">What We Believe</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-tea-900">
              Our <span className="text-matcha-600">Values</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-matcha-500 to-matcha-300 rounded-full mt-6 mx-auto" />
          </div>

          <div ref={heroRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={v.title}
                className={`bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-700 ${
                  heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-matcha-50 flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-matcha-600" />
                </div>
                <h3 className="font-display text-xl font-semibold text-tea-900 mb-2">{v.title}</h3>
                <p className="text-tea-600 text-sm leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={teamRef}
            className={`text-center max-w-2xl mx-auto mb-14 transition-all duration-800 ${
              teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-matcha-600 uppercase tracking-[0.3em] text-sm font-medium mb-4">Our People</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-tea-900">
              Meet the <span className="text-matcha-600">Team</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-matcha-500 to-matcha-300 rounded-full mt-6 mx-auto" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((t, i) => (
              <div
                key={t.name}
                className={`bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-all duration-700 ${
                  teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-5xl mb-4">{t.emoji}</div>
                <h3 className="font-display text-lg font-semibold text-tea-900">{t.name}</h3>
                <p className="text-matcha-600 text-sm font-medium mb-3">{t.role}</p>
                <p className="text-tea-500 text-sm">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
