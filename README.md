# 🍵 Serene Leaf Tea House

A full-stack e-commerce website for a premium tea shop, built with React + Vite + Tailwind CSS (frontend) and Django + Django REST Framework (backend).

## Features

### Frontend (React)
- 📱 Fully responsive design
- 🎨 Beautiful UI with custom tea-themed color palette
- 🛒 Shopping cart with add/remove/update functionality
- 💳 Razorpay payment gateway integration
- 🔐 Admin dashboard with order management
- ✨ Smooth animations and scroll reveals
- 📄 Multiple pages: Home, About, Products, Cart, Checkout, Contact

### Backend (Django)
- 🔌 RESTful API with Django REST Framework
- 📦 Product catalog with categories
- 👥 Customer management
- 📋 Order management with status tracking
- 💰 Razorpay payment verification
- 🔒 Token-based admin authentication
- 📊 Dashboard statistics

## Project Structure

```
├── src/                    # Frontend (React + Vite)
│   ├── components/         # Reusable components
│   ├── context/           # React Context (Cart, Auth, Orders)
│   ├── data/              # Static product data
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   └── types/             # TypeScript types
│
├── backend/               # Backend (Django)
│   ├── api/              # Main API app
│   │   ├── models.py     # Database models
│   │   ├── views.py      # API views
│   │   ├── serializers.py # DRF serializers
│   │   └── urls.py       # API routes
│   ├── teashop/          # Django project settings
│   └── manage.py
│
└── public/               # Static assets
```

## Quick Start

### Frontend Only (Demo Mode)

The frontend works standalone with demo data - no backend required!

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

### Full Stack (With Backend)

#### 1. Start Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Razorpay credentials

# Run migrations
python manage.py migrate

# Seed database
python manage.py seed_data

# Start server
python manage.py runserver
```

Backend API: `http://localhost:8000/api/`

#### 2. Start Frontend

```bash
# In project root
npm run dev
```

Frontend: `http://localhost:5173`

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, featured products, testimonials |
| About | `/about` | Company story, team, values |
| Products | `/products` | Full catalog with filters |
| Product Detail | `/products/:id` | Single product view |
| Cart | `/cart` | Shopping cart |
| Checkout | `/checkout` | Shipping form + payment |
| Order Success | `/order-success` | Confirmation page |
| Contact | `/contact` | Contact form |
| Admin Login | `/admin/login` | Admin authentication |
| Admin Dashboard | `/admin` | Orders, products, customers |

## API Endpoints

### Public

```
GET    /api/categories/           # List categories
GET    /api/products/             # List products
GET    /api/products/{slug}/      # Product detail
GET    /api/products/featured/    # Featured products
POST   /api/orders/               # Create order
POST   /api/reviews/              # Submit review
POST   /api/contact/              # Contact form
```

### Payment

```
POST   /api/payment/create-order/ # Create Razorpay order
POST   /api/payment/verify/       # Verify payment
```

### Admin (Token Required)

```
POST   /api/admin/login/          # Login
POST   /api/admin/logout/         # Logout
GET    /api/admin/dashboard/      # Stats
GET    /api/admin/customers/      # Customer list
GET    /api/orders/               # Order list
PATCH  /api/orders/{id}/update_status/  # Update status
```

## Admin Credentials

```
Email: admin@sereneleaf.com
Password: admin123
```

## Razorpay Integration

### Test Mode Setup

1. Create account at [Razorpay](https://razorpay.com)
2. Get Test API keys from Dashboard
3. Add to `backend/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_StvvWwsDkzN53s
   RAZORPAY_KEY_SECRET=AIoLlPM16deAo6BzC7bMLtkZ
   ```

### Payment Flow

1. User fills checkout form
2. Frontend calls `/api/orders/` to create order
3. Frontend calls `/api/payment/create-order/` to get Razorpay order
4. Razorpay checkout opens
5. On success, frontend calls `/api/payment/verify/`
6. Backend verifies signature and updates order status

### Test Card Details

```
Card Number: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
```

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router DOM
- Lucide React Icons
- React Hot Toast

### Backend
- Python 3.10+
- Django 4.2
- Django REST Framework
- Razorpay Python SDK
- SQLite (dev) / PostgreSQL (prod)

## Environment Variables

### Frontend (optional)
```
VITE_API_URL=http://localhost:8000/api
```

### Backend
```
DEBUG=True
DJANGO_SECRET_KEY=your-secret-key
RAZORPAY_KEY_ID=rzp_test_StvvWwsDkzN53s
RAZORPAY_KEY_SECRET=AIoLlPM16deAo6BzC7bMLtkZ
```

## Deployment

### Frontend
- Build: `npm run build`
- Output: `dist/` folder
- Deploy to: Vercel, Netlify, etc.

### Backend
- Use PostgreSQL in production
- Set `DEBUG=False`
- Configure `ALLOWED_HOSTS`
- Use Gunicorn + Nginx
- Deploy to: Railway, Render, AWS, etc.

## License

MIT

---

Made with 🍵 and ❤️
