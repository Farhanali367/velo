# VELO. — Premium E-Commerce Platform

> A modern, responsive e-commerce platform built with Next.js, React, TypeScript and Supabase.

## ✨ Overview

VELO. is a full-stack e-commerce application with a premium shopping experience, customer authentication, product discovery, cart, wishlist, checkout, orders, reviews, notifications, recommendations, flash sales and an admin dashboard.

## 🚀 Live Demo

https://velo-eight-opal.vercel.app

## 🛠️ Tech Stack

- Next.js
- React
- TypeScript
- CSS
- Supabase Authentication
- PostgreSQL
- Vercel
- Git & GitHub

## 🛍️ Customer Features

### Shopping
- Premium product storefront
- 50+ realistic fallback products
- Live Supabase products
- Categories
- Search and sorting
- Product details
- Ratings and reviews
- Stock availability
- Low-stock and out-of-stock protection

### ❤️ Wishlist
- Add/remove products
- Persistent logged-in wishlist
- Guest wishlist support
- Add to cart
- Add all available items to cart

### 🛒 Cart
- Add/remove products
- Quantity controls
- Stock-aware cart
- Delivery calculation
- Free delivery above ₹999
- Automatic discount above ₹5000
- Savings calculation

### ⚡ Flash Sale
- Live countdown
- Dynamic sale discounts
- Sale pricing in cart and checkout
- Stock-aware purchasing

## 💳 Checkout & Orders

- Delivery address
- UPI, Card and COD options
- Order summary
- Coupons
- Discounts and delivery calculation
- Secure order creation
- Order history
- Order tracking
- Order cancellation
- Reorder
- Order notifications

### 📦 Order Status

```text
Placed → Confirmed → Packed → Shipped → Out for Delivery → Delivered
```

Cancelled orders are also supported.

## ⭐ Reviews & Ratings

Customers can:
- Submit 1–5 star reviews
- Edit their own reviews
- Delete their own reviews
- View ratings and review counts

Admins can manage reviews.

## ❓ Product Q&A

Customers can ask product questions and manage their own questions. Admins can answer, update and delete questions.

## 🔔 Notifications

- Order notifications
- Status notifications
- Cancellation notifications
- Unread count
- Mark as read
- Mark all as read
- Clear notifications

## 🎁 Loyalty & Recommendations

- Loyalty progress based on order activity
- Recommended products
- Recently viewed products
- Same-category recommendations

## 👨‍💼 Admin Dashboard

### Analytics
- Revenue
- Orders
- Customers
- Fulfillment
- Order pipeline
- 7-day and 30-day performance

### Product Management
- Add, edit and delete products
- Update price, description, category, image and stock
- Search products

### Inventory
- Live stock
- Low-stock alerts
- Out-of-stock detection
- Stock updates

### Customer Management
- View customers
- Monitor customer activity

### Orders
- View orders
- View order details
- Update order status

### Coupons
- Create, edit and delete coupons
- Percentage or flat discounts
- Minimum order amount
- Maximum discount
- Expiry
- Usage limits
- Usage tracking

## 📊 Reports Center

- Sales reports
- Detailed order reports
- Revenue statistics
- Order statistics
- Average order value
- Today / 7 days / 30 days / All time
- CSV export
- Print / PDF

## 🔐 Authentication & Security

VELO. uses Supabase Authentication and Row Level Security.

Security includes:
- Protected authentication
- User-specific data policies
- Admin role protection
- Secure order operations
- Atomic order creation
- Stock validation
- Protected profiles, orders and notifications
- Supabase RLS

> Never expose Supabase secret/service-role keys in frontend code.

## 🗂️ Project Structure

```text
velo/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── page-backup.tsx
├── lib/
│   └── supabase.ts
├── public/
├── .env.local
├── .gitignore
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
└── README.md
```

## ⚙️ Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Never put a Supabase secret/service-role key in client-side code or GitHub.

For Vercel, add the same public variables under:

```text
Project → Settings → Environment Variables
```

## 💻 Local Development

### Clone

```bash
git clone https://github.com/Farhanali367/velo.git
cd velo
```

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 🏗️ Production Build

Test the production build with:

```bash
npm run build
```

Then:

```bash
npm start
```

## 🚀 Deployment

VELO. is deployed on Vercel.

Typical workflow:

```text
Local Project
     ↓
Git
     ↓
GitHub
     ↓
Vercel
     ↓
Production
```

Update production with:

```bash
git add .
git commit -m "Update VELO"
git push
```

## 📱 Responsive Design

Designed for:
- Mobile
- Tablet
- Laptop
- Desktop

Responsive areas include navigation, product grids, cart, wishlist, modals, checkout, admin dashboard, reports, tables and forms.

## 🎨 Design Philosophy

VELO. focuses on:
- Premium visual design
- Clean typography
- Modern cards
- Responsive layouts
- Smooth interactions
- Clear navigation
- Beginner-friendly usability
- Professional e-commerce experience

## 🧪 Production Checklist

- [x] Storefront
- [x] Authentication
- [x] Products
- [x] Search
- [x] Categories
- [x] Cart
- [x] Wishlist
- [x] Checkout
- [x] Coupons
- [x] Orders
- [x] Order tracking
- [x] Reviews
- [x] Product Q&A
- [x] Notifications
- [x] Admin dashboard
- [x] Analytics
- [x] Reports
- [x] Inventory
- [x] Flash sale
- [x] Loyalty
- [x] Recommendations
- [x] Responsive UI
- [x] GitHub
- [x] Vercel deployment
- [x] Supabase
- [x] Row Level Security

## 🔒 Production Security Notes

1. Never commit `.env.local`.
2. Never expose secret/service-role keys.
3. Keep Supabase RLS enabled.
4. Protect admin operations.
5. Validate stock before creating orders.
6. Use atomic order operations.
7. Validate prices and totals server-side for real payment processing.
8. Review authentication and database policies before production use.

## 📌 Future Improvements

- Razorpay / Stripe payments
- Product image storage
- Advanced search
- Server-side pagination
- Email order confirmations
- Shipping integration
- Automated testing
- CI/CD pipeline
- PWA support

## 👨‍💻 Author

**Farhan Ali**

BTech CSE Student & Developer

GitHub: https://github.com/Farhanali367

## 📄 License

This project is created for learning, development and portfolio purposes.

---

<p align="center">
  <strong>VELO.</strong><br>
  Built with Next.js, React, TypeScript & Supabase.
</p>
