"""
Management command to seed the database with initial data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Category, Product, Customer, Order, OrderItem


class Command(BaseCommand):
    help = 'Seed the database with initial tea products and sample data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # Create admin user
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@sereneleaf.com',
                password='admin123'
            )
            self.stdout.write(self.style.SUCCESS('Created admin user'))

        # Create categories
        categories_data = [
            {'name': 'Green Tea', 'slug': 'green', 'description': 'Fresh and grassy green teas'},
            {'name': 'Black Tea', 'slug': 'black', 'description': 'Bold and robust black teas'},
            {'name': 'Herbal', 'slug': 'herbal', 'description': 'Caffeine-free herbal infusions'},
            {'name': 'Oolong', 'slug': 'oolong', 'description': 'Partially oxidized oolong teas'},
            {'name': 'White Tea', 'slug': 'white', 'description': 'Delicate and subtle white teas'},
            {'name': 'Specialty', 'slug': 'specialty', 'description': 'Unique blends and specialty items'},
        ]

        categories = {}
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            categories[cat_data['slug']] = cat
            if created:
                self.stdout.write(f'Created category: {cat.name}')

        # Create products
        products_data = [
            {
                'name': 'Imperial Matcha',
                'slug': 'imperial-matcha',
                'category': categories['green'],
                'price': 850,
                'description': 'Ceremonial grade matcha whisked to velvety perfection. Rich umami with a sweet, lingering finish. Sourced from Uji, Japan — the birthplace of premium matcha.',
                'short_description': 'Ceremonial grade matcha with rich umami flavor',
                'image_url': 'https://images.pexels.com/photos/17366787/pexels-photo-17366787.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
                'origin': 'Uji, Japan',
                'weight': '50g',
                'badge': 'Best Seller',
                'rating': 4.9,
                'reviews_count': 128,
                'is_featured': True,
            },
            {
                'name': 'Dragon Well Longjing',
                'slug': 'dragon-well-longjing',
                'category': categories['green'],
                'price': 700,
                'description': "Pan-fired green tea with chestnut notes and a sweet, mellow character. One of China's most famous teas, prized for its flat jade-colored leaves.",
                'short_description': 'Pan-fired green tea with chestnut notes',
                'image_url': 'https://images.pexels.com/photos/4390022/pexels-photo-4390022.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
                'origin': 'Hangzhou, China',
                'weight': '100g',
                'rating': 4.7,
                'reviews_count': 89,
            },
            {
                'name': 'Golden Assam',
                'slug': 'golden-assam',
                'category': categories['black'],
                'price': 600,
                'description': 'Full-bodied black tea with malty sweetness and a rich amber liquor. Perfect with or without milk. A breakfast staple from the highlands of Assam.',
                'short_description': 'Full-bodied black tea with malty sweetness',
                'image_url': 'https://images.pexels.com/photos/5957922/pexels-photo-5957922.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
                'origin': 'Assam, India',
                'weight': '100g',
                'rating': 4.6,
                'reviews_count': 156,
            },
            {
                'name': 'Chamomile Dreams',
                'slug': 'chamomile-dreams',
                'category': categories['herbal'],
                'price': 550,
                'description': 'Whole chamomile flowers blended with French lavender and honey notes. The ultimate evening tea for relaxation and peaceful sleep.',
                'short_description': 'Whole chamomile flowers with lavender',
                'image_url': 'https://images.pexels.com/photos/10584487/pexels-photo-10584487.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
                'origin': 'Provence, France',
                'weight': '75g',
                'badge': 'Caffeine Free',
                'rating': 4.8,
                'reviews_count': 94,
                'is_featured': True,
            },
            {
                'name': 'Iced Matcha Latte Kit',
                'slug': 'iced-matcha-latte-kit',
                'category': categories['specialty'],
                'price': 900,
                'description': 'Everything you need for the perfect iced matcha latte at home. Includes ceremonial matcha, a bamboo whisk, and recipe card.',
                'short_description': 'Complete kit for iced matcha lattes',
                'image_url': 'https://images.pexels.com/photos/11009223/pexels-photo-11009223.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
                'origin': 'House Special',
                'weight': '100g kit',
                'badge': 'New',
                'rating': 4.9,
                'reviews_count': 67,
                'is_featured': True,
            },
            {
                'name': 'Earl Grey Supreme',
                'slug': 'earl-grey-supreme',
                'category': categories['black'],
                'price': 650,
                'description': 'Classic bergamot-scented black tea elevated with blue cornflower petals. Aromatic, elegantly smooth, and utterly British.',
                'short_description': 'Bergamot-scented black tea with cornflower',
                'image_url': 'https://images.pexels.com/photos/7037467/pexels-photo-7037467.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
                'origin': 'Sri Lanka',
                'weight': '100g',
                'rating': 4.7,
                'reviews_count': 201,
            },
            {
                'name': 'Jasmine Pearl',
                'slug': 'jasmine-pearl',
                'category': categories['green'],
                'price': 800,
                'description': 'Hand-rolled green tea pearls scented with fresh jasmine blossoms over several nights. Unfurls beautifully in the cup to release a heavenly aroma.',
                'short_description': 'Hand-rolled pearls scented with jasmine',
                'image_url': 'https://images.pexels.com/photos/9025660/pexels-photo-9025660.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
                'origin': 'Fujian, China',
                'weight': '75g',
                'badge': 'Popular',
                'rating': 4.8,
                'reviews_count': 112,
                'is_featured': True,
            },
            {
                'name': 'Rose Petal Bliss',
                'slug': 'rose-petal-bliss',
                'category': categories['herbal'],
                'price': 600,
                'description': "Delicate Moroccan rose petals, hibiscus, and a hint of vanilla. A floral escape in every sip that's as beautiful to look at as it is to drink.",
                'short_description': 'Moroccan rose petals with hibiscus',
                'image_url': 'https://images.pexels.com/photos/3723874/pexels-photo-3723874.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
                'origin': 'Morocco',
                'weight': '75g',
                'badge': 'Caffeine Free',
                'rating': 4.5,
                'reviews_count': 78,
            },
            {
                'name': 'Darjeeling First Flush',
                'slug': 'darjeeling-first-flush',
                'category': categories['black'],
                'price': 950,
                'description': 'The "Champagne of Teas" — light, floral, and muscatel. Hand-plucked from the misty Himalayan slopes during the prized first harvest of spring.',
                'short_description': 'The Champagne of Teas',
                'image_url': 'https://images.pexels.com/photos/5975983/pexels-photo-5975983.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
                'origin': 'Darjeeling, India',
                'weight': '50g',
                'badge': 'Premium',
                'rating': 4.9,
                'reviews_count': 45,
            },
            {
                'name': 'Iron Goddess Oolong',
                'slug': 'iron-goddess-oolong',
                'category': categories['oolong'],
                'price': 750,
                'description': 'Ti Kuan Yin — a legendary oolong with orchid fragrance and a creamy, buttery finish. Multiple infusions reveal layers of complexity.',
                'short_description': 'Legendary oolong with orchid fragrance',
                'image_url': 'https://images.pexels.com/photos/5555488/pexels-photo-5555488.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
                'origin': 'Fujian, China',
                'weight': '75g',
                'rating': 4.8,
                'reviews_count': 63,
            },
            {
                'name': 'Silver Needle White Tea',
                'slug': 'silver-needle-white-tea',
                'category': categories['white'],
                'price': 1100,
                'description': 'The most prized white tea — made only from unopened buds covered in downy silver hairs. Delicate, sweet, and incredibly subtle.',
                'short_description': 'Prized white tea from unopened buds',
                'image_url': 'https://images.pexels.com/photos/12898331/pexels-photo-12898331.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
                'origin': 'Fujian, China',
                'weight': '50g',
                'badge': 'Rare',
                'rating': 4.9,
                'reviews_count': 34,
            },
            {
                'name': 'Moroccan Mint Blend',
                'slug': 'moroccan-mint-blend',
                'category': categories['herbal'],
                'price': 500,
                'description': 'Refreshing spearmint and peppermint leaves with a touch of green tea. Perfect hot or iced — a timeless North African classic.',
                'short_description': 'Refreshing mint with green tea',
                'image_url': 'https://images.pexels.com/photos/17402680/pexels-photo-17402680.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
                'origin': 'Morocco',
                'weight': '100g',
                'rating': 4.6,
                'reviews_count': 143,
            },
        ]

        for prod_data in products_data:
            prod, created = Product.objects.get_or_create(
                slug=prod_data['slug'],
                defaults=prod_data
            )
            if created:
                self.stdout.write(f'Created product: {prod.name}')

        # Create sample customers and orders
        sample_customers = [
            {'name': 'Sarah Chen', 'email': 'sarah@example.com', 'phone': '+91 98765 43210'},
            {'name': 'James Whitfield', 'email': 'james@example.com', 'phone': '+91 98765 43211'},
            {'name': 'Amara Okafor', 'email': 'amara@example.com', 'phone': '+91 98765 43212'},
            {'name': 'David Park', 'email': 'david@example.com', 'phone': '+91 98765 43213'},
            {'name': 'Elena Rossi', 'email': 'elena@example.com', 'phone': '+91 98765 43214'},
        ]

        for cust_data in sample_customers:
            Customer.objects.get_or_create(
                email=cust_data['email'],
                defaults=cust_data
            )

        # Seed reviews
        from api.models import Review
        review_data = [
            ('imperial-matcha', 'Sarah Chen', 5, 'This matcha is unlike anything I\'ve ever tasted. Pure, vibrant, and utterly delightful.'),
            ('earl-grey-supreme', 'James Whitfield', 5, 'The bergamot aroma is heavenly. Best Earl Grey I\'ve ever had.'),
            ('chamomile-dreams', 'Amara Okafor', 5, 'My nightly ritual. The lavender and chamomile blend is so calming.'),
            ('jasmine-pearl', 'David Park', 4, 'Watching these pearls unfurl is mesmerising. Great quality.'),
            ('iced-matcha-latte-kit', 'Elena Rossi', 5, 'This kit is genius! Café-quality matcha lattes at home.'),
            ('golden-assam', 'Priya Sharma', 5, 'Bold, malty, and full-bodied. Reminds me of my grandmother\'s tea.'),
            ('iron-goddess-oolong', 'Liam O\'Brien', 5, 'Got 6 infusions and each one tasted different! Beautiful orchid notes.'),
            ('silver-needle-white-tea', 'Mei Lin', 5, 'The most delicate tea I\'ve ever had. Worth every penny.'),
        ]
        for slug, name, rating, comment in review_data:
            try:
                product = Product.objects.get(slug=slug)
                Review.objects.get_or_create(
                    product=product, customer_name=name,
                    defaults={'rating': rating, 'comment': comment}
                )
            except Product.DoesNotExist:
                pass
        self.stdout.write(f'Seeded {len(review_data)} reviews')

        # Seed contact messages
        from api.models import ContactMessage
        msg_data = [
            {'name': 'Priya Sharma', 'email': 'priya.sharma@gmail.com', 'phone': '+91 98765 43210',
             'subject': 'Bulk order inquiry', 'message': 'Hi, I am interested in placing a bulk order of 50 packs of Imperial Matcha for corporate gifting. Can you offer a discount?',
             'is_read': True, 'admin_note': 'Called back — offered 15% bulk discount.'},
            {'name': 'Rahul Mehta', 'email': 'rahul.m@outlook.com', 'phone': '+91 87654 32109',
             'subject': 'Delivery issue', 'message': 'My order was supposed to arrive 3 days ago but tracking still shows Processing.',
             'is_read': True, 'admin_note': ''},
            {'name': 'Ananya Gupta', 'email': 'ananya.g@yahoo.com', 'phone': '+91 76543 21098',
             'subject': 'Tea tasting workshop', 'message': 'Do you conduct tea tasting sessions for groups of 8?',
             'is_read': False, 'admin_note': ''},
            {'name': 'Vikram Singh', 'email': 'vikram.singh@gmail.com', 'phone': '+91 99887 76655',
             'subject': 'Return request', 'message': 'Received Chamomile Dreams with damaged packaging. Requesting replacement.',
             'is_read': False, 'admin_note': ''},
        ]
        for md in msg_data:
            ContactMessage.objects.get_or_create(
                email=md['email'], subject=md['subject'],
                defaults=md
            )
        self.stdout.write(f'Seeded {len(msg_data)} contact messages')

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
        self.stdout.write(self.style.SUCCESS('Admin login: admin@sereneleaf.com / admin123'))
