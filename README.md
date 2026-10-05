🛍️ VELO — Modern E-Commerce Platform

«A modern, full-stack e-commerce platform built with Next.js, React, TypeScript and Supabase.»

VELO is a production-deployed e-commerce application designed to provide a smooth and modern online shopping experience. It combines a responsive customer storefront with authentication, cart management, wishlist, checkout, order tracking, reviews, notifications, inventory management and a powerful admin dashboard.

🌐 Live Demo: https://velo-eight-opal.vercel.app
💻 GitHub: https://github.com/Farhanali367/velo

---

✨ Overview

VELO was built as a complete e-commerce project rather than a simple product listing website.

The application covers the complete shopping journey:

Discover → Search → Product → Wishlist → Cart → Checkout → Order → Tracking

It also provides an administrative workflow:

Manage Products → Inventory → Orders → Customers → Reviews → Coupons → Analytics → Reports

The project focuses on real-world functionality, responsive design, database integration and production deployment.

---

🚀 Key Features

🛒 Customer Shopping Experience

- Modern responsive storefront
- Product categories
- Product search
- Product sorting
- Product details
- Product pricing
- Stock availability
- Low-stock indicators
- Out-of-stock protection
- Wishlist
- Shopping cart
- Quantity management
- Product reviews & ratings
- Product Q&A
- Smart recommendations
- Recently viewed products

---

💳 Cart & Checkout

VELO provides a complete checkout flow with:

- Cart management
- Automatic subtotal calculation
- Delivery fee calculation
- Free delivery eligibility
- Automatic discount calculation
- Coupon support
- Delivery address
- Payment method selection
- Order summary
- Order confirmation
- Order success screen

Delivery Logic

Order Amount < ₹999
        ↓
Delivery Fee Applied

Order Amount ≥ ₹999
        ↓
Free Delivery

---

📦 Order Management

Customers can:

- Place orders
- View order history
- View order details
- Track order status
- Cancel eligible orders
- Reorder previous purchases
- Receive order notifications

Order Lifecycle

Placed
  ↓
Confirmed
  ↓
Packed
  ↓
Shipped
  ↓
Out for Delivery
  ↓
Delivered

Orders can also be marked as Cancelled when applicable.

---

🔐 Authentication & User Accounts

VELO uses Supabase Authentication for account management.

User capabilities

- Sign up
- Login
- Logout
- Protected user functionality
- User profile
- Persistent wishlist
- Personal orders
- Personal notifications

User-specific database access is protected using Row Level Security (RLS).

---

⚡ Flash Sale

The platform includes a live flash-sale experience featuring:

- Live countdown
- Dynamic discounted prices
- Sale products
- Stock-aware cart controls
- Low-stock warnings
- Out-of-stock protection

This creates a more realistic e-commerce shopping experience.

---

👨‍💼 Admin Dashboard

VELO includes a dedicated admin experience for managing the platform.

Product Management

- Add products
- Edit products
- Delete products
- Update stock
- Search products
- Manage product information

Order Management

- View orders
- View order details
- Update order status
- Track fulfillment

Customer Management

- View customer information
- Monitor customer activity

Review Management

- View reviews
- Manage customer reviews

Coupon Management

- Create coupons
- Update coupons
- Activate/deactivate coupons
- Manage usage limits
- Track coupon usage

---

📊 Analytics & Reports

The admin dashboard includes useful business insights such as:

- Total revenue
- Total orders
- Total customers
- Average order value
- Fulfillment statistics
- Revenue trends
- Order pipeline
- Sales reports
- Detailed order reports

Reporting

Reports can be:

- Previewed
- Printed
- Exported as CSV
- Used for basic business analysis

---

🎁 Loyalty & Smart Recommendations

VELO includes a lightweight customer loyalty and recommendation experience.

Loyalty

Customer loyalty is calculated from order activity.

Recommendations

Products can be recommended using signals such as:

- Recently viewed products
- Product category
- Related products
- Shopping activity

---

🔔 Notifications

Customers receive in-app notifications for important events such as:

- Order placed
- Order status changes
- Order cancellation
- Other account-related updates

Notifications support:

- Unread count
- Mark as read
- Mark all as read
- Delete notifications

---

📱 Responsive Design

VELO is designed to work across:

- 📱 Mobile
- 📲 Tablet
- 💻 Laptop
- 🖥️ Desktop

Responsive behavior has been considered for:

- Navigation
- Product grids
- Product modals
- Cart drawer
- Wishlist
- Checkout
- Admin dashboard
- Tables
- Forms

---

🛠️ Tech Stack

Technology| Purpose
Next.js| Application framework
React| UI development
TypeScript| Type-safe development
Supabase| Backend services
PostgreSQL| Database
Supabase Auth| Authentication
Supabase RLS| Database security
Vercel| Production deployment
GitHub| Version control

---

🏗️ Application Architecture

                    ┌──────────────────┐
                    │      VELO        │
                    │  E-Commerce App  │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
       Customer Experience             Admin Experience
              │                             │
       ┌──────┴──────┐              ┌───────┴────────┐
       │             │              │                │
    Products       Cart          Products          Orders
       │             │              │                │
   Wishlist      Checkout       Inventory         Customers
       │             │              │                │
   Reviews        Orders         Reviews           Analytics
       │             │              │                │
 Notifications   Tracking        Coupons            Reports
              │                             │
              └──────────────┬──────────────┘
                             │
                      ┌──────▼──────┐
                      │  Supabase   │
                      │ PostgreSQL  │
                      │    Auth     │
                      │    RLS      │
                      └──────┬──────┘
                             │
                        ┌────▼────┐
                        │ Vercel  │
                        │  Live   │
                        └─────────┘

---

🔒 Security

Security was considered during the development of the application.

VELO uses:

- Supabase Authentication
- PostgreSQL
- Row Level Security
- User-specific database policies
- Protected admin functionality
- Atomic order creation
- Stock validation
- Secure environment variables

Environment Variables

Create a ".env.local" file:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

«Never commit Supabase secret/service-role keys to GitHub or expose them in the frontend.»

---

💻 Local Development

1. Clone the repository

git clone https://github.com/Farhanali367/velo.git

2. Enter the project

cd velo

3. Install dependencies

npm install

4. Configure environment variables

Create:

.env.local

Add your Supabase project credentials.

5. Start the development server

npm run dev

Then open:

http://localhost:3000

---

🧪 Production Build

Before deploying:

npm run build

A successful production build confirms that the application can be compiled for deployment.

---

🚀 Deployment

VELO is deployed using Vercel with GitHub integration.

Developer
    │
    ▼
Local Development
    │
    ▼
Git
    │
    ▼
GitHub
    │
    ▼
Vercel
    │
    ▼
Production

The production application is currently live on Vercel.

---

📁 Project Structure

velo/
│
├── app/
│   └── page.tsx
│
├── lib/
│   └── supabase.ts
│
├── public/
│
├── .env.local
├── package.json
├── tsconfig.json
└── README.md

---

📚 What This Project Demonstrates

VELO demonstrates practical experience with:

- Modern React development
- Next.js application development
- TypeScript
- Responsive UI design
- Authentication
- Database integration
- PostgreSQL
- CRUD operations
- E-commerce workflows
- Cart management
- Checkout logic
- Inventory management
- Order management
- Database security
- Row Level Security
- Git & GitHub
- Production builds
- Cloud deployment

---

🎯 Project Goals

The main goals of VELO were to:

- Build a realistic e-commerce application
- Practice full-stack web development
- Understand database-driven applications
- Implement authentication and authorization
- Build responsive interfaces
- Handle real-world shopping workflows
- Learn production deployment
- Create a portfolio-ready project

---

🔮 Future Improvements

Potential future improvements include:

- Online payment gateway
- Shipping provider integration
- Email notifications
- Advanced filtering
- Product image uploads
- Automated testing
- Advanced performance optimization
- Custom domain
- More advanced analytics

---

👨‍💻 Developer

Farhan Ali

BTech CSE Student | Web Developer

Interested in:

- Web Development
- Software Development
- Full-Stack Development
- DSA
- Building practical projects

Connect

GitHub:
https://github.com/Farhanali367

---

⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐.

---

📄 License

This project was created for learning, portfolio and development purposes.