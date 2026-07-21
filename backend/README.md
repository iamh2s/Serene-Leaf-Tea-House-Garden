# 🍵 Serene Leaf Tea House

> A modern, full-stack e-commerce platform for a premium artisan tea shop — built with React, TypeScript, Django, and Razorpay payment integration.

![Tech Stack](https://img.shields.io/badge/Frontend-React%2018-blue)
![Tech Stack](https://img.shields.io/badge/Language-TypeScript-blue)
![Tech Stack](https://img.shields.io/badge/Backend-Django%204.2-green)
![Tech Stack](https://img.shields.io/badge/Database-SQLite-orange)
![Tech Stack](https://img.shields.io/badge/Payment-Razorpay-purple)
![Tech Stack](https://img.shields.io/badge/Styling-TailwindCSS-cyan)

---

## ✨ Features

### 🛍️ Customer Features
- **Browse Products** — Beautiful grid view with category filters, search, and sorting
- **Product Details** — Detailed product pages with images, ratings, and descriptions
- **Smart Cart** — Add, update quantities, remove items (persisted in localStorage)
- **Out-of-Stock Handling** — Products visibly marked, can't be added to cart
- **Secure Checkout** — Multi-step form with real-time validation
- **Razorpay Payment** — Supports UPI, Cards, Net Banking, Wallets
- **Order Confirmation** — Email-style success page with order details
- **Contact Form** — Reach out with validated form submissions
- **Responsive Design** — Works seamlessly on mobile, tablet, and desktop

### 🔐 Admin Features
- **Secure Login** — Token-based authentication
- **Dashboard** — Real-time stats (revenue, orders, customers, products)
- **Smart Revenue Tracking** — Only counts paid, shipped, and delivered orders
- **Order Management** — View all orders, update statuses (pending → paid → shipped → delivered)
- **Product CRUD** — Add, edit, delete products with image preview
- **Stock Management** — One-click toggle for in-stock / out-of-stock
- **Customer Insights** — View all customers with order history and total spent
- **Message Center** — View, reply, and mark contact messages as read
- **Live Sync** — Changes in admin reflect instantly on customer-facing pages

---

## 🚀 Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite** — Lightning-fast dev server & build tool
- **React Router (HashRouter)** — Client-side routing
- **Context API** — State management for cart, products, orders, auth
- **Tailwind CSS** — Utility-first styling with custom tea-themed palette
- **Lucide React** — Beautiful icon library
- **React Hot Toast** — Elegant toast notifications
- **Razorpay Checkout JS** — Payment gateway integration

### Backend
- **Django 4.2** — Python web framework
- **Django REST Framework** — Powerful API toolkit
- **Token Authentication** — Secure admin endpoints
- **CORS Headers** — Cross-origin frontend communication
- **Razorpay Python SDK** — Server-side payment verification
- **SQLite** — Default database (easily swappable to PostgreSQL/MySQL)
- **python-dotenv** — Environment variable management

---

## 📁 Project Structure
tea-shop/
├── backend/ # Django backend
│ ├── api/ # Main app
│ │ ├── models.py # Product, Order, Customer, Category models
│ │ ├── serializers.py # DRF serializers
│ │ ├── views.py # API endpoints
│ │ ├── urls.py # API URL routes
│ │ └── admin.py # Django admin config
│ ├── teashop/ # Project settings
│ │ ├── settings.py
│ │ └── urls.py
│ ├── manage.py
│ ├── requirements.txt
│ └── .env # API keys (not committed)
│
├── src/ # React frontend
│ ├── components/ # Reusable components
│ │ ├── Navbar.tsx
│ │ └── Footer.tsx
│ ├── pages/ # Route pages
│ │ ├── HomePage.tsx
│ │ ├── ProductsPage.tsx
│ │ ├── ProductDetailPage.tsx
│ │ ├── CartPage.tsx
│ │ ├── CheckoutPage.tsx
│ │ ├── OrderSuccessPage.tsx
│ │ ├── ContactPage.tsx
│ │ ├── AdminLoginPage.tsx
│ │ └── AdminDashboard.tsx
│ ├── context/ # State management
│ │ ├── AuthContext.tsx
│ │ ├── CartContext.tsx
│ │ ├── ProductContext.tsx
│ │ ├── OrderContext.tsx
│ │ └── MessageContext.tsx
│ ├── services/
│ │ └── api.ts # API client
│ ├── types.ts # TypeScript types
│ ├── App.tsx
│ └── main.tsx
│
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md


---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Razorpay account (free) — [Sign up here](https://dashboard.razorpay.com/signup)

### 1. Clone the Repository
```bash
git clone https://github.com/iamh2s/Serene-Leaf-Tea-House.git
cd serene-leaf-tea-house



2. Backend Setup (Django)
Bash

cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your Razorpay test keys

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Run server
python manage.py runserver
Backend will run at http://127.0.0.1:8000

3. Frontend Setup (React)
In a new terminal:

Bash

# From project root
npm install

# Run dev server
npm run dev
Frontend will run at http://localhost:5173

4. Environment Variables
Create backend/.env:

env

DEBUG=True
DJANGO_SECRET_KEY=your-super-secret-key

# Get from https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
Optional: .env in project root for custom API URL:

env

VITE_API_BASE_URL=http://127.0.0.1:8000/api
🧪 Testing Payments
This project uses Razorpay Test Mode by default.

Test Card
Number: 4111 1111 1111 1111
Expiry: Any future date (e.g. 12/30)
CVV: Any 3 digits (e.g. 123)
Name: Any name
Test UPI
UPI ID: success@razorpay — payment succeeds
UPI ID: failure@razorpay — payment fails
🔑 Admin Access
After creating a superuser:

Visit http://localhost:5173/#/admin/login
Login with your superuser email & password
Access full admin dashboard
Admin Features:
📊 Dashboard with KPIs
🛒 Manage orders & update statuses
📦 Add/Edit/Delete products
👥 View customer database
💬 Reply to contact messages
📈 Track paid revenue
🎨 Design Highlights
Custom tea-themed color palette — Cream, Tea, Matcha
Smooth animations — Hover effects, fade-ins, transitions
Smart form validation — Real-time visual feedback with character filters
Image grayscale — Visual cue for out-of-stock products
Loading skeletons — Better perceived performance
Toast notifications — Non-intrusive feedback


🛡️ Security Features
✅ Token-based admin authentication
✅ CORS configured for specific origins
✅ Razorpay signature verification on backend
✅ Protected admin-only endpoints
✅ Input sanitization & validation (frontend + backend)
✅ Environment variables for secrets
📦 API Endpoints
Public
GET /api/products/ — List products
GET /api/products/<slug>/ — Product detail
GET /api/categories/ — List categories
POST /api/orders/ — Create order
POST /api/payment/create-order/ — Create Razorpay order
POST /api/payment/verify/ — Verify payment
POST /api/contact/ — Submit contact form
GET /api/reviews/ — List reviews
Admin (Token required)
POST /api/admin/login/ — Admin login
GET /api/admin/dashboard/ — Dashboard stats
GET /api/admin/customers/ — All customers
GET /api/admin/messages/ — All contact messages
GET /api/orders/ — All orders
PATCH /api/orders/<id>/update_status/ — Update order status
POST /api/products/ — Create product
PATCH /api/products/<slug>/ — Update product
DELETE /api/products/<slug>/ — Delete product
