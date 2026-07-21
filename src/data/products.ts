import { Product } from '../types';

export const initialProducts: Product[] = [
  {
    id: 'imperial-matcha', name: 'Imperial Matcha', category: 'green', price: 850,
    description: 'Ceremonial grade matcha whisked to velvety perfection. Rich umami with a sweet, lingering finish. Sourced from Uji, Japan — the birthplace of premium matcha.',
    image: 'https://images.pexels.com/photos/17366787/pexels-photo-17366787.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    origin: 'Uji, Japan', badge: 'Best Seller', weight: '50g', inStock: true, rating: 4.9, reviews: 128,
  },
  {
    id: 'dragon-well-longjing', name: 'Dragon Well Longjing', category: 'green', price: 700,
    description: 'Pan-fired green tea with chestnut notes and a sweet, mellow character. One of China\'s most famous teas, prized for its flat jade-colored leaves.',
    image: 'https://images.pexels.com/photos/4390022/pexels-photo-4390022.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    origin: 'Hangzhou, China', weight: '100g', inStock: true, rating: 4.7, reviews: 89,
  },
  {
    id: 'golden-assam', name: 'Golden Assam', category: 'black', price: 600,
    description: 'Full-bodied black tea with malty sweetness and a rich amber liquor. Perfect with or without milk. A breakfast staple from the highlands of Assam.',
    image: 'https://images.pexels.com/photos/5957922/pexels-photo-5957922.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    origin: 'Assam, India', weight: '100g', inStock: true, rating: 4.6, reviews: 156,
  },
  {
    id: 'chamomile-dreams', name: 'Chamomile Dreams', category: 'herbal', price: 550,
    description: 'Whole chamomile flowers blended with French lavender and honey notes. The ultimate evening tea for relaxation and peaceful sleep.',
    image: 'https://images.pexels.com/photos/10584487/pexels-photo-10584487.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    origin: 'Provence, France', badge: 'Caffeine Free', weight: '75g', inStock: true, rating: 4.8, reviews: 94,
  },
  {
    id: 'iced-matcha-latte', name: 'Iced Matcha Latte Kit', category: 'specialty', price: 900,
    description: 'Everything you need for the perfect iced matcha latte at home. Includes ceremonial matcha, a bamboo whisk, and recipe card.',
    image: 'https://images.pexels.com/photos/11009223/pexels-photo-11009223.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    origin: 'House Special', badge: 'New', weight: '100g kit', inStock: true, rating: 4.9, reviews: 67,
  },
  {
    id: 'earl-grey-supreme', name: 'Earl Grey Supreme', category: 'black', price: 650,
    description: 'Classic bergamot-scented black tea elevated with blue cornflower petals. Aromatic, elegantly smooth, and utterly British.',
    image: 'https://images.pexels.com/photos/7037467/pexels-photo-7037467.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    origin: 'Sri Lanka', weight: '100g', inStock: true, rating: 4.7, reviews: 201,
  },
  {
    id: 'jasmine-pearl', name: 'Jasmine Pearl', category: 'green', price: 800,
    description: 'Hand-rolled green tea pearls scented with fresh jasmine blossoms over several nights. Unfurls beautifully in the cup to release a heavenly aroma.',
    image: 'https://images.pexels.com/photos/9025660/pexels-photo-9025660.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    origin: 'Fujian, China', badge: 'Popular', weight: '75g', inStock: true, rating: 4.8, reviews: 112,
  },
  {
    id: 'rose-petal-bliss', name: 'Rose Petal Bliss', category: 'herbal', price: 600,
    description: 'Delicate Moroccan rose petals, hibiscus, and a hint of vanilla. A floral escape in every sip that\'s as beautiful to look at as it is to drink.',
    image: 'https://images.pexels.com/photos/3723874/pexels-photo-3723874.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    origin: 'Morocco', badge: 'Caffeine Free', weight: '75g', inStock: true, rating: 4.5, reviews: 78,
  },
  {
    id: 'darjeeling-first-flush', name: 'Darjeeling First Flush', category: 'black', price: 950,
    description: 'The "Champagne of Teas" — light, floral, and muscatel. Hand-plucked from the misty Himalayan slopes during the prized first harvest of spring.',
    image: 'https://images.pexels.com/photos/5975983/pexels-photo-5975983.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    origin: 'Darjeeling, India', badge: 'Premium', weight: '50g', inStock: false, rating: 4.9, reviews: 45,
  },
  {
    id: 'iron-goddess-oolong', name: 'Iron Goddess Oolong', category: 'oolong', price: 750,
    description: 'Ti Kuan Yin — a legendary oolong with orchid fragrance and a creamy, buttery finish. Multiple infusions reveal layers of complexity.',
    image: 'https://images.pexels.com/photos/5555488/pexels-photo-5555488.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    origin: 'Fujian, China', weight: '75g', inStock: true, rating: 4.8, reviews: 63,
  },
  {
    id: 'silver-needle-white', name: 'Silver Needle White Tea', category: 'white', price: 1100,
    description: 'The most prized white tea — made only from unopened buds covered in downy silver hairs. Delicate, sweet, and incredibly subtle.',
    image: 'https://images.pexels.com/photos/12898331/pexels-photo-12898331.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    origin: 'Fujian, China', badge: 'Rare', weight: '50g', inStock: true, rating: 4.9, reviews: 34,
  },
  {
    id: 'moroccan-mint', name: 'Moroccan Mint Blend', category: 'herbal', price: 500,
    description: 'Refreshing spearmint and peppermint leaves with a touch of green tea. Perfect hot or iced — a timeless North African classic.',
    image: 'https://images.pexels.com/photos/17402680/pexels-photo-17402680.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    origin: 'Morocco', weight: '100g', inStock: true, rating: 4.6, reviews: 143,
  },
];
