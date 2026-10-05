"use client";


// VELO responsive production guard.
// Keeps wide children from creating accidental horizontal scrolling on small screens.
if (typeof document !== "undefined") {
  document.documentElement.style.overflowX = "hidden";
  document.body.style.overflowX = "hidden";
  document.body.style.maxWidth = "100vw";
}



import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Product = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  oldPrice: number;
  rating: number;
  tag: string;
  image: string;
  stock?: number;
};

type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
};

type Customer = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
};

type Review = {
  id: number;
  product_id: number;
  user_id: string;
  rating: number;
  review_text: string;
  created_at: string;
};

type ProductQuestion = {
  id: number;
  product_id: number;
  user_id: string;
  question: string;
  answer: string | null;
  answered_by: string | null;
  created_at: string;
  updated_at: string;
};

type NotificationItem = {
  id: number;
  user_id: string;
  title: string;
  message: string;
  type: string;
  order_id: string | null;
  is_read: boolean;
  created_at: string;
};

type AdminQuestion = ProductQuestion & {
  customer_name: string;
  customer_phone: string | null;
  product_name: string;
  product_image: string | null;
};

type Coupon = {
  id: number;
  code: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
};

type AdminReview = Review & {
  customer_name: string;
  customer_phone: string | null;
  product_name: string;
  product_image: string | null;
};

type Order = {
  id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  pin_code: string;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};

const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Nova X Pro Laptop",
    category: "Electronics",
    description: "Slim premium laptop for work, study and entertainment.",
    price: 74999,
    oldPrice: 89999,
    rating: 4.8,
    tag: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 2,
    name: "Aero ANC Headphones",
    category: "Electronics",
    description: "Immersive wireless audio with active noise cancellation.",
    price: 5999,
    oldPrice: 7999,
    rating: 4.7,
    tag: "TRENDING",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 3,
    name: "Pulse Smart Watch",
    category: "Watches",
    description: "Modern smartwatch with health and activity tracking.",
    price: 3499,
    oldPrice: 4999,
    rating: 4.6,
    tag: "NEW",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 4,
    name: "Orbit Wireless Mouse",
    category: "Accessories",
    description: "Quiet ergonomic mouse designed for productive days.",
    price: 1299,
    oldPrice: 1799,
    rating: 4.5,
    tag: "HOT",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 5,
    name: "Vertex Mechanical Keyboard",
    category: "Gaming",
    description: "Compact mechanical keyboard with satisfying tactile keys.",
    price: 4499,
    oldPrice: 5999,
    rating: 4.8,
    tag: "GAMING",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 6,
    name: "Urban Runner Sneakers",
    category: "Fashion",
    description: "Lightweight everyday sneakers with a clean silhouette.",
    price: 2899,
    oldPrice: 3999,
    rating: 4.6,
    tag: "LIMITED",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 7,
    name: "Classic Minimal Tee",
    category: "Fashion",
    description: "Premium cotton t-shirt made for everyday comfort.",
    price: 899,
    oldPrice: 1299,
    rating: 4.4,
    tag: "ESSENTIAL",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 8,
    name: "Metro Travel Backpack",
    category: "Bags",
    description: "Smart everyday backpack with organized laptop storage.",
    price: 2199,
    oldPrice: 2999,
    rating: 4.7,
    tag: "TRAVEL",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 9,
    name: "Aura Desk Lamp",
    category: "Home",
    description: "Warm ambient lighting for a calm modern workspace.",
    price: 1599,
    oldPrice: 2299,
    rating: 4.5,
    tag: "HOME",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 10,
    name: "Pure Skin Care Kit",
    category: "Beauty",
    description: "Simple daily skincare essentials in a premium kit.",
    price: 1999,
    oldPrice: 2699,
    rating: 4.6,
    tag: "SELF CARE",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 11,
    name: "Studio Bluetooth Speaker",
    category: "Electronics",
    description: "Portable speaker with rich sound and deep bass.",
    price: 2999,
    oldPrice: 3999,
    rating: 4.7,
    tag: "AUDIO",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 12,
    name: "Arc Gaming Controller",
    category: "Gaming",
    description: "Responsive wireless controller for long gaming sessions.",
    price: 3299,
    oldPrice: 4299,
    rating: 4.6,
    tag: "GAMING",
    image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 13,
    name: "Chrono Steel Watch",
    category: "Watches",
    description: "Classic stainless steel watch with a premium finish.",
    price: 4999,
    oldPrice: 6999,
    rating: 4.8,
    tag: "PREMIUM",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 14,
    name: "Cloud Comfort Hoodie",
    category: "Fashion",
    description: "Soft oversized hoodie for relaxed everyday styling.",
    price: 1799,
    oldPrice: 2499,
    rating: 4.5,
    tag: "COMFY",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 15,
    name: "Travel Organizer Set",
    category: "Travel",
    description: "Compact organizers that keep luggage clean and simple.",
    price: 999,
    oldPrice: 1499,
    rating: 4.4,
    tag: "TRAVEL",
    image: "https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 16,
    name: "Hydra Insulated Bottle",
    category: "Travel",
    description: "Double-wall insulated bottle for all-day hydration.",
    price: 899,
    oldPrice: 1299,
    rating: 4.6,
    tag: "DAILY",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 17,
    name: "Desk Mat Pro",
    category: "Accessories",
    description: "Large premium desk mat for a clean workstation.",
    price: 1199,
    oldPrice: 1699,
    rating: 4.5,
    tag: "DESK",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 18,
    name: "Sonic USB Microphone",
    category: "Electronics",
    description: "Plug-and-play microphone for calls, streams and content.",
    price: 3999,
    oldPrice: 5499,
    rating: 4.7,
    tag: "CREATOR",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 19,
    name: "Canvas Everyday Tote",
    category: "Bags",
    description: "Minimal tote bag with room for daily essentials.",
    price: 799,
    oldPrice: 1199,
    rating: 4.3,
    tag: "MINIMAL",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 20,
    name: "Glow Vanity Mirror",
    category: "Beauty",
    description: "Elegant LED mirror for a polished morning routine.",
    price: 2399,
    oldPrice: 3299,
    rating: 4.5,
    tag: "GLOW",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 21,
    name: "Nova Tablet Stand",
    category: "Accessories",
    description: "Adjustable stand for tablets, phones and desk setups.",
    price: 899,
    oldPrice: 1299,
    rating: 4.4,
    tag: "DESK",
    image: "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 22,
    name: "Pixel LED Strip",
    category: "Gaming",
    description: "Ambient RGB lighting for gaming rooms and desks.",
    price: 1499,
    oldPrice: 2199,
    rating: 4.5,
    tag: "RGB",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 23,
    name: "Essential Crossbody Bag",
    category: "Bags",
    description: "Compact crossbody with a refined everyday design.",
    price: 1299,
    oldPrice: 1899,
    rating: 4.4,
    tag: "STYLE",
    image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 24,
    name: "Active Smart Band",
    category: "Watches",
    description: "Lightweight fitness band with activity insights.",
    price: 1799,
    oldPrice: 2499,
    rating: 4.5,
    tag: "FITNESS",
    image: "https://images.unsplash.com/photo-1557935728-e6d1eaabe558?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 25,
    name: "Luxe Perfume Set",
    category: "Beauty",
    description: "Sophisticated fragrance set for special occasions.",
    price: 2499,
    oldPrice: 3499,
    rating: 4.7,
    tag: "LUXE",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 26,
    name: "Focus Webcam Pro",
    category: "Electronics",
    description: "Sharp video camera for meetings and streaming.",
    price: 4499,
    oldPrice: 5999,
    rating: 4.6,
    tag: "WORK",
    image: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 27,
    name: "Cozy Ceramic Mug",
    category: "Home",
    description: "Minimal ceramic mug for coffee, tea and slow mornings.",
    price: 499,
    oldPrice: 699,
    rating: 4.4,
    tag: "HOME",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 28,
    name: "Modern Cushion Set",
    category: "Home",
    description: "Soft decorative cushions that elevate living spaces.",
    price: 999,
    oldPrice: 1499,
    rating: 4.5,
    tag: "DECOR",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 29,
    name: "AirFlex Joggers",
    category: "Fashion",
    description: "Relaxed joggers made for movement and comfort.",
    price: 1299,
    oldPrice: 1899,
    rating: 4.5,
    tag: "ACTIVE",
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 30,
    name: "Urban Cap",
    category: "Fashion",
    description: "Clean everyday cap with a modern streetwear profile.",
    price: 699,
    oldPrice: 999,
    rating: 4.3,
    tag: "STYLE",
    image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 31,
    name: "GamePad RGB Dock",
    category: "Gaming",
    description: "Charging dock that keeps your gaming setup organized.",
    price: 1699,
    oldPrice: 2299,
    rating: 4.5,
    tag: "GAMING",
    image: "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 32,
    name: "Travel Neck Pillow",
    category: "Travel",
    description: "Memory foam support for comfortable long journeys.",
    price: 799,
    oldPrice: 1199,
    rating: 4.4,
    tag: "TRAVEL",
    image: "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 33,
    name: "Volt Power Bank",
    category: "Electronics",
    description: "High-capacity portable power for your daily devices.",
    price: 1999,
    oldPrice: 2799,
    rating: 4.6,
    tag: "POWER",
    image: "https://images.unsplash.com/photo-1609592424801-6e6f4f8e6c0c?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 34,
    name: "MagSafe Desk Charger",
    category: "Accessories",
    description: "Minimal wireless charging stand for a clutter-free desk.",
    price: 2299,
    oldPrice: 2999,
    rating: 4.6,
    tag: "CHARGE",
    image: "https://images.unsplash.com/photo-1609592424842-5e70f3b7f9c6?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 35,
    name: "Silk Glow Face Mask",
    category: "Beauty",
    description: "Comfort-focused self-care mask for relaxing evenings.",
    price: 699,
    oldPrice: 999,
    rating: 4.3,
    tag: "CARE",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 36,
    name: "Nordic Table Clock",
    category: "Home",
    description: "Minimal clock with a clean Scandinavian-inspired look.",
    price: 1099,
    oldPrice: 1599,
    rating: 4.4,
    tag: "HOME",
    image: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 37,
    name: "Leather Card Holder",
    category: "Accessories",
    description: "Slim card holder with a sophisticated everyday finish.",
    price: 899,
    oldPrice: 1299,
    rating: 4.5,
    tag: "PREMIUM",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 38,
    name: "Trail Runner Bottle",
    category: "Travel",
    description: "Durable lightweight bottle for workouts and adventures.",
    price: 749,
    oldPrice: 1099,
    rating: 4.4,
    tag: "ACTIVE",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 39,
    name: "Flex Laptop Sleeve",
    category: "Bags",
    description: "Protective laptop sleeve with a refined minimal finish.",
    price: 1199,
    oldPrice: 1699,
    rating: 4.6,
    tag: "TECH",
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 40,
    name: "Vision Gaming Monitor",
    category: "Gaming",
    description: "Fast immersive display for competitive gaming and media.",
    price: 15999,
    oldPrice: 19999,
    rating: 4.8,
    tag: "PRO",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 41,
    name: "Echo Earbuds",
    category: "Electronics",
    description: "Compact true wireless earbuds with punchy sound.",
    price: 2499,
    oldPrice: 3499,
    rating: 4.6,
    tag: "AUDIO",
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 42,
    name: "Daily Denim Jacket",
    category: "Fashion",
    description: "Classic denim layer with a modern relaxed fit.",
    price: 2299,
    oldPrice: 3299,
    rating: 4.5,
    tag: "DENIM",
    image: "https://images.unsplash.com/photo-1523205565295-f8e3c3a0a7b6?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 43,
    name: "Luna Bedside Lamp",
    category: "Home",
    description: "Soft bedside lighting for a warm relaxing atmosphere.",
    price: 1299,
    oldPrice: 1799,
    rating: 4.5,
    tag: "AMBIENT",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 44,
    name: "Elite Chronograph",
    category: "Watches",
    description: "Bold chronograph design with a premium metal case.",
    price: 6999,
    oldPrice: 8999,
    rating: 4.8,
    tag: "ELITE",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 45,
    name: "Weekend Duffle",
    category: "Bags",
    description: "Spacious weekend bag for short trips and gym days.",
    price: 2499,
    oldPrice: 3499,
    rating: 4.7,
    tag: "WEEKEND",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 46,
    name: "GameZone Headset",
    category: "Gaming",
    description: "Low-latency headset with a comfortable gaming fit.",
    price: 2999,
    oldPrice: 3999,
    rating: 4.6,
    tag: "GAMING",
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 47,
    name: "Silk Essential Scarf",
    category: "Fashion",
    description: "Soft premium scarf designed for effortless styling.",
    price: 999,
    oldPrice: 1499,
    rating: 4.4,
    tag: "STYLE",
    image: "https://images.unsplash.com/photo-1601924928376-4d4d0e6d9b9a?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 48,
    name: "Smart Aroma Diffuser",
    category: "Home",
    description: "Elegant diffuser that adds a calm atmosphere to your room.",
    price: 1899,
    oldPrice: 2699,
    rating: 4.5,
    tag: "WELLNESS",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 49,
    name: "Glow Makeup Organizer",
    category: "Beauty",
    description: "Clear compact organizer for a tidy beauty setup.",
    price: 899,
    oldPrice: 1299,
    rating: 4.4,
    tag: "ORGANIZE",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: 50,
    name: "Pro Travel Case",
    category: "Travel",
    description: "Protective travel case for chargers, cables and essentials.",
    price: 1099,
    oldPrice: 1599,
    rating: 4.6,
    tag: "TRAVEL",
    image: "https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=1200&q=90",
  },
];

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Home",
  "Beauty",
  "Travel",
  "Gaming",
  "Accessories",
  "Watches",
  "Bags",
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<number[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [liked, setLiked] = useState<number[]>([]);
  const [showWishlist, setShowWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistBusyId, setWishlistBusyId] = useState<number | null>(null);
  const [sort, setSort] = useState("featured");
  const [notice, setNotice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<number[]>([]);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [productQuestions, setProductQuestions] = useState<ProductQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [questionSaving, setQuestionSaving] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "reset">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authCooldown, setAuthCooldown] = useState(0);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");

  const [showOrders, setShowOrders] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [flashSaleEndsAt, setFlashSaleEndsAt] = useState(0);
  const [flashSaleNow, setFlashSaleNow] = useState(() => Date.now());
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminStatusFilter, setAdminStatusFilter] = useState("all");
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminCustomerCount, setAdminCustomerCount] = useState(0);
  const [adminUpdating, setAdminUpdating] = useState(false);
  const [adminAnalyticsRange, setAdminAnalyticsRange] = useState<"today" | "7" | "30" | "all">("30");
  const [adminSection, setAdminSection] = useState<"overview" | "reports" | "loyalty" | "customers" | "products" | "inventory" | "reviews" | "questions" | "coupons">("overview");
  const [adminInventorySearch, setAdminInventorySearch] = useState("");
  const [adminInventorySavingId, setAdminInventorySavingId] = useState<number | null>(null);
  const [adminCustomerSearch, setAdminCustomerSearch] = useState("");
  const [adminLoyaltySearch, setAdminLoyaltySearch] = useState("");
  const [adminReviews, setAdminReviews] = useState<AdminReview[]>([]);
  const [adminReviewSearch, setAdminReviewSearch] = useState("");
  const [adminReviewRatingFilter, setAdminReviewRatingFilter] = useState("all");
  const [adminReviewDeleting, setAdminReviewDeleting] = useState<number | null>(null);
  const [adminQuestions, setAdminQuestions] = useState<AdminQuestion[]>([]);
  const [adminQuestionSearch, setAdminQuestionSearch] = useState("");
  const [adminQuestionSaving, setAdminQuestionSaving] = useState<number | null>(null);
  const [adminQuestionDeleting, setAdminQuestionDeleting] = useState<number | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponSearch, setCouponSearch] = useState("");
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponEditingId, setCouponEditingId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<"percentage" | "flat">("percentage");
  const [couponValue, setCouponValue] = useState("");
  const [couponMinOrder, setCouponMinOrder] = useState("0");
  const [couponMaxDiscount, setCouponMaxDiscount] = useState("");
  const [couponExpiry, setCouponExpiry] = useState("");
  const [couponUsageLimit, setCouponUsageLimit] = useState("");
  const [couponActive, setCouponActive] = useState(true);
  const [adminCustomers, setAdminCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Live catalog / admin product management
  // Keep the complete fallback catalog while Supabase loads the live catalog.
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [productsLoading, setProductsLoading] = useState(true);
  const [adminProductSearch, setAdminProductSearch] = useState("");
  const [adminProductSaving, setAdminProductSaving] = useState(false);
  const [adminProductEditingId, setAdminProductEditingId] = useState<number | null>(null);
  const [adminProductName, setAdminProductName] = useState("");
  const [adminProductCategory, setAdminProductCategory] = useState("Electronics");
  const [adminProductPrice, setAdminProductPrice] = useState("");
  const [adminProductStock, setAdminProductStock] = useState("10");
  const [adminProductImage, setAdminProductImage] = useState("");
  const [adminProductDescription, setAdminProductDescription] = useState("");

  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("Mumbai");
  const [deliveryPin, setDeliveryPin] = useState("");

  const [newsletterEmail, setNewsletterEmail] = useState("");

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const showAuthNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNotifications([]);
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("id, user_id, title, message, type, order_id, is_read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      setNotifications((data || []) as NotificationItem[]);
    } catch (error) {
      console.error("VELO notifications load error:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const createNotification = async (payload: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    orderId?: string | null;
  }) => {
    try {
      await supabase.from("notifications").insert({
        user_id: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type || "general",
        order_id: payload.orderId || null,
      });
    } catch (error) {
      console.error("VELO notification create error:", error);
    }
  };

  const markNotificationRead = async (id: number) => {
    const notification = notifications.find((item) => item.id === id);
    if (!notification || notification.is_read) return;
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item));
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    if (error) {
      setNotifications((current) => current.map((item) => item.id === id ? { ...item, is_read: false } : item));
    }
  };

  const markAllNotificationsRead = async () => {
    const unreadIds = notifications.filter((item) => !item.is_read).map((item) => item.id);
    if (!unreadIds.length) return;
    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    if (error) await loadNotifications();
  };

  const clearNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("notifications").delete().eq("user_id", user.id);
    if (!error) setNotifications([]);
  };

  const unreadNotificationCount = notifications.filter((item) => !item.is_read).length;

  const resetAdminProductForm = () => {
    setAdminProductEditingId(null);
    setAdminProductName("");
    setAdminProductCategory("Electronics");
    setAdminProductPrice("");
    setAdminProductStock("10");
    setAdminProductImage("");
    setAdminProductDescription("");
  };

  const refreshLiveProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, price, image_url, description, stock")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const databaseProducts: Product[] = (data || []).map((item, index) => {
        const price = Number(item.price) || 0;
        const image = item.image_url || fallbackProducts[index % fallbackProducts.length]?.image || "";
        return {
          id: Number(item.id),
          name: item.name,
          category: item.category,
          description: item.description || "Premium product selected by VELO.",
          price,
          oldPrice: Math.round(price * 1.2),
          rating: 4.5 + ((index % 4) * 0.1),
          tag: index === 0 ? "NEW" : index === 1 ? "TRENDING" : "FEATURED",
          image: image.includes("?") ? image : `${image}?auto=format&fit=crop&w=1200&q=90`,
          stock: Number(item.stock) || 0,
        };
      });

      setProducts(databaseProducts.length ? databaseProducts : fallbackProducts);
    } catch (error) {
      console.error("VELO products refresh error:", error);
      showAuthNotice("Products could not be refreshed.");
    }
  };

  const startAdminProductEdit = (product: Product) => {
    setAdminProductEditingId(product.id);
    setAdminProductName(product.name);
    setAdminProductCategory(product.category);
    setAdminProductPrice(String(product.price));
    setAdminProductStock(String(product.stock ?? 0));
    setAdminProductImage(product.image.split("?")[0]);
    setAdminProductDescription(product.description);
    window.setTimeout(() => {
      document.getElementById("admin-product-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const saveAdminProduct = async () => {
    if (adminProductSaving) return;

    const name = adminProductName.trim();
    const category = adminProductCategory.trim();
    const price = Number(adminProductPrice);
    const stock = Number(adminProductStock);
    const imageUrl = adminProductImage.trim();
    const description = adminProductDescription.trim();

    if (name.length < 2) {
      showAuthNotice("Enter a valid product name.");
      return;
    }
    if (!category) {
      showAuthNotice("Select a product category.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      showAuthNotice("Enter a valid product price.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      showAuthNotice("Stock must be a whole number.");
      return;
    }

    setAdminProductSaving(true);
    try {
      const payload = {
        name,
        category,
        price,
        stock,
        image_url: imageUrl || null,
        description: description || "Premium product selected by VELO.",
      };

      if (adminProductEditingId !== null) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", adminProductEditingId);
        if (error) throw error;
        showAuthNotice("Product updated successfully. ✓");
      } else {
        const { error } = await supabase
          .from("products")
          .insert(payload);
        if (error) throw error;
        showAuthNotice("Product added successfully. ✓");
      }

      resetAdminProductForm();
      await refreshLiveProducts();
    } catch (error) {
      console.error("VELO product save error:", error);
      showAuthNotice("We couldn't save this product. Check admin permissions.");
    } finally {
      setAdminProductSaving(false);
    }
  };

  const deleteAdminProduct = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) throw error;

      if (adminProductEditingId === product.id) resetAdminProductForm();
      await refreshLiveProducts();
      showAuthNotice("Product deleted successfully.");
    } catch (error) {
      console.error("VELO product delete error:", error);
      showAuthNotice("This product may be linked to an order and cannot be deleted.");
    }
  };

  const updateAdminInventoryStock = async (product: Product, nextStock: number) => {
    if (adminInventorySavingId !== null) return;
    if (!Number.isInteger(nextStock) || nextStock < 0) {
      showAuthNotice("Stock must be a whole number.");
      return;
    }

    setAdminInventorySavingId(product.id);
    try {
      const { error } = await supabase
        .from("products")
        .update({ stock: nextStock })
        .eq("id", product.id);
      if (error) throw error;

      setProducts((current) =>
        current.map((item) => item.id === product.id ? { ...item, stock: nextStock } : item)
      );
      showAuthNotice(`${product.name} stock updated to ${nextStock}. ✓`);
    } catch (error) {
      console.error("VELO inventory update error:", error);
      showAuthNotice("We couldn't update this stock level.");
    } finally {
      setAdminInventorySavingId(null);
    }
  };

  const adminFilteredProducts = useMemo(() => {
    const query = adminProductSearch.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      [product.name, product.category, product.description]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [products, adminProductSearch]);

  const resetAuthForm = () => {
    setAuthName("");
    setAuthEmail("");
    setAuthPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setPasswordRecovery(false);
  };

  const normalizeEmail = (value: string) => value.trim().toLowerCase();

  useEffect(() => {
    const timer = window.setInterval(() => {
      refreshLiveProducts();
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const key = "velo_flash_sale_end_v1";
    const stored = Number(window.localStorage.getItem(key) || 0);
    const end = stored > Date.now() ? stored : Date.now() + 6 * 60 * 60 * 1000;
    window.localStorage.setItem(key, String(end));
    setFlashSaleEndsAt(end);
    const timer = window.setInterval(() => setFlashSaleNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const passwordChecks = useMemo(
    () => ({
      length: authPassword.length >= 12,
      upper: /[A-Z]/.test(authPassword),
      lower: /[a-z]/.test(authPassword),
      number: /\d/.test(authPassword),
      special: /[^A-Za-z0-9]/.test(authPassword),
    }),
    [authPassword]
  );

  const strongPassword = Object.values(passwordChecks).every(Boolean);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, category, price, image_url, description, stock")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!mounted) return;

        const databaseProducts: Product[] = (data || []).map((item, index) => {
          const price = Number(item.price) || 0;
          const image = item.image_url || fallbackProducts[index % fallbackProducts.length]?.image || "";
          return {
            id: Number(item.id),
            name: item.name,
            category: item.category,
            description: item.description || "Premium product selected by VELO.",
            price,
            oldPrice: Math.round(price * 1.2),
            rating: 4.5 + ((index % 4) * 0.1),
            tag: index === 0 ? "NEW" : index === 1 ? "TRENDING" : "FEATURED",
            image: image.includes("?") ? image : `${image}?auto=format&fit=crop&w=1200&q=90`,
            stock: Number(item.stock) || 0,
          };
        });

        setProducts(databaseProducts.length ? databaseProducts : fallbackProducts);
      } catch (error) {
        console.error("VELO live products load error:", error);
        if (mounted) {
          setProducts(fallbackProducts);
          showAuthNotice("Live products couldn't load. Showing demo products.");
        }
      } finally {
        if (mounted) setProductsLoading(false);
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setLoggedIn(Boolean(session?.user));

      if (session?.user) {
        setAuthEmail(session.user.email ?? "");
        setDeliveryName(
          session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            ""
        );
        await loadWishlistForUser(session.user.id);
        await loadNotifications();
      } else {
        try {
          const raw = window.localStorage.getItem("velo_wishlist");
          const parsed = raw ? JSON.parse(raw) : [];
          setLiked(Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : []);
        } catch {
          setLiked([]);
        }
      }
    };

    loadSession();

    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      setIsAdmin(data?.role === "admin");
    };

    checkAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      setLoggedIn(Boolean(session?.user));

      if (session?.user?.email) {
        setAuthEmail(session.user.email);
      }

      if (session?.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => setIsAdmin(data?.role === "admin"));
        loadWishlistForUser(session.user.id);
        loadNotifications();
      } else {
        setNotifications([]);
        setShowNotifications(false);
        setIsAdmin(false);
        setShowAdmin(false);
        setLiked([]);
      }

      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
        setAuthMode("reset");
        setShowAuth(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setAuthCooldown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [authCooldown]);

  const handleAuth = async () => {
    if (authLoading || authCooldown > 0) return;

    const email = normalizeEmail(authEmail);

    if (!emailPattern.test(email)) {
      showAuthNotice("Please enter a valid email address.");
      return;
    }

    setAuthLoading(true);

    try {
      if (passwordRecovery) {
        if (!strongPassword) {
          showAuthNotice("Use a strong 12+ character password.");
          return;
        }

        if (authPassword !== confirmPassword) {
          showAuthNotice("New password and confirmation do not match.");
          return;
        }

        const { error } = await supabase.auth.updateUser({
          password: authPassword,
        });

        if (error) throw error;

        showAuthNotice("Password updated successfully. ✓");
        setPasswordRecovery(false);
        setAuthMode("login");
        setAuthPassword("");
        setConfirmPassword("");
        setShowAuth(false);
        return;
      }

      if (authMode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`,
        });

        if (error) throw error;

        showAuthNotice("If the account exists, a reset link has been sent.");
        setAuthCooldown(30);
        return;
      }

      if (authMode === "signup") {
        const cleanName = authName.trim().replace(/\s+/g, " ");

        if (cleanName.length < 2) {
          showAuthNotice("Please enter your full name.");
          return;
        }

        if (!strongPassword) {
          showAuthNotice("Create a strong 12+ character password.");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password: authPassword,
          options: {
            data: {
              full_name: cleanName,
            },
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        setAuthCooldown(10);

        if (data.session) {
          setLoggedIn(true);
          setShowAuth(false);
          showAuthNotice("Account created successfully. ✓");
        } else {
          showAuthNotice(
            "Account created. Please verify your email before signing in."
          );
          setAuthMode("login");
          setAuthPassword("");
        }

        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: authPassword,
      });

      if (error) throw error;

      if (!data.user?.email_confirmed_at) {
        showAuthNotice("Please verify your email before continuing.");
        await supabase.auth.signOut();
        return;
      }

      setLoggedIn(true);
      setShowAuth(false);
      setAuthPassword("");
      setAuthCooldown(5);
      showAuthNotice("Welcome back to VELO. ✓");
    } catch (error) {
      const message =
        error instanceof Error ? error.message.toLowerCase() : "";

      if (
        message.includes("invalid login") ||
        message.includes("invalid credentials")
      ) {
        showAuthNotice("Email or password is incorrect.");
      } else if (message.includes("email not confirmed")) {
        showAuthNotice("Please verify your email before signing in.");
      } else if (message.includes("rate limit")) {
        showAuthNotice("Too many attempts. Please wait and try again.");
        setAuthCooldown(30);
      } else if (message.includes("already registered")) {
        showAuthNotice("This email is already registered. Try signing in.");
      } else {
        showAuthNotice("Authentication failed. Please try again.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      showAuthNotice("We couldn't sign you out. Please try again.");
      return;
    }

    setLoggedIn(false);
    setShowProfile(false);
    setShowOrders(false);
    setSelectedOrder(null);
    setShowAdmin(false);
    setIsAdmin(false);
    setShowWishlist(false);
    setShowNotifications(false);
    setNotifications([]);
    setLiked([]);
    try { window.localStorage.removeItem("velo_wishlist"); } catch {}
    resetAuthForm();
    showAuthNotice("You have been logged out. ✓");
  };

  const loadProfile = async () => {
    setProfileLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showAuthNotice("Please sign in to view your profile.");
        setShowProfile(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url, role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      setIsAdmin(data?.role === "admin");

      setProfileName(
        data?.full_name || user.user_metadata?.full_name || ""
      );
      setProfilePhone(data?.phone || "");
      setProfileAvatar(data?.avatar_url || "");

      setDeliveryName(
        data?.full_name || user.user_metadata?.full_name || ""
      );
      setDeliveryPhone(data?.phone || "");
    } catch {
      showAuthNotice("Unable to load your profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const openProfile = async () => {
    if (!loggedIn) {
      setAuthMode("login");
      setPasswordRecovery(false);
      setShowAuth(true);
      return;
    }

    setShowProfile(true);
    await loadProfile();
  };

  const saveProfile = async () => {
    if (profileSaving) return;

    setProfileSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showAuthNotice("Your session has expired. Please sign in again.");
        setShowProfile(false);
        return;
      }

      const cleanName = profileName.trim().replace(/\s+/g, " ");
      const cleanPhone = profilePhone.trim();
      const cleanAvatar = profileAvatar.trim();

      if (!cleanName) {
        showAuthNotice("Please enter your full name.");
        return;
      }

      if (cleanPhone && !/^\+?[0-9\s-]{10,16}$/.test(cleanPhone)) {
        showAuthNotice("Please enter a valid phone number.");
        return;
      }

      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: cleanName,
          phone: cleanPhone || null,
          avatar_url: cleanAvatar || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      if (error) throw error;

      setDeliveryName(cleanName);
      setDeliveryPhone(cleanPhone);
      showAuthNotice("Profile updated successfully. ✓");
    } catch {
      showAuthNotice("We couldn't update your profile. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const categoryMatch =
        selectedCategory === "All" || product.category === selectedCategory;

      const searchMatch =
        !query ||
        `${product.name} ${product.category} ${product.description}`
          .toLowerCase()
          .includes(query);

      return categoryMatch && searchMatch;
    });

    if (sort === "low") {
      return [...result].sort((a, b) => a.price - b.price);
    }

    if (sort === "high") {
      return [...result].sort((a, b) => b.price - a.price);
    }

    if (sort === "rating") {
      return [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [selectedCategory, search, sort]);

  const flashSaleActive = flashSaleEndsAt > flashSaleNow;
  const flashSaleProductIds = useMemo(() => new Set(products.slice(0, 6).map((product) => product.id)), [products]);

  const getFlashSalePercent = (product: Product) => 15 + (Math.abs(product.id) % 3) * 5;
  const getSalePrice = (product: Product) => {
    if (!flashSaleActive || !flashSaleProductIds.has(product.id)) return product.price;
    return Math.max(1, Math.round(product.price * (1 - getFlashSalePercent(product) / 100)));
  };

  const formatFlashSaleTime = () => {
    const seconds = Math.max(0, Math.floor((flashSaleEndsAt - flashSaleNow) / 1000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const cartProducts = useMemo(
    () => cart.map((id) => products.find((product) => product.id === id)).filter(Boolean) as Product[],
    [cart]
  );

  const cartCount = cart.length;

  const getQuantity = (id: number) =>
    cart.filter((cartId) => cartId === id).length;

  const cartSubtotal = cartProducts.reduce(
    (sum, product) => sum + getSalePrice(product),
    0
  );

  const cartSavings = cartProducts.reduce(
    (sum, product) => sum + Math.max(0, product.oldPrice - getSalePrice(product)),
    0
  );

  const delivery = cartSubtotal === 0 || cartSubtotal >= 999 ? 0 : 79;
  const automaticDiscount = cartSubtotal >= 5000 ? Math.round(cartSubtotal * 0.05) : 0;
  const discount = automaticDiscount + couponDiscount;
  const cartTotal = Math.max(0, cartSubtotal + delivery - discount);

  const resetCouponForm = () => {
    setCouponEditingId(null);
    setCouponCode("");
    setCouponType("percentage");
    setCouponValue("");
    setCouponMinOrder("0");
    setCouponMaxDiscount("");
    setCouponExpiry("");
    setCouponUsageLimit("");
    setCouponActive(true);
  };

  const applyCoupon = async () => {
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) {
      showAuthNotice("Enter a coupon code.");
      return;
    }
    if (cartSubtotal <= 0) {
      showAuthNotice("Add products before applying a coupon.");
      return;
    }
    setCouponApplying(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("id, code, discount_type, discount_value, min_order_amount, max_discount_amount, expires_at, usage_limit, used_count, is_active, created_at")
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("invalid");
      const coupon = data as Coupon;
      if (coupon.expires_at && new Date(coupon.expires_at) <= new Date()) throw new Error("expired");
      if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) throw new Error("limit");
      if (cartSubtotal < Number(coupon.min_order_amount || 0)) throw new Error(`min:${coupon.min_order_amount}`);
      let value = coupon.discount_type === "percentage"
        ? Math.round((cartSubtotal * Number(coupon.discount_value)) / 100)
        : Number(coupon.discount_value);
      if (coupon.max_discount_amount !== null) value = Math.min(value, Number(coupon.max_discount_amount));
      value = Math.max(0, Math.min(value, cartSubtotal));
      if (!value) throw new Error("zero");
      setAppliedCoupon(coupon);
      setCouponDiscount(value);
      setCouponCodeInput(coupon.code);
      showAuthNotice(`${coupon.code} applied — you save ₹${value.toLocaleString("en-IN")}. ✓`);
    } catch (error: any) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      const message = error?.message?.startsWith("min:")
        ? `Minimum order for this coupon is ₹${Number(error.message.split(":")[1]).toLocaleString("en-IN")}.`
        : error?.message === "expired" ? "This coupon has expired."
        : error?.message === "limit" ? "This coupon has reached its usage limit."
        : "Invalid or unavailable coupon code.";
      showAuthNotice(message);
    } finally {
      setCouponApplying(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCodeInput("");
    showAuthNotice("Coupon removed.");
  };

  const saveAdminCoupon = async () => {
    if (couponSaving) return;
    const code = couponCode.trim().toUpperCase();
    const value = Number(couponValue);
    const minOrder = Number(couponMinOrder || 0);
    const maxDiscount = couponMaxDiscount.trim() ? Number(couponMaxDiscount) : null;
    const usageLimit = couponUsageLimit.trim() ? Number(couponUsageLimit) : null;
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) { showAuthNotice("Use a valid coupon code (3–30 letters/numbers)."); return; }
    if (!Number.isFinite(value) || value <= 0 || (couponType === "percentage" && value > 100)) { showAuthNotice("Enter a valid discount value."); return; }
    if (!Number.isFinite(minOrder) || minOrder < 0) { showAuthNotice("Enter a valid minimum order."); return; }
    if (maxDiscount !== null && (!Number.isFinite(maxDiscount) || maxDiscount <= 0)) { showAuthNotice("Enter a valid maximum discount."); return; }
    if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit <= 0)) { showAuthNotice("Usage limit must be a positive whole number."); return; }
    setCouponSaving(true);
    try {
      const payload = {
        code, discount_type: couponType, discount_value: value, min_order_amount: minOrder,
        max_discount_amount: maxDiscount, expires_at: couponExpiry ? new Date(couponExpiry).toISOString() : null,
        usage_limit: usageLimit, is_active: couponActive, updated_at: new Date().toISOString(),
      };
      const result = couponEditingId === null
        ? await supabase.from("coupons").insert(payload)
        : await supabase.from("coupons").update(payload).eq("id", couponEditingId);
      if (result.error) throw result.error;
      showAuthNotice(couponEditingId === null ? "Coupon created successfully. ✓" : "Coupon updated successfully. ✓");
      resetCouponForm();
      await loadAdminOrders();
    } catch (error) {
      console.error("VELO coupon save error:", error);
      showAuthNotice("Could not save coupon. Code may already exist.");
    } finally { setCouponSaving(false); }
  };

  const editAdminCoupon = (coupon: Coupon) => {
    setCouponEditingId(coupon.id);
    setCouponCode(coupon.code);
    setCouponType(coupon.discount_type);
    setCouponValue(String(coupon.discount_value));
    setCouponMinOrder(String(coupon.min_order_amount || 0));
    setCouponMaxDiscount(coupon.max_discount_amount === null ? "" : String(coupon.max_discount_amount));
    setCouponExpiry(coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0,16) : "");
    setCouponUsageLimit(coupon.usage_limit === null ? "" : String(coupon.usage_limit));
    setCouponActive(coupon.is_active);
  };

  const deleteAdminCoupon = async (id: number) => {
    if (!window.confirm("Delete this coupon?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) { showAuthNotice("Could not delete this coupon."); return; }
    setCoupons((current) => current.filter((coupon) => coupon.id !== id));
    showAuthNotice("Coupon deleted successfully.");
  };

  const getStockState = (product?: Product) => {
    if (!product || product.stock === undefined) return { label: "IN STOCK", tone: "healthy", disabled: false };
    const stock = Number(product.stock);
    if (stock <= 0) return { label: "OUT OF STOCK", tone: "out", disabled: true };
    if (stock <= 3) return { label: `ONLY ${stock} LEFT`, tone: "urgent", disabled: false };
    if (stock <= 5) return { label: "LOW STOCK", tone: "low", disabled: false };
    return { label: "IN STOCK", tone: "healthy", disabled: false };
  };

  const addToCart = (id: number) => {
    const product = products.find((item) => item.id === id);
    const stockState = getStockState(product);
    if (stockState.disabled) {
      showAuthNotice("This product is currently out of stock.");
      return;
    }
    const currentQuantity = cart.filter((cartId) => cartId === id).length;
    if (product?.stock !== undefined && currentQuantity >= Number(product.stock)) {
      showAuthNotice(`Only ${product.stock} item${Number(product.stock) === 1 ? "" : "s"} available.`);
      return;
    }
    setCart((current) => [...current, id]);
    showAuthNotice("Added to cart ✓");
  };

  const increaseQuantity = (id: number) => {
    const product = products.find((item) => item.id === id);
    if (product?.stock !== undefined) {
      const currentQuantity = cart.filter((cartId) => cartId === id).length;
      if (currentQuantity >= Number(product.stock)) {
        showAuthNotice(`Only ${product.stock} item${Number(product.stock) === 1 ? "" : "s"} available.`);
        return;
      }
    }
    setCart((current) => [...current, id]);
  };

  const decreaseQuantity = (id: number) => {
    setCart((current) => {
      const index = current.indexOf(id);
      if (index === -1) return current;

      const next = [...current];
      next.splice(index, 1);
      return next;
    });
  };

  const removeAllOfProduct = (id: number) => {
    setCart((current) => current.filter((cartId) => cartId !== id));
  };

  const saveGuestWishlist = (ids: number[]) => {
    try {
      window.localStorage.setItem("velo_wishlist", JSON.stringify(ids));
    } catch {
      // Ignore storage failures and keep the in-memory wishlist working.
    }
  };

  const loadWishlistForUser = async (userId: string) => {
    setWishlistLoading(true);
    try {
      const localIds = (() => {
        try {
          const raw = window.localStorage.getItem("velo_wishlist");
          const parsed = raw ? JSON.parse(raw) : [];
          return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : [];
        } catch {
          return [];
        }
      })();

      const { data, error } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", userId);

      if (error) throw error;

      const remoteIds = (data || []).map((row) => Number(row.product_id)).filter(Number.isFinite);
      const mergedIds = Array.from(new Set([...remoteIds, ...localIds]));

      if (localIds.length) {
        const rows = localIds.map((productId) => ({ user_id: userId, product_id: productId }));
        const { error: syncError } = await supabase.from("wishlist").upsert(rows, { onConflict: "user_id,product_id", ignoreDuplicates: true });
        if (syncError) console.warn("VELO wishlist sync warning:", syncError);
        try { window.localStorage.removeItem("velo_wishlist"); } catch {}
      }

      setLiked(mergedIds);
    } catch (error) {
      console.error("VELO wishlist load error:", error);
      try {
        const raw = window.localStorage.getItem("velo_wishlist");
        const parsed = raw ? JSON.parse(raw) : [];
        setLiked(Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : []);
      } catch {
        setLiked([]);
      }
      showAuthNotice("Wishlist could not sync right now. Your saved items are still available on this device.");
    } finally {
      setWishlistLoading(false);
    }
  };

  const toggleLike = async (id: number) => {
    const currentlyLiked = liked.includes(id);
    setWishlistBusyId(id);

    try {
      if (!loggedIn) {
        const next = currentlyLiked
          ? liked.filter((item) => item !== id)
          : [...liked, id];
        setLiked(next);
        saveGuestWishlist(next);
        showAuthNotice(currentlyLiked ? "Removed from wishlist." : "Saved to wishlist. ♥");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoggedIn(false);
        showAuthNotice("Please sign in to sync your wishlist.");
        return;
      }

      if (currentlyLiked) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", id);
        if (error) throw error;
        setLiked((current) => current.filter((item) => item !== id));
        showAuthNotice("Removed from wishlist.");
      } else {
        const { error } = await supabase
          .from("wishlist")
          .upsert({ user_id: user.id, product_id: id }, { onConflict: "user_id,product_id", ignoreDuplicates: true });
        if (error) throw error;
        setLiked((current) => current.includes(id) ? current : [...current, id]);
        showAuthNotice("Saved to wishlist. ♥");
      }
    } catch (error) {
      console.error("VELO wishlist update error:", error);
      showAuthNotice("We couldn't update your wishlist. Please try again.");
    } finally {
      setWishlistBusyId(null);
    }
  };

  const removeFromWishlist = (id: number) => toggleLike(id);

  const addWishlistItemToCart = (id: number) => {
    const product = products.find((item) => item.id === id);
    if (!product) {
      showAuthNotice("This product is no longer available.");
      return;
    }
    addToCart(id);
    showAuthNotice(`${product.name} added to cart. ✓`);
  };

  const addAllWishlistToCart = () => {
    const availableIds = liked.filter((id) => products.some((product) => product.id === id));
    if (!availableIds.length) {
      showAuthNotice("Your wishlist is empty.");
      return;
    }
    setCart((current) => [...current, ...availableIds]);
    showAuthNotice(`${availableIds.length} wishlist item${availableIds.length > 1 ? "s" : ""} added to cart. ✓`);
  };

  const scrollToProducts = () => {
    document
      .getElementById("products")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNewsletter = () => {
    if (!emailPattern.test(normalizeEmail(newsletterEmail))) {
      showAuthNotice("Please enter a valid email address.");
      return;
    }

    setNewsletterEmail("");
    showAuthNotice("Thanks for joining VELO. ✓");
  };

  const loadProductReviews = async (productId: number) => {
    setReviewsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, product_id, user_id, rating, review_text, created_at")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProductReviews((data || []) as Review[]);
    } catch (error) {
      console.error("VELO reviews load error:", error);
      setProductReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadProductQuestions = async (productId: number) => {
    setQuestionsLoading(true);
    try {
      const { data, error } = await supabase
        .from("product_questions")
        .select("id, product_id, user_id, question, answer, answered_by, created_at, updated_at")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProductQuestions((data || []) as ProductQuestion[]);
    } catch (error) {
      console.error("VELO questions load error:", error);
      setProductQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };


  useEffect(() => {
    if (!selectedProduct) {
      setProductReviews([]);
      setReviewText("");
      setReviewRating(5);
      setQuestionText("");
      setProductQuestions([]);
      return;
    }

    loadProductReviews(selectedProduct.id);
    loadProductQuestions(selectedProduct.id);
  }, [selectedProduct]);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("velo-recently-viewed") || "[]");
      if (Array.isArray(saved)) setRecentlyViewedIds(saved.filter((id) => Number.isFinite(Number(id))).map(Number).slice(0, 8));
    } catch {
      setRecentlyViewedIds([]);
    }
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    setRecentlyViewedIds((current) => {
      const next = [selectedProduct.id, ...current.filter((id) => id !== selectedProduct.id)].slice(0, 8);
      try { window.localStorage.setItem("velo-recently-viewed", JSON.stringify(next)); } catch {}
      return next;
    });
  }, [selectedProduct]);

  const recommendedProducts = useMemo(() => {
    const recent = recentlyViewedIds
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean) as Product[];
    const sourceCategory = selectedProduct?.category || recent[0]?.category;
    const sameCategory = products.filter((product) => product.category === sourceCategory && product.id !== selectedProduct?.id);
    const fallback = products.filter((product) => product.id !== selectedProduct?.id && !sameCategory.some((item) => item.id === product.id));
    const merged = [...sameCategory, ...recent, ...fallback];
    const unique: Product[] = [];
    const seen = new Set<number>();
    for (const product of merged) {
      if (!seen.has(product.id) && product.id !== selectedProduct?.id) {
        seen.add(product.id);
        unique.push(product);
      }
      if (unique.length >= 4) break;
    }
    return unique;
  }, [products, recentlyViewedIds, selectedProduct]);

  const submitProductQuestion = async () => {
    if (questionSaving || !selectedProduct) return;
    if (!loggedIn) {
      setAuthMode("login");
      setPasswordRecovery(false);
      setShowAuth(true);
      showAuthNotice("Please sign in to ask a question.");
      return;
    }
    const text = questionText.trim();
    if (text.length < 5) {
      showAuthNotice("Please write at least 5 characters.");
      return;
    }
    if (text.length > 300) {
      showAuthNotice("Question is too long. Keep it under 300 characters.");
      return;
    }
    setQuestionSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setShowAuth(true);
        showAuthNotice("Please sign in again to ask a question.");
        return;
      }
      const { error } = await supabase.from("product_questions").insert({
        product_id: selectedProduct.id,
        user_id: user.id,
        question: text,
      });
      if (error) throw error;
      setQuestionText("");
      await loadProductQuestions(selectedProduct.id);
      showAuthNotice("Question posted. ✓");
    } catch (error) {
      console.error("VELO question save error:", error);
      showAuthNotice("We couldn't post your question right now.");
    } finally {
      setQuestionSaving(false);
    }
  };

  const deleteProductQuestion = async (question: ProductQuestion) => {
    if (!loggedIn) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== question.user_id) return;
    if (!window.confirm("Delete your question?")) return;
    try {
      const { error } = await supabase.from("product_questions").delete().eq("id", question.id).eq("user_id", user.id);
      if (error) throw error;
      showAuthNotice("Question deleted.");
      if (selectedProduct) await loadProductQuestions(selectedProduct.id);
    } catch (error) {
      console.error("VELO question delete error:", error);
      showAuthNotice("We couldn't delete the question.");
    }
  };

  const submitProductReview = async () => {
    if (reviewSaving || !selectedProduct) return;

    if (!loggedIn) {
      setAuthMode("login");
      setPasswordRecovery(false);
      setShowAuth(true);
      showAuthNotice("Please sign in to write a review.");
      return;
    }

    const text = reviewText.trim();
    if (text.length < 5) {
      showAuthNotice("Please write at least 5 characters.");
      return;
    }
    if (text.length > 500) {
      showAuthNotice("Review is too long. Keep it under 500 characters.");
      return;
    }

    setReviewSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setShowAuth(true);
        showAuthNotice("Please sign in again to write a review.");
        return;
      }

      const { data: existing, error: existingError } = await supabase
        .from("reviews")
        .select("id")
        .eq("product_id", selectedProduct.id)
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (existingError) throw existingError;

      const payload = {
        product_id: selectedProduct.id,
        user_id: user.id,
        rating: reviewRating,
        review_text: text,
      };

      if (existing?.id) {
        const { error } = await supabase
          .from("reviews")
          .update(payload)
          .eq("id", existing.id)
          .eq("user_id", user.id);
        if (error) throw error;
        showAuthNotice("Your review was updated. ✓");
      } else {
        const { error } = await supabase.from("reviews").insert(payload);
        if (error) throw error;
        showAuthNotice("Thanks for your review. ✓");
      }

      setReviewText("");
      await loadProductReviews(selectedProduct.id);
    } catch (error) {
      console.error("VELO review save error:", error);
      showAuthNotice("We couldn't save your review right now.");
    } finally {
      setReviewSaving(false);
    }
  };

  const deleteProductReview = async (review: Review) => {
    if (!loggedIn) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== review.user_id) return;

    if (!window.confirm("Delete your review?")) return;

    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", review.id)
        .eq("user_id", user.id);
      if (error) throw error;
      showAuthNotice("Review deleted.");
      if (selectedProduct) await loadProductReviews(selectedProduct.id);
    } catch (error) {
      console.error("VELO review delete error:", error);
      showAuthNotice("We couldn't delete the review.");
    }
  };

  const reviewAverage = productReviews.length
    ? productReviews.reduce((sum, review) => sum + Number(review.rating), 0) / productReviews.length
    : Number(selectedProduct?.rating || 0);

  const openCheckout = () => {
    if (!loggedIn) {
      setShowCart(false);
      setAuthMode("login");
      setPasswordRecovery(false);
      setShowAuth(true);
      showAuthNotice("Please sign in before checkout.");
      return;
    }

    setShowCart(false);
    setOrderPlaced(false);
    setShowCheckout(true);
  };

  const formatOrderDate = (date: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const downloadInvoice = (order: Order) => {
    const orderId = `VLO-${order.id.slice(0, 8).toUpperCase()}`;
    const date = formatOrderDate(order.created_at);
    const deliveryText = Number(order.delivery_fee) === 0 ? "FREE" : `₹${Number(order.delivery_fee).toLocaleString("en-IN")}`;
    const itemRows = (order.order_items || []).map((item) => `
      <tr>
        <td>${item.product_name}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">₹${Number(item.price).toLocaleString("en-IN")}</td>
        <td style="text-align:right">₹${(Number(item.price) * item.quantity).toLocaleString("en-IN")}</td>
      </tr>
    `).join("");

    const html = `<!doctype html>
<html><head><meta charset="utf-8"/><title>VELO Invoice ${orderId}</title>
<style>
body{font-family:Arial,sans-serif;margin:0;padding:40px;color:#151515;background:#fff}
.invoice{max-width:820px;margin:auto;border:1px solid #ddd;padding:36px}
.header{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #111;padding-bottom:22px;margin-bottom:24px}
.brand{font-size:32px;font-weight:800;letter-spacing:5px}.muted{color:#666;font-size:13px;line-height:1.6}
h1{font-size:22px;margin:0 0 8px}.meta{text-align:right}.section{margin:24px 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:28px}.box{background:#f7f7f7;padding:18px;border-radius:10px}.box h3{margin:0 0 10px;font-size:14px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{padding:12px 8px;border-bottom:1px solid #ddd;font-size:13px}th{text-align:left;background:#f5f5f5}.totals{margin-left:auto;max-width:320px;margin-top:22px}.row{display:flex;justify-content:space-between;padding:7px 0}.grand{font-size:18px;font-weight:800;border-top:2px solid #111;margin-top:8px;padding-top:12px}.footer{text-align:center;border-top:1px solid #ddd;margin-top:30px;padding-top:20px}.status{display:inline-block;padding:6px 10px;border-radius:999px;background:#eee;font-size:12px;font-weight:700}@media(max-width:650px){body{padding:10px}.invoice{padding:20px}.header,.grid{display:block}.meta{text-align:left;margin-top:15px}}
</style></head><body><div class="invoice">
<div class="header"><div><div class="brand">VELO.</div><div class="muted">Premium shopping, delivered with confidence.</div></div><div class="meta"><h1>INVOICE</h1><div class="muted">${orderId}<br/>${date}<br/><span class="status">${getOrderStatusLabel(order.status)}</span></div></div></div>
<div class="grid section"><div class="box"><h3>BILL TO</h3><strong>${order.full_name}</strong><div class="muted">${order.phone}<br/>${order.address}<br/>${order.city} — ${order.pin_code}</div></div><div class="box"><h3>PAYMENT</h3><strong>${order.payment_method}</strong><div class="muted">Tracking ID: VLO-${order.id.slice(0,12).toUpperCase()}</div></div></div>
<div class="section"><h3>ORDER ITEMS</h3><table><thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Amount</th></tr></thead><tbody>${itemRows}</tbody></table></div>
<div class="totals"><div class="row"><span>Subtotal</span><strong>₹${Number(order.subtotal).toLocaleString("en-IN")}</strong></div><div class="row"><span>Delivery</span><strong>${deliveryText}</strong></div><div class="row"><span>Discount</span><strong>−₹${Number(order.discount).toLocaleString("en-IN")}</strong></div><div class="row grand"><span>Total</span><strong>₹${Number(order.total).toLocaleString("en-IN")}</strong></div></div>
<div class="footer"><strong>Thank you for shopping with VELO.</strong><div class="muted">This is a computer-generated invoice and does not require a signature.</div></div>
</div></body></html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `VELO-Invoice-${orderId}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showAuthNotice("Invoice downloaded successfully. ✓");
  };

  const printInvoice = (order: Order) => {
    const orderId = `VLO-${order.id.slice(0, 8).toUpperCase()}`;
    const deliveryText = Number(order.delivery_fee) === 0 ? "FREE" : `₹${Number(order.delivery_fee).toLocaleString("en-IN")}`;
    const itemRows = (order.order_items || []).map((item) => `
      <tr><td>${item.product_name}</td><td>${item.quantity}</td><td>₹${Number(item.price).toLocaleString("en-IN")}</td><td>₹${(Number(item.price) * item.quantity).toLocaleString("en-IN")}</td></tr>`).join("");
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) { showAuthNotice("Please allow pop-ups to print the invoice."); return; }
    popup.document.write(`<!doctype html><html><head><title>VELO Invoice ${orderId}</title><style>body{font-family:Arial;margin:40px;color:#111}h1{letter-spacing:5px}table{width:100%;border-collapse:collapse}th,td{padding:12px;border-bottom:1px solid #ddd;text-align:left}.total{font-size:20px;font-weight:bold;text-align:right;margin-top:20px}</style></head><body><h1>VELO.</h1><h2>INVOICE</h2><p><b>Order:</b> ${orderId}<br/><b>Date:</b> ${formatOrderDate(order.created_at)}<br/><b>Status:</b> ${getOrderStatusLabel(order.status)}</p><p><b>Customer:</b> ${order.full_name}<br/>${order.address}, ${order.city} — ${order.pin_code}<br/>${order.phone}</p><table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>${itemRows}</tbody></table><div class="total">Subtotal: ₹${Number(order.subtotal).toLocaleString("en-IN")}<br/>Delivery: ${deliveryText}<br/>Discount: −₹${Number(order.discount).toLocaleString("en-IN")}<br/>Total: ₹${Number(order.total).toLocaleString("en-IN")}</div><script>window.onload=()=>window.print()<\/script></body></html>`);
    popup.document.close();
  };

  const getOrderStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      placed: "Order Placed",
      confirmed: "Confirmed",
      packed: "Packed",
      shipped: "Shipped",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return labels[status] || "Order Placed";
  };

  const trackingSteps = [
    { key: "placed", label: "Order Placed", icon: "✓", note: "We've received your order" },
    { key: "confirmed", label: "Confirmed", icon: "✓", note: "Order confirmed by VELO" },
    { key: "packed", label: "Packed", icon: "▣", note: "Your items are packed securely" },
    { key: "shipped", label: "Shipped", icon: "↗", note: "Package is on its way" },
    { key: "out_for_delivery", label: "Out for Delivery", icon: "⌁", note: "Arriving at your address" },
    { key: "delivered", label: "Delivered", icon: "✓", note: "Delivered successfully" },
  ];

  const getTrackingIndex = (status: string) => {
    const index = trackingSteps.findIndex((step) => step.key === status);
    return index < 0 ? 0 : index;
  };

  const getEstimatedDelivery = (createdAt: string, status: string) => {
    if (status === "delivered") return "Delivered";
    if (status === "cancelled") return "Order cancelled";

    const date = new Date(createdAt);
    date.setDate(date.getDate() + 5);

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getTrackingMessage = (status: string) => {
    const messages: Record<string, string> = {
      placed: "Your order is confirmed in our system. We'll start processing it shortly.",
      confirmed: "Your order has been confirmed and is being prepared by our team.",
      packed: "Your items are packed and ready to leave the VELO fulfilment center.",
      shipped: "Your package is moving through the delivery network.",
      out_for_delivery: "Your package is with the delivery partner and should arrive today.",
      delivered: "Your package has been delivered. We hope you love your VELO purchase!",
      cancelled: "This order has been cancelled.",
    };
    return messages[status] || messages.placed;
  };

  const loadOrders = async () => {
    setOrdersLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoggedIn(false);
        setShowOrders(false);
        showAuthNotice("Please sign in to view your orders.");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, user_id, full_name, phone, address, city, pin_code, payment_method, subtotal, delivery_fee, discount, total, status, created_at, order_items (id, product_id, product_name, product_image, quantity, price)"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders((data || []) as Order[]);
    } catch (error) {
      console.error("VELO orders error:", error);
      showAuthNotice("Unable to load your orders. Please try again.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const cancelCustomerOrder = async (order: Order) => {
    if (!loggedIn) return;

    if (!['placed', 'confirmed'].includes(order.status)) {
      showAuthNotice("This order can no longer be cancelled.");
      return;
    }

    if (!window.confirm("Cancel this order? This action cannot be undone.")) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== order.user_id) {
        showAuthNotice("Please sign in again to cancel this order.");
        return;
      }

      const { data, error } = await supabase.rpc("cancel_my_order", {
        p_order_id: order.id,
      });

      if (error) throw error;
      if (!data) {
        showAuthNotice("This order can no longer be cancelled.");
        return;
      }

      const updatedOrder = { ...order, status: "cancelled" };
      setOrders((current) => current.map((item) => item.id === order.id ? updatedOrder : item));
      setSelectedOrder((current) => current?.id === order.id ? updatedOrder : current);
      await createNotification({
        userId: user.id,
        title: "Order cancelled",
        message: `Your VELO order VLO-${order.id.slice(0, 8).toUpperCase()} has been cancelled successfully.`,
        type: "order_status",
        orderId: order.id,
      });
      await loadNotifications();
      showAuthNotice("Order cancelled successfully.");
    } catch (error) {
      console.error("VELO cancel order error:", error);
      showAuthNotice("We couldn't cancel this order right now.");
    }
  };

  const reorderCustomerOrder = (order: Order) => {
    const items = order.order_items || [];
    if (!items.length) {
      showAuthNotice("No products are available to reorder.");
      return;
    }

    const availableIds = new Set(products.map((product) => product.id));
    const availableItems = items.filter((item) => availableIds.has(item.product_id));
    const unavailableCount = items.length - availableItems.length;

    if (!availableItems.length) {
      showAuthNotice("These products are no longer available.");
      return;
    }

    setCart((current) => {
      const next = [...current];
      availableItems.forEach((item) => {
        for (let i = 0; i < item.quantity; i += 1) next.push(item.product_id);
      });
      return next;
    });

    setShowOrders(false);
    setSelectedOrder(null);
    setShowCart(true);
    showAuthNotice(unavailableCount > 0
      ? `Available items added to cart. ${unavailableCount} product(s) are no longer available.`
      : "All order items added to cart. ✓");
  };

  const openOrders = async () => {
    if (!loggedIn) {
      setAuthMode("login");
      setShowAuth(true);
      showAuthNotice("Please sign in to view your orders.");
      return;
    }

    setShowProfile(false);
    setSelectedOrder(null);
    setShowOrders(true);
    await loadOrders();
  };

  const loadAdminOrders = async () => {
    setAdminLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setShowAdmin(false);
        setAuthMode("login");
        setShowAuth(true);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role !== "admin") {
        setIsAdmin(false);
        setShowAdmin(false);
        showAuthNotice("Admin access is restricted.");
        return;
      }

      setIsAdmin(true);

      const [
        { data: orderData, error: orderError },
        { data: profileData, error: customerError },
        { data: reviewData, error: reviewError },
        { data: questionData, error: questionError },
        { data: couponData, error: couponError },
      ] = await Promise.all([
        supabase
          .from("orders")
          .select("id, user_id, full_name, phone, address, city, pin_code, payment_method, subtotal, delivery_fee, discount, total, status, created_at, order_items (id, product_id, product_name, product_image, quantity, price)")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("id, full_name, phone, avatar_url, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("reviews")
          .select("id, product_id, user_id, rating, review_text, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("product_questions")
          .select("id, product_id, user_id, question, answer, answered_by, created_at, updated_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("coupons")
          .select("id, code, discount_type, discount_value, min_order_amount, max_discount_amount, expires_at, usage_limit, used_count, is_active, created_at")
          .order("created_at", { ascending: false }),
      ]);

      if (orderError) throw orderError;
      if (customerError) throw customerError;
      if (reviewError) throw reviewError;
      if (questionError) throw questionError;
      if (couponError) throw couponError;

      const safeOrders = (orderData || []) as Order[];
      const profiles = (profileData || []) as Array<{
        id: string;
        full_name: string | null;
        phone: string | null;
        avatar_url: string | null;
        created_at: string;
      }>;
      const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
      const productMap = new Map<number, Product>(products.map((product) => [product.id, product]));
      const safeReviews: AdminReview[] = ((reviewData || []) as Review[]).map((review) => {
        const profile = profileMap.get(review.user_id);
        const product = productMap.get(Number(review.product_id));
        return {
          ...(review as Review),
          customer_name: profile?.full_name || "VELO Customer",
          customer_phone: profile?.phone || null,
          product_name: product?.name || `Product #${review.product_id}`,
          product_image: product?.image || null,
        };
      });
      const safeQuestions: AdminQuestion[] = ((questionData || []) as ProductQuestion[]).map((question) => {
        const profile = profileMap.get(question.user_id);
        const product = productMap.get(Number(question.product_id));
        return {
          ...question,
          customer_name: profile?.full_name || "VELO Customer",
          customer_phone: profile?.phone || null,
          product_name: product?.name || `Product #${question.product_id}`,
          product_image: product?.image || null,
        };
      });
      const customerRows: Customer[] = profiles.map((profile) => {
        const customerOrders = safeOrders.filter((order) => order.user_id === profile.id);
        const totalSpent = customerOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
        const lastOrder = customerOrders[0]?.created_at || null;
        return {
          id: profile.id,
          full_name: profile.full_name || "VELO Customer",
          phone: profile.phone || customerOrders[0]?.phone || null,
          avatar_url: profile.avatar_url || null,
          created_at: profile.created_at,
          total_orders: customerOrders.length,
          total_spent: totalSpent,
          last_order_at: lastOrder,
        };
      });

      setAdminOrders(safeOrders);
      setAdminCustomers(customerRows);
      setAdminCustomerCount(customerRows.length);
      setAdminReviews(safeReviews);
      setAdminQuestions(safeQuestions);
      setCoupons((couponData || []) as Coupon[]);
    } catch (error) {
      console.error("VELO admin error:", error);
      showAuthNotice("Unable to load the admin dashboard.");
    } finally {
      setAdminLoading(false);
    }
  };

  const saveAdminQuestionAnswer = async (question: AdminQuestion) => {
    if (adminQuestionSaving !== null) return;
    const answer = window.prompt("Write the official VELO answer:", question.answer || "");
    if (answer === null) return;
    const text = answer.trim();
    if (text.length > 1000) {
      showAuthNotice("Answer is too long. Keep it under 1000 characters.");
      return;
    }
    setAdminQuestionSaving(question.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated admin");
      const { error } = await supabase.from("product_questions").update({
        answer: text || null,
        answered_by: text ? user.id : null,
        updated_at: new Date().toISOString(),
      }).eq("id", question.id);
      if (error) throw error;
      await loadAdminOrders();
      showAuthNotice(text ? "Official answer published. ✓" : "Answer removed.");
    } catch (error) {
      console.error("VELO admin question answer error:", error);
      showAuthNotice("We couldn't update this answer.");
    } finally {
      setAdminQuestionSaving(null);
    }
  };

  const deleteAdminQuestion = async (questionId: number) => {
    if (adminQuestionDeleting !== null) return;
    if (!window.confirm("Delete this customer question?")) return;
    setAdminQuestionDeleting(questionId);
    try {
      const { error } = await supabase.from("product_questions").delete().eq("id", questionId);
      if (error) throw error;
      setAdminQuestions((current) => current.filter((question) => question.id !== questionId));
      showAuthNotice("Question deleted successfully. ✓");
    } catch (error) {
      console.error("VELO admin question delete error:", error);
      showAuthNotice("We couldn't delete this question.");
    } finally {
      setAdminQuestionDeleting(null);
    }
  };

  const adminFilteredQuestions = useMemo(() => {
    const query = adminQuestionSearch.trim().toLowerCase();
    if (!query) return adminQuestions;
    return adminQuestions.filter((question) =>
      [question.product_name, question.customer_name, question.question, question.answer || ""].join(" ").toLowerCase().includes(query)
    );
  }, [adminQuestions, adminQuestionSearch]);

  const openAdminDashboard = async () => {
    if (!loggedIn) {
      setAuthMode("login");
      setShowAuth(true);
      showAuthNotice("Please sign in to continue.");
      return;
    }

    if (!isAdmin) {
      showAuthNotice("Admin access is restricted.");
      return;
    }

    setShowProfile(false);
    setShowOrders(false);
    setSelectedOrder(null);
    setShowAdmin(true);
    await loadAdminOrders();
  };

  const updateAdminOrderStatus = async (orderId: string, status: string) => {
    if (adminUpdating) return;

    setAdminUpdating(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;

      setAdminOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
      setSelectedOrder((current) =>
        current && current.id === orderId ? { ...current, status } : current
      );
      const changedOrder = adminOrders.find((item) => item.id === orderId);
      if (changedOrder?.user_id) {
        await createNotification({
          userId: changedOrder.user_id,
          title: `Order ${getOrderStatusLabel(status)}`,
          message: `Your VELO order VLO-${orderId.slice(0, 8).toUpperCase()} is now ${getOrderStatusLabel(status).toLowerCase()}.`,
          type: "order_status",
          orderId,
        });
      }
      showAuthNotice("Order status updated successfully. ✓");
    } catch (error) {
      console.error("VELO admin status error:", error);
      showAuthNotice("We couldn't update this order.");
    } finally {
      setAdminUpdating(false);
    }
  };

  const adminFilteredCustomers = useMemo(() => {
    const query = adminCustomerSearch.trim().toLowerCase();
    return adminCustomers.filter((customer) => {
      if (!query) return true;
      return [customer.full_name, customer.phone, customer.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [adminCustomers, adminCustomerSearch]);

  const adminFilteredReviews = useMemo(() => {
    const query = adminReviewSearch.trim().toLowerCase();
    return adminReviews.filter((review) => {
      const ratingMatch =
        adminReviewRatingFilter === "all" ||
        Number(review.rating) === Number(adminReviewRatingFilter);
      const searchMatch =
        !query ||
        [
          review.product_name,
          review.customer_name,
          review.customer_phone || "",
          review.review_text,
          String(review.id),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return ratingMatch && searchMatch;
    });
  }, [adminReviews, adminReviewSearch, adminReviewRatingFilter]);

  const adminReviewStats = useMemo(() => {
    const total = adminReviews.length;
    const average = total
      ? adminReviews.reduce((sum, review) => sum + Number(review.rating), 0) / total
      : 0;
    return {
      total,
      average,
      five: adminReviews.filter((review) => Number(review.rating) === 5).length,
      low: adminReviews.filter((review) => Number(review.rating) <= 2).length,
    };
  }, [adminReviews]);

  const deleteAdminReview = async (reviewId: number) => {
    if (adminReviewDeleting !== null) return;
    if (!window.confirm("Delete this review? This action cannot be undone.")) return;

    setAdminReviewDeleting(reviewId);
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
      setAdminReviews((current) => current.filter((review) => review.id !== reviewId));
      showAuthNotice("Review deleted successfully. ✓");
    } catch (error) {
      console.error("VELO admin review delete error:", error);
      showAuthNotice("We couldn't delete this review.");
    } finally {
      setAdminReviewDeleting(null);
    }
  };

  const adminFilteredOrders = useMemo(() => {
    const query = adminSearch.trim().toLowerCase();
    return adminOrders.filter((order) => {
      const statusMatch =
        adminStatusFilter === "all" || order.status === adminStatusFilter;
      const searchMatch =
        !query ||
        [order.id, order.full_name, order.phone, order.city, order.pin_code]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return statusMatch && searchMatch;
    });
  }, [adminOrders, adminSearch, adminStatusFilter]);

  const adminStats = useMemo(() => {
    const now = new Date();
    const rangeStart = new Date(now);
    if (adminAnalyticsRange === "today") {
      rangeStart.setHours(0, 0, 0, 0);
    } else if (adminAnalyticsRange === "7") {
      rangeStart.setDate(now.getDate() - 6);
      rangeStart.setHours(0, 0, 0, 0);
    } else if (adminAnalyticsRange === "30") {
      rangeStart.setDate(now.getDate() - 29);
      rangeStart.setHours(0, 0, 0, 0);
    } else {
      rangeStart.setTime(0);
      rangeStart.setFullYear(2000);
    }

    const rangeOrders = adminOrders.filter((order) => new Date(order.created_at) >= rangeStart);
    const revenue = rangeOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const subtotal = rangeOrders.reduce((sum, order) => sum + Number(order.subtotal || 0), 0);
    const average = rangeOrders.length ? revenue / rangeOrders.length : 0;
    const pending = rangeOrders.filter((order) => ["placed", "confirmed", "packed"].includes(order.status)).length;
    const shipped = rangeOrders.filter((order) => ["shipped", "out_for_delivery"].includes(order.status)).length;
    const delivered = rangeOrders.filter((order) => order.status === "delivered").length;

    const start7 = new Date(now);
    start7.setDate(now.getDate() - 6);
    start7.setHours(0, 0, 0, 0);
    const start30 = new Date(now);
    start30.setDate(now.getDate() - 29);
    start30.setHours(0, 0, 0, 0);

    const revenue7 = adminOrders
      .filter((order) => new Date(order.created_at) >= start7)
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    const revenue30 = adminOrders
      .filter((order) => new Date(order.created_at) >= start30)
      .reduce((sum, order) => sum + Number(order.total || 0), 0);

    const statusCounts = [
      ["placed", "Placed"], ["confirmed", "Confirmed"], ["packed", "Packed"],
      ["shipped", "Shipped"], ["out_for_delivery", "Out for Delivery"],
      ["delivered", "Delivered"], ["cancelled", "Cancelled"],
    ].map(([key, label]) => ({
      key, label,
      count: rangeOrders.filter((order) => order.status === key).length,
    }));

    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    const categoryMap = new Map<string, { quantity: number; revenue: number }>();
    rangeOrders.forEach((order) => {
      (order.order_items || []).forEach((item) => {
        const key = String(item.product_id);
        const current = productMap.get(key) || { name: item.product_name, quantity: 0, revenue: 0 };
        current.quantity += Number(item.quantity || 0);
        current.revenue += Number(item.price || 0) * Number(item.quantity || 0);
        productMap.set(key, current);

        const productInfo = products.find((product) => product.id === Number(item.product_id));
        const category = productInfo?.category || "Other";
        const categoryCurrent = categoryMap.get(category) || { quantity: 0, revenue: 0 };
        categoryCurrent.quantity += Number(item.quantity || 0);
        categoryCurrent.revenue += Number(item.price || 0) * Number(item.quantity || 0);
        categoryMap.set(category, categoryCurrent);
      });
    });

    const topProducts = Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    const categorySales = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const paymentMap = new Map<string, number>();
    rangeOrders.forEach((order) => {
      const key = String(order.payment_method || "Other").toUpperCase();
      paymentMap.set(key, (paymentMap.get(key) || 0) + 1);
    });
    const paymentBreakdown = Array.from(paymentMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const customerOrders = new Map<string, number>();
    rangeOrders.forEach((order) => {
      const key = order.user_id || order.phone || order.full_name;
      customerOrders.set(key, (customerOrders.get(key) || 0) + 1);
    });
    const returningCustomers = Array.from(customerOrders.values()).filter((count) => count > 1).length;
    const newCustomers = Array.from(customerOrders.values()).filter((count) => count === 1).length;

    const recentDays = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start7);
      day.setDate(start7.getDate() + index);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const dayOrders = adminOrders.filter((order) => {
        const created = new Date(order.created_at);
        return created >= day && created < next;
      });
      return {
        label: day.toLocaleDateString("en-IN", { weekday: "short" }),
        revenue: dayOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
        orders: dayOrders.length,
      };
    });

    const maxDayRevenue = Math.max(1, ...recentDays.map((day) => day.revenue));
    const maxProductQty = Math.max(1, ...topProducts.map((product) => product.quantity));
    const maxCategoryRevenue = Math.max(1, ...categorySales.map((category) => category.revenue));
    const maxPaymentCount = Math.max(1, ...paymentBreakdown.map((payment) => payment.count));

    return {
      rangeOrders, revenue, subtotal, average, pending, shipped, delivered,
      revenue7, revenue30, statusCounts, topProducts, categorySales, paymentBreakdown,
      returningCustomers, newCustomers, recentDays, maxDayRevenue, maxProductQty,
      maxCategoryRevenue, maxPaymentCount,
    };
  }, [adminOrders, adminAnalyticsRange, products]);

  const adminLoyaltyCustomers = useMemo(() => {
    const orderMap = new Map<string, { orders: number; spent: number; points: number; lastOrderAt: string | null }>();

    adminOrders.forEach((order) => {
      const key = order.user_id || order.phone || order.full_name;
      const current = orderMap.get(key) || { orders: 0, spent: 0, points: 0, lastOrderAt: null };
      current.orders += 1;
      current.spent += Number(order.total || 0);
      // 1 loyalty point for every ₹10 spent. Cancelled orders do not earn points.
      if (order.status !== "cancelled") {
        current.points += Math.floor(Number(order.total || 0) / 10);
      }
      if (!current.lastOrderAt || new Date(order.created_at) > new Date(current.lastOrderAt)) {
        current.lastOrderAt = order.created_at;
      }
      orderMap.set(key, current);
    });

    const rows = adminCustomers.map((customer) => {
      const stats = orderMap.get(customer.id) || { orders: 0, spent: 0, points: 0, lastOrderAt: null };
      const points = stats.points;
      const tier = points >= 5000 ? "VIP" : points >= 2500 ? "Gold" : points >= 1000 ? "Silver" : "Bronze";
      const nextTarget = tier === "Bronze" ? 1000 : tier === "Silver" ? 2500 : tier === "Gold" ? 5000 : 5000;
      const nextTier = tier === "Bronze" ? "Silver" : tier === "Silver" ? "Gold" : tier === "Gold" ? "VIP" : "VIP";
      return {
        ...customer,
        orders: stats.orders,
        spent: stats.spent,
        points,
        tier,
        nextTier,
        pointsToNext: tier === "VIP" ? 0 : Math.max(0, nextTarget - points),
        lastOrderAt: stats.lastOrderAt || customer.last_order_at,
      };
    });

    const query = adminLoyaltySearch.trim().toLowerCase();
    return rows
      .filter((customer) => !query || [customer.full_name || "", customer.phone || "", customer.tier, String(customer.points)].join(" ").toLowerCase().includes(query))
      .sort((a, b) => b.points - a.points);
  }, [adminCustomers, adminOrders, adminLoyaltySearch]);

  const adminLoyaltyStats = useMemo(() => {
    const totalPoints = adminLoyaltyCustomers.reduce((sum, customer) => sum + customer.points, 0);
    const vip = adminLoyaltyCustomers.filter((customer) => customer.tier === "VIP").length;
    const gold = adminLoyaltyCustomers.filter((customer) => customer.tier === "Gold").length;
    const silver = adminLoyaltyCustomers.filter((customer) => customer.tier === "Silver").length;
    return { totalPoints, vip, gold, silver, bronze: Math.max(0, adminLoyaltyCustomers.length - vip - gold - silver) };
  }, [adminLoyaltyCustomers]);

  const exportAdminAnalytics = () => {
    const rows = [
      ["VELO Analytics Report"],
      ["Range", adminAnalyticsRange === "today" ? "Today" : adminAnalyticsRange === "7" ? "Last 7 Days" : adminAnalyticsRange === "30" ? "Last 30 Days" : "All Time"],
      [],
      ["Metric", "Value"],
      ["Revenue", adminStats.revenue.toFixed(2)],
      ["Orders", adminStats.rangeOrders.length],
      ["Average Order Value", adminStats.average.toFixed(2)],
      ["Pending", adminStats.pending],
      ["Shipping", adminStats.shipped],
      ["Delivered", adminStats.delivered],
      [],
      ["Top Product", "Units", "Revenue"],
      ...adminStats.topProducts.map((item) => [item.name, item.quantity, item.revenue.toFixed(2)]),
      [],
      ["Category", "Units", "Revenue"],
      ...adminStats.categorySales.map((item) => [item.name, item.quantity, item.revenue.toFixed(2)]),
      [],
      ["Payment Method", "Orders"],
      ...adminStats.paymentBreakdown.map((item) => [item.name, item.count]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `velo-analytics-${adminAnalyticsRange}-${new Date().toISOString().slice(0,10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    showAuthNotice("Analytics report exported successfully. ✓");
  };

  const exportAdminOrdersReport = () => {
    const rangeOrders = adminStats.rangeOrders;
    const rows = [
      ["VELO Detailed Orders Report"],
      ["Generated", new Date().toLocaleString("en-IN")],
      ["Range", adminAnalyticsRange === "today" ? "Today" : adminAnalyticsRange === "7" ? "Last 7 Days" : adminAnalyticsRange === "30" ? "Last 30 Days" : "All Time"],
      [],
      ["Order ID", "Date", "Customer", "Phone", "City", "Payment", "Status", "Items", "Subtotal", "Delivery", "Discount", "Total"],
      ...rangeOrders.map((order) => [
        `VLO-${order.id.slice(0, 8).toUpperCase()}`,
        formatOrderDate(order.created_at),
        order.full_name,
        order.phone,
        order.city,
        order.payment_method,
        getOrderStatusLabel(order.status),
        (order.order_items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        Number(order.subtotal || 0).toFixed(2),
        Number(order.delivery_fee || 0).toFixed(2),
        Number(order.discount || 0).toFixed(2),
        Number(order.total || 0).toFixed(2),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `velo-orders-${adminAnalyticsRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    showAuthNotice("Detailed order report exported successfully. ✓");
  };

  const printAdminReport = () => {
    const rangeLabel = adminAnalyticsRange === "today" ? "Today" : adminAnalyticsRange === "7" ? "Last 7 Days" : adminAnalyticsRange === "30" ? "Last 30 Days" : "All Time";
    const rows = adminStats.rangeOrders.map((order) => `
      <tr>
        <td>VLO-${order.id.slice(0, 8).toUpperCase()}</td>
        <td>${formatOrderDate(order.created_at)}</td>
        <td>${order.full_name}</td>
        <td>${getOrderStatusLabel(order.status)}</td>
        <td>${order.payment_method}</td>
        <td>₹${Number(order.total || 0).toLocaleString("en-IN")}</td>
      </tr>`).join("");
    const popup = window.open("", "_blank", "width=1100,height=750");
    if (!popup) {
      showAuthNotice("Please allow pop-ups to print the report.");
      return;
    }
    popup.document.write(`<!doctype html><html><head><title>VELO Report - ${rangeLabel}</title><style>body{font-family:Arial,sans-serif;margin:36px;color:#111}h1{letter-spacing:5px;margin:0}h2{margin:8px 0 4px}.muted{color:#666;font-size:13px}.cards{display:flex;gap:14px;margin:24px 0}.card{border:1px solid #ddd;border-radius:12px;padding:14px 18px;min-width:150px}.card span{display:block;color:#666;font-size:12px}.card b{display:block;font-size:20px;margin-top:5px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:10px 8px;border-bottom:1px solid #ddd;text-align:left;font-size:12px}th{background:#f3f3f3}.footer{margin-top:30px;color:#777;font-size:11px}@media print{button{display:none}}</style></head><body><h1>VELO.</h1><h2>ADMIN ORDER REPORT</h2><div class="muted">${rangeLabel} · Generated ${new Date().toLocaleString("en-IN")}</div><div class="cards"><div class="card"><span>Revenue</span><b>₹${Math.round(adminStats.revenue).toLocaleString("en-IN")}</b></div><div class="card"><span>Orders</span><b>${adminStats.rangeOrders.length}</b></div><div class="card"><span>Average Order</span><b>₹${Math.round(adminStats.average).toLocaleString("en-IN")}</b></div><div class="card"><span>Delivered</span><b>${adminStats.delivered}</b></div></div><table><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Status</th><th>Payment</th><th>Total</th></tr></thead><tbody>${rows || '<tr><td colspan="6">No orders in this period.</td></tr>'}</tbody></table><div class="footer">VELO. Premium shopping administration report.</div><script>window.onload=()=>window.print()<\/script></body></html>`);
    popup.document.close();
  };

  const placeOrder = async () => {
    if (placingOrder) return;

    if (!loggedIn) {
      showAuthNotice("Please sign in before placing your order.");
      return;
    }

    if (cart.length === 0) {
      showAuthNotice("Your cart is empty.");
      return;
    }

    const cleanName = deliveryName.trim().replace(/\s+/g, " ");
    const cleanPhone = deliveryPhone.replace(/\D/g, "");
    const cleanAddress = deliveryAddress.trim().replace(/\s+/g, " ");
    const cleanCity = deliveryCity.trim().replace(/\s+/g, " ");
    const cleanPin = deliveryPin.trim();

    if (!cleanName) {
      showAuthNotice("Please enter your full name.");
      return;
    }

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      showAuthNotice("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (cleanAddress.length < 8) {
      showAuthNotice("Please enter your complete delivery address.");
      return;
    }

    if (!cleanCity) {
      showAuthNotice("Please enter your city.");
      return;
    }

    if (!/^[0-9]{6}$/.test(cleanPin)) {
      showAuthNotice("Please enter a valid 6-digit PIN code.");
      return;
    }

    if (!["UPI", "CARD", "COD"].includes(paymentMethod)) {
      showAuthNotice("Please select a payment method.");
      return;
    }

    setPlacingOrder(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showAuthNotice("Your session has expired. Please sign in again.");
        setLoggedIn(false);
        setShowCheckout(false);
        return;
      }

      const orderPayload = {
        user_id: user.id,
        full_name: cleanName,
        phone: cleanPhone,
        address: cleanAddress,
        city: cleanCity,
        pin_code: cleanPin,
        payment_method: paymentMethod,
        subtotal: cartSubtotal,
        delivery_fee: delivery,
        discount,
        total: cartTotal,
        status: "placed",
      };

      const orderItems = cartProducts.map((product) => ({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image,
        quantity: getQuantity(product.id),
        price: getSalePrice(product),
      }));

      // One database transaction handles:
      // 1) order creation
      // 2) order item creation
      // 3) stock decrement
      // 4) safe coupon usage increment
      //
      // If any part fails, Supabase rolls the whole transaction back.
      const { data: orderId, error: orderError } = await supabase.rpc(
        "create_order_atomic",
        {
          p_order: orderPayload,
          p_items: orderItems,
          p_coupon_id: appliedCoupon?.id ?? null,
        }
      );

      if (orderError || !orderId) {
        throw orderError || new Error("Order creation failed");
      }

      setLastOrderId(`VLO-${String(orderId).slice(0, 8).toUpperCase()}`);
      await createNotification({
        userId: user.id,
        title: "Order placed successfully",
        message: `Thanks for shopping with VELO. Your order VLO-${String(orderId).slice(0, 8).toUpperCase()} has been placed.`,
        type: "order_status",
        orderId: orderId,
      });
      await loadNotifications();
      setOrderPlaced(true);
      showAuthNotice("Order placed successfully. ✓");
    } catch (error) {
      console.error("VELO order error:", error);
      showAuthNotice(
        "We couldn't place your order right now. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <main className="site">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background:
            radial-gradient(circle at 15% 10%, rgba(76, 118, 255, 0.14), transparent 28%),
            radial-gradient(circle at 85% 25%, rgba(169, 75, 255, 0.11), transparent 28%),
            #070912;
          color: #f6f7fb;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        button,
        input,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .site {
          min-height: 100vh;
          overflow-x: hidden;
          background:
            linear-gradient(180deg, rgba(7, 9, 18, 0.98), rgba(8, 10, 20, 0.96));
        }

        .container {
          width: min(1180px, calc(100% - 36px));
          margin: 0 auto;
        }

        .topbar {
          padding: 11px 16px;
          text-align: center;
          font-size: 12px;
          letter-spacing: 0.5px;
          color: #cbd2e4;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,12,24,0.82);
          backdrop-filter: blur(16px);
        }

        .navbar {
          min-height: 82px;
          display: grid;
          grid-template-columns: auto 1fr minmax(220px, 310px) auto auto;
          gap: 22px;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 30;
          background: rgba(7,9,18,0.76);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .logo,
        .authBrand {
          font-size: 28px;
          font-weight: 950;
          letter-spacing: -1.5px;
        }

        .logo span,
        .authBrand span {
          color: #6ea8ff;
        }

        .navlinks {
          display: flex;
          gap: 5px;
          align-items: center;
        }

        .navlinks button {
          border: 0;
          background: transparent;
          color: #aab1c2;
          padding: 9px 10px;
          border-radius: 10px;
          transition: 0.2s;
        }

        .navlinks button:hover {
          color: #fff;
          background: rgba(255,255,255,0.06);
        }

        .search input {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 13px;
          outline: none;
          background: rgba(255,255,255,0.045);
          color: #fff;
        }

        .search input:focus,
        .authInput:focus,
        .field input:focus,
        .newsletterForm input:focus {
          border-color: rgba(110,168,255,0.75);
          box-shadow: 0 0 0 4px rgba(110,168,255,0.09);
        }

        .accountButton,
        .cartButton {
          border: 1px solid rgba(110,168,255,0.55);
          background: rgba(52,93,190,0.12);
          color: #eaf1ff;
          border-radius: 13px;
          padding: 11px 14px;
          font-weight: 800;
          transition: 0.2s;
          white-space: nowrap;
        }

        .cartButton {
          border-color: rgba(255,255,255,0.13);
          background: rgba(255,255,255,0.92);
          color: #080a11;
        }

        .accountButton:hover,
        .cartButton:hover {
          transform: translateY(-1px);
        }

        .profilePill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .avatar {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #6ea8ff, #8d6bff);
          color: white;
          font-size: 12px;
          font-weight: 900;
        }

        .hero {
          padding: 68px 0 46px;
        }

        .heroGrid {
          display: grid;
          grid-template-columns: 1.03fr 0.97fr;
          gap: 48px;
          align-items: center;
        }

        .eyebrow,
        .sectionLabel {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2.4px;
          color: #7faeff;
        }

        h1 {
          margin: 14px 0;
          font-size: clamp(48px, 7vw, 82px);
          line-height: 0.92;
          letter-spacing: -5px;
        }

        h1 span {
          color: #8ea9ff;
        }

        .heroText {
          max-width: 620px;
          color: #aeb6c9;
          line-height: 1.75;
          font-size: 16px;
        }

        .heroButtons {
          display: flex;
          gap: 12px;
          margin-top: 28px;
          flex-wrap: wrap;
        }

        .primaryButton,
        .secondaryButton,
        .addButton,
        .checkout,
        .placeOrder,
        .authSubmit {
          border: 0;
          border-radius: 12px;
          padding: 13px 17px;
          font-weight: 900;
          transition: 0.2s;
        }

        .primaryButton,
        .addButton,
        .checkout,
        .placeOrder,
        .authSubmit {
          background: linear-gradient(135deg, #5f9cff, #8068ff);
          color: white;
          box-shadow: 0 14px 35px rgba(86,115,255,0.22);
        }

        .secondaryButton {
          color: #e9edf8;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.09);
        }

        .primaryButton:hover,
        .secondaryButton:hover,
        .addButton:hover,
        .checkout:hover,
        .placeOrder:hover,
        .authSubmit:hover {
          transform: translateY(-2px);
        }

        .heroTrust {
          display: flex;
          gap: 18px;
          margin-top: 32px;
          flex-wrap: wrap;
        }

        .heroTrust > div {
          display: grid;
          grid-template-columns: 28px 1fr;
          column-gap: 8px;
          align-items: center;
          color: #e8ebf5;
        }

        .heroTrust span {
          grid-row: span 2;
          font-size: 20px;
        }

        .heroTrust strong {
          font-size: 12px;
        }

        .heroTrust small {
          color: #858da2;
          font-size: 10px;
        }

        .heroProductCard {
          overflow: hidden;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.08);
          background: linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.025));
          box-shadow: 0 35px 100px rgba(0,0,0,0.35);
        }

        .heroProductImage {
          height: 380px;
          position: relative;
          overflow: hidden;
        }

        .heroRealImage,
        .productPhoto,
        .modalImage img,
        .cartItemIcon img,
        .checkoutItem img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .heroFloatingCard {
          position: absolute;
          left: 22px;
          bottom: 22px;
          padding: 16px 18px;
          border-radius: 17px;
          background: rgba(10,12,24,0.82);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(14px);
        }

        .heroFloatingCard span {
          display: block;
          font-size: 9px;
          letter-spacing: 1.8px;
          color: #82adff;
          font-weight: 900;
        }

        .heroFloatingCard strong {
          display: block;
          margin-top: 5px;
          font-size: 17px;
        }

        .heroFloatingCard small {
          color: #a6aec1;
        }

        .heroProductInfo {
          padding: 24px;
        }

        .heroProductInfo small {
          color: #8daeff;
          letter-spacing: 1.8px;
          font-weight: 900;
          font-size: 10px;
        }

        .heroProductInfo h3 {
          margin: 8px 0 6px;
          font-size: 26px;
        }

        .heroProductInfo p {
          color: #9ea6b9;
          margin: 0 0 16px;
        }

        .heroProductInfo button {
          border: 0;
          background: transparent;
          color: #8bb2ff;
          font-weight: 900;
          padding: 0;
        }

        .categories {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
          padding: 10px 0 42px;
        }

        .categoryBtn {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.035);
          color: #aeb6c8;
          padding: 10px 15px;
          border-radius: 999px;
          transition: 0.2s;
        }

        .categoryBtn.active,
        .categoryBtn:hover {
          color: white;
          border-color: rgba(110,168,255,0.6);
          background: rgba(110,168,255,0.12);
        }

        #products {
          scroll-margin-top: 110px;
        }

        .sectionHeader {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .sectionHeader h2,
        .newsletter h2 {
          font-size: 38px;
          margin: 7px 0 4px;
          letter-spacing: -1.5px;
        }

        .sectionHeader p {
          margin: 0;
          color: #7f879b;
        }

        .sort {
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.045);
          color: #e8ebf4;
          padding: 11px 13px;
          border-radius: 11px;
          outline: none;
        }

        .sort option {
          background: #111522;
        }

        .productGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .smartRecommendationGrid button { transition: transform .2s ease, border-color .2s ease, background .2s ease; }
        .smartRecommendationGrid button:hover { transform: translateY(-3px); border-color: rgba(110,168,255,.3); background: rgba(20,27,48,.9); }
        @media (max-width: 850px) { .smartRecommendationGrid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; } }

        .productCard {
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.035);
          transition: 0.25s;
        }

        .productCard:hover {
          transform: translateY(-5px);
          border-color: rgba(110,168,255,0.24);
          box-shadow: 0 22px 55px rgba(0,0,0,0.22);
        }

        .productImage {
          height: 235px;
          position: relative;
          background: #111522;
        }

        .tag {
          position: absolute;
          z-index: 2;
          top: 12px;
          left: 12px;
          background: rgba(7,9,18,0.82);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 6px 8px;
          border-radius: 8px;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .like {
          position: absolute;
          z-index: 3;
          top: 10px;
          right: 10px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.13);
          background: rgba(7,9,18,0.7);
          color: #fff;
          font-size: 18px;
        }

        .like.active {
          color: #ff6f9b;
        }

        .productPhoto {
          transition: transform 0.35s;
        }

        .productCard:hover .productPhoto {
          transform: scale(1.045);
        }

        .stockBadge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 9px;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: .7px;
          border: 1px solid rgba(255,255,255,.08);
        }
        .stockBadge.healthy { background: rgba(67, 214, 145, .09); color: #6ee7a8; }
        .stockBadge.low { background: rgba(255, 191, 71, .10); color: #ffc75e; }
        .stockBadge.urgent { background: rgba(255, 92, 123, .12); color: #ff7997; animation: veloPulse 1.8s ease-in-out infinite; }
        .stockBadge.out { background: rgba(255, 255, 255, .06); color: #8d95a7; }
        .addButton:disabled { opacity: .45; cursor: not-allowed; transform: none !important; box-shadow: none; }
        @keyframes veloPulse { 0%,100% { opacity: 1; } 50% { opacity: .58; } }

        .productInfo {
          padding: 16px;
        }

        .productCategory {
          color: #789fff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .productInfo h3 {
          margin: 7px 0 6px;
          font-size: 16px;
        }

        .productInfo p {
          margin: 0;
          min-height: 38px;
          color: #858da0;
          font-size: 12px;
          line-height: 1.55;
        }

        .rating {
          margin-top: 10px;
          color: #ffc76b;
          font-size: 12px;
          font-weight: 800;
        }

        .priceRow {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 10px 0 13px;
        }

        .price {
          font-size: 18px;
          font-weight: 950;
        }

        .oldPrice {
          color: #656d7e;
          font-size: 12px;
          text-decoration: line-through;
        }

        .addButton {
          width: 100%;
          padding: 11px;
          font-size: 12px;
        }

        .empty {
          text-align: center;
          padding: 70px 20px;
          color: #929aae;
        }

        .benefits {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          padding: 75px 0;
        }

        .benefit {
          padding: 24px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.035);
        }

        .benefit > span {
          font-size: 25px;
        }

        .benefit h3 {
          margin: 15px 0 7px;
        }

        .benefit p {
          margin: 0;
          color: #81899b;
          line-height: 1.6;
          font-size: 13px;
        }

        .newsletter {
          padding: 60px 30px;
          margin-bottom: 35px;
          border-radius: 28px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.08);
          background:
            radial-gradient(circle at 50% 0%, rgba(105,137,255,0.18), transparent 45%),
            rgba(255,255,255,0.035);
        }

        .newsletter p {
          color: #929aac;
        }

        .newsletterForm {
          display: flex;
          max-width: 560px;
          margin: 24px auto 0;
          gap: 10px;
        }

        .newsletterForm input,
        .field input {
          min-width: 0;
          width: 100%;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.045);
          color: white;
          outline: none;
          padding: 13px 14px;
          border-radius: 11px;
        }

        .newsletterForm button {
          border: 0;
          padding: 0 20px;
          border-radius: 11px;
          background: white;
          color: #080a11;
          font-weight: 900;
        }

        footer {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          color: #656d7d;
          font-size: 12px;
          padding: 0 0 30px;
        }

        .authOverlay,
        .modalOverlay,
        .cartOverlay,
        .checkoutOverlay,
        .profileOverlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(14px);
          display: grid;
          place-items: center;
          padding: 18px;
        }

        .authModal {
          width: min(980px, 100%);
          max-height: 92vh;
          overflow: auto;
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          background: #0e1220;
          box-shadow: 0 35px 100px rgba(0,0,0,0.5);
        }

        .authVisual {
          min-height: 620px;
          padding: 34px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background:
            radial-gradient(circle at 20% 20%, rgba(92,145,255,0.3), transparent 38%),
            radial-gradient(circle at 90% 80%, rgba(147,85,255,0.22), transparent 38%),
            #0a0d17;
        }

        .authVisual h2 {
          font-size: 45px;
          line-height: 1;
          letter-spacing: -2px;
        }

        .authVisual p {
          color: #9ba4b8;
          line-height: 1.7;
        }

        .authTrust {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .authTrust span {
          padding: 8px 10px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9px;
          color: #c9d0df;
          font-size: 11px;
        }

        .authFormSide {
          position: relative;
          padding: 35px;
        }

        .authClose {
          position: absolute;
          top: 18px;
          right: 18px;
        }

        .authForm {
          max-width: 470px;
          margin: 28px auto 0;
        }

        .authForm h2 {
          font-size: 34px;
          margin: 9px 0;
          letter-spacing: -1.2px;
        }

        .authSubtitle {
          color: #8992a6;
          font-size: 13px;
          line-height: 1.6;
        }

        .authField {
          margin-top: 17px;
        }

        .authField label,
        .field label {
          display: block;
          margin-bottom: 7px;
          color: #c9cfdd;
          font-size: 11px;
          font-weight: 800;
        }

        .authInput {
          width: 100%;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.045);
          color: white;
          outline: none;
          padding: 13px 14px;
          border-radius: 11px;
        }

        .authInput:disabled {
          opacity: 0.6;
        }

        .authInputWrap {
          position: relative;
        }

        .authInputWrap .authInput {
          padding-right: 68px;
        }

        .passwordToggle {
          position: absolute;
          right: 7px;
          top: 7px;
          bottom: 7px;
          border: 0;
          border-radius: 8px;
          background: rgba(255,255,255,0.07);
          color: #b9c3d8;
          padding: 0 9px;
          font-size: 11px;
        }

        .passwordMeter {
          margin-top: 12px;
        }

        .passwordMeterTrack {
          height: 5px;
          border-radius: 99px;
          overflow: hidden;
          background: rgba(255,255,255,0.08);
        }

        .passwordMeterFill {
          height: 100%;
          background: linear-gradient(90deg, #ef6d86, #ffc45e, #62df9b);
          transition: 0.2s;
        }

        .passwordMeter span {
          display: block;
          margin-top: 7px;
          color: #8992a6;
          font-size: 10px;
        }

        .passwordRules {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 9px;
        }

        .passwordRules span {
          padding: 5px 7px;
          border-radius: 7px;
          background: rgba(255,255,255,0.045);
          color: #777f91;
          font-size: 9px;
        }

        .passwordRules span.ok {
          color: #75dfa1;
          background: rgba(75,220,137,0.08);
        }

        .authOptions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          margin: 14px 0;
        }

        .securityHint {
          color: #717a8d;
          font-size: 9px;
        }

        .forgotButton,
        .authSwitch button {
          border: 0;
          background: transparent;
          color: #7eacff;
          font-weight: 800;
        }

        .authSubmit {
          width: 100%;
          margin-top: 15px;
        }

        .authSubmit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .authSwitch {
          text-align: center;
          margin-top: 17px;
          color: #777f91;
          font-size: 12px;
        }

        .securityPanel {
          display: grid;
          gap: 6px;
          margin-top: 22px;
          padding: 14px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 13px;
          background: rgba(255,255,255,0.025);
          color: #7e879b;
          font-size: 10px;
        }

        .securityPanel strong {
          color: #d9dfeb;
          font-size: 11px;
        }

        .modalOverlay {
          z-index: 110;
        }

        .productModal {
          width: min(850px, 100%);
          max-height: 90vh;
          overflow: auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #0e1220;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          position: relative;
        }

        .modalImage {
          min-height: 420px;
        }

        .modalInfo {
          padding: 35px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .modalInfo h2 {
          font-size: 32px;
          margin: 9px 0;
        }

        .modalInfo p {
          color: #8c95a9;
          line-height: 1.7;
        }

        .modalRating {
          color: #ffc76b;
        }

        .modalPrice {
          font-size: 28px;
          font-weight: 950;
          margin: 16px 0;
        }

        .reviewsPanel {
          margin-top: 24px;
          padding-top: 22px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .reviewsHeader {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 14px;
        }

        .reviewsLabel {
          color: #7fa8ff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .reviewsHeader h3 {
          margin: 4px 0 0;
          font-size: 18px;
        }

        .reviewAverage {
          min-width: 78px;
          padding: 9px 11px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          background: rgba(255,255,255,0.035);
          display: grid;
          grid-template-columns: auto auto;
          gap: 2px 5px;
          align-items: center;
          text-align: right;
        }

        .reviewAverage strong {
          font-size: 17px;
        }

        .reviewAverage span {
          color: #ffc76b;
        }

        .reviewAverage small {
          grid-column: 1 / -1;
          color: #788197;
          font-size: 9px;
        }

        .reviewComposer {
          padding: 12px;
          border-radius: 14px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
        }

        .reviewStars {
          display: flex;
          gap: 2px;
        }

        .reviewStars button,
        .reviewStars span {
          border: 0;
          background: transparent;
          color: #41495d;
          padding: 1px;
          font-size: 20px;
        }

        .reviewStars button.selected,
        .reviewStars span.selected {
          color: #ffc76b;
        }

        .reviewComposer textarea {
          width: 100%;
          min-height: 72px;
          margin-top: 8px;
          resize: vertical;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 10px;
          color: white;
          background: rgba(4,7,16,0.55);
          outline: none;
        }

        .reviewComposer textarea:focus {
          border-color: rgba(108,145,255,0.7);
        }

        .reviewComposer textarea:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .reviewComposerBottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
          color: #697288;
          font-size: 10px;
        }

        .reviewSubmit {
          border: 0;
          border-radius: 9px;
          padding: 9px 12px;
          color: white;
          font-weight: 800;
          background: linear-gradient(135deg, #315fe9, #7b4dff);
        }

        .reviewSubmit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .reviewList {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }

        .reviewItem {
          display: flex;
          gap: 10px;
          padding: 11px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .reviewAvatar {
          width: 31px;
          height: 31px;
          flex: 0 0 31px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: white;
          font-size: 11px;
          font-weight: 900;
          background: linear-gradient(135deg, #355fea, #7b4dff);
        }

        .reviewBody {
          min-width: 0;
          flex: 1;
        }

        .reviewTop {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .reviewTop > div:first-child {
          display: grid;
          gap: 2px;
        }

        .reviewTop strong {
          font-size: 11px;
        }

        .reviewTop span {
          color: #70798e;
          font-size: 9px;
        }

        .reviewStars.compact {
          white-space: nowrap;
        }

        .reviewStars.compact span {
          font-size: 12px;
        }

        .reviewBody p {
          margin: 7px 0 0;
          color: #b8bfd0;
          font-size: 11px;
          line-height: 1.55;
        }

        .reviewDelete {
          margin-top: 6px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #7f8aa2;
          font-size: 9px;
        }

        .reviewDelete:hover {
          color: #ff8c9a;
        }

        .reviewEmpty {
          padding: 14px 8px;
          text-align: center;
          color: #737d94;
          font-size: 10px;
        }

        .reviewEmpty span {
          display: block;
          color: #ffc76b;
          font-size: 24px;
        }

        .reviewEmpty strong {
          display: block;
          color: #d8ddeb;
          margin-top: 4px;
          font-size: 11px;
        }

        .reviewEmpty p {
          margin: 4px 0 0;
        }

        .modalClose,
        .close {
          border: 0;
          background: rgba(255,255,255,0.07);
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 20px;
          display: grid;
          place-items: center;
        }

        .modalClose {
          position: absolute;
          right: 15px;
          top: 15px;
          z-index: 5;
        }

        .cartOverlay {
          z-index: 120;
          place-items: stretch end;
          padding: 0;
        }

        .cartDrawer {
          width: min(460px, 100%);
          height: 100%;
          overflow: auto;
          background: #0c101c;
          border-left: 1px solid rgba(255,255,255,0.09);
          padding: 22px;
          box-shadow: -30px 0 80px rgba(0,0,0,0.35);
        }

        .cartHead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .cartHead h2 {
          margin: 0;
        }

        .cartItem {
          display: grid;
          grid-template-columns: 72px 1fr;
          gap: 12px;
          padding: 13px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .cartItemIcon {
          width: 72px;
          height: 72px;
          overflow: hidden;
          border-radius: 11px;
        }

        .cartItemInfo h4 {
          margin: 0 0 4px;
          font-size: 13px;
        }

        .cartItemInfo p,
        .cartItemInfo small {
          margin: 0;
          color: #8d95a8;
          font-size: 11px;
        }

        .cartActions {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 9px;
        }

        .qtyButton {
          width: 28px;
          height: 28px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.05);
          color: white;
          border-radius: 8px;
        }

        .qtyValue {
          min-width: 22px;
          text-align: center;
          font-size: 12px;
        }

        .remove {
          border: 0;
          background: transparent;
          color: #ff7995;
          font-size: 10px;
          margin-left: auto;
        }

        .summaryBox {
          margin-top: 18px;
          padding: 16px;
          border-radius: 14px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .summaryRow,
        .cartTotal {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin: 9px 0;
          color: #9ca4b7;
          font-size: 12px;
        }

        .summaryRow strong {
          color: #eef1f7;
        }

        .summaryRow.discount strong,
        .summaryRow.discount {
          color: #69d99c;
        }

        .freeDelivery {
          margin: 12px 0;
          color: #75dfa1;
          font-size: 10px;
        }

        .cartTotal {
          border-top: 1px solid rgba(255,255,255,0.07);
          padding-top: 13px;
          margin-top: 13px;
          color: white;
          font-weight: 900;
          font-size: 16px;
        }

        .checkout {
          width: 100%;
          margin-top: 15px;
        }

        .checkoutOverlay {
          z-index: 130;
          overflow: auto;
          display: block;
        }

        .checkoutPanel {
          width: min(1120px, 100%);
          margin: 0 auto;
          min-height: calc(100vh - 36px);
          padding: 25px;
          border-radius: 24px;
          background: #0d111d;
          border: 1px solid rgba(255,255,255,0.09);
        }

        .checkoutTop {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          margin-bottom: 22px;
        }

        .checkoutTop h2 {
          margin: 0 0 5px;
          font-size: 30px;
        }

        .checkoutTop p {
          margin: 0;
          color: #858da0;
        }

        .checkoutGrid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 17px;
        }

        .checkoutCard {
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
        }

        .checkoutCard h3 {
          margin-top: 0;
        }

        .formGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .paymentOptions {
          display: grid;
          gap: 9px;
        }

        .paymentOption {
          display: block;
          padding: 12px;
          border-radius: 11px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          color: #9ba3b6;
          font-size: 12px;
        }

        .paymentOption.active {
          border-color: rgba(110,168,255,0.55);
          background: rgba(110,168,255,0.08);
          color: #eef2fb;
        }

        .paymentOption input {
          margin-right: 8px;
        }

        .checkoutItems {
          display: grid;
          gap: 10px;
        }

        .checkoutItem {
          display: grid;
          grid-template-columns: 55px 1fr;
          gap: 10px;
          align-items: center;
        }

        .checkoutItem img {
          width: 55px;
          height: 55px;
          border-radius: 9px;
        }

        .checkoutItemInfo {
          display: grid;
          gap: 4px;
          font-size: 11px;
        }

        .checkoutItemInfo span {
          color: #7f8799;
        }

        .placeOrder {
          width: 100%;
          margin-top: 15px;
        }

        .secureNote {
          text-align: center;
          margin-top: 10px;
          color: #737c8f;
          font-size: 9px;
        }

        .successBox {
          min-height: 560px;
          display: grid;
          place-items: center;
          align-content: center;
          text-align: center;
        }

        .successIcon {
          width: 80px;
          height: 80px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(85,220,145,0.12);
          color: #6de09d;
          border: 1px solid rgba(85,220,145,0.3);
          font-size: 35px;
          font-weight: 900;
        }

        .successBox p {
          max-width: 520px;
          color: #8d95a8;
          line-height: 1.7;
        }

        .orderId {
          margin: 12px 0 18px;
          color: #87afff;
          font-weight: 900;
        }

        .profileOverlay {
          z-index: 140;
        }

        .profileModal {
          width: min(620px, 100%);
          max-height: 90vh;
          overflow: auto;
          padding: 28px;
          border-radius: 24px;
          background: #0d111d;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 35px 100px rgba(0,0,0,0.5);
        }

        .profileHead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 22px;
        }

        .profileHead h2 {
          margin: 0 0 5px;
        }

        .profileHead p {
          margin: 0;
          color: #7e879a;
          font-size: 12px;
        }

        .profileAvatar {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto 20px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #6ea8ff, #886cff);
          font-size: 28px;
          font-weight: 950;
        }

        .profileAvatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profileFields {
          display: grid;
          gap: 15px;
        }

        .profileActions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .profileActions button {
          flex: 1;
        }

        .ordersButton {
          border: 1px solid rgba(110,168,255,0.25);
          background: rgba(110,168,255,0.08);
          color: #8db6ff;
          border-radius: 12px;
          padding: 12px;
          font-weight: 900;
        }

        .logoutButton {
          border: 1px solid rgba(255,100,130,0.25);
          background: rgba(255,100,130,0.08);
          color: #ff8da5;
          border-radius: 12px;
          padding: 12px;
          font-weight: 900;
        }

        .saveProfileButton {
          border: 0;
          border-radius: 12px;
          padding: 12px;
          background: linear-gradient(135deg, #5f9cff, #8068ff);
          color: white;
          font-weight: 900;
        }

        .profileMeta {
          margin-top: 16px;
          padding: 12px;
          border-radius: 11px;
          background: rgba(255,255,255,0.035);
          color: #7f8799;
          font-size: 10px;
        }

        .ordersOverlay {
          position: fixed;
          inset: 0;
          z-index: 145;
          background: rgba(0,0,0,0.76);
          backdrop-filter: blur(16px);
          display: grid;
          place-items: center;
          padding: 18px;
        }

        .ordersModal {
          width: min(1000px, 100%);
          max-height: 92vh;
          overflow: auto;
          padding: 28px;
          border-radius: 26px;
          background: linear-gradient(180deg, #101522, #0b0f19);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 40px 120px rgba(0,0,0,0.6);
        }

        .ordersHeader {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .ordersHeader h2 { margin: 0 0 6px; font-size: 30px; }
        .ordersHeader p { margin: 0; color: #7f899c; font-size: 12px; }

        .ordersList { display: grid; gap: 12px; }

        .orderCard {
          width: 100%;
          display: grid;
          grid-template-columns: 54px 1fr auto;
          align-items: center;
          gap: 15px;
          text-align: left;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.035);
          color: white;
          padding: 17px;
          border-radius: 17px;
          transition: .2s;
        }

        .orderCard:hover {
          transform: translateY(-2px);
          border-color: rgba(110,168,255,.32);
          background: rgba(110,168,255,.06);
        }

        .orderCardIcon {
          width: 54px; height: 54px; display: grid; place-items: center;
          border-radius: 15px; background: rgba(110,168,255,.1); font-size: 24px;
        }

        .orderCardTitle { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .orderCardMain p { margin: 6px 0; color:#8992a5; font-size:11px; }
        .orderCardMain > span { color:#6f788a; font-size:10px; }
        .orderCardPrice { text-align:right; display:grid; gap:6px; }
        .orderCardPrice strong { font-size:15px; }
        .orderCardPrice span { color:#79a9ff; font-size:10px; font-weight:800; }

        .statusBadge {
          display:inline-flex; align-items:center; width:max-content;
          padding:5px 9px; border-radius:999px;
          background:rgba(82,211,137,.1); color:#74e6a0;
          border:1px solid rgba(82,211,137,.2);
          font-size:9px; font-weight:900;
        }
        .statusBadge.delivered { background:rgba(82,211,137,.14); }
        .statusBadge.cancelled { background:rgba(255,100,130,.1); color:#ff8da5; border-color:rgba(255,100,130,.2); }

        .ordersEmpty, .ordersLoading { text-align:center; padding:70px 25px; color:#8992a5; }
        .ordersEmpty h3, .ordersLoading h3 { color:#eef2f9; margin:14px 0 7px; }
        .ordersEmpty p, .ordersLoading p { max-width:450px; margin:0 auto 22px; font-size:12px; line-height:1.7; }
        .ordersEmptyIcon { font-size:55px; }
        .ordersSpinner { width:42px; height:42px; border-radius:50%; border:3px solid rgba(255,255,255,.1); border-top-color:#79a9ff; animation: spin 0.8s linear infinite; margin:0 auto; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .orderDetails { display:grid; gap:16px; }
        .backOrdersButton { width:max-content; border:0; background:transparent; color:#80adff; padding:0; font-size:12px; font-weight:900; }
        .orderDetailsTop { display:flex; justify-content:space-between; align-items:center; gap:15px; padding:18px; border:1px solid rgba(255,255,255,.08); border-radius:17px; background:rgba(255,255,255,.035); }
        .orderDetailsTop strong { display:block; font-size:18px; margin:4px 0; }
        .orderSmallLabel { color:#657086; font-size:9px; font-weight:900; letter-spacing:1px; }
        .orderDate { display:block; color:#737d90; font-size:10px; }

        .trackingHero {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(124,158,255,.18);
          border-radius: 22px;
          background:
            radial-gradient(circle at 10% 0%, rgba(95,156,255,.14), transparent 34%),
            linear-gradient(145deg, rgba(255,255,255,.055), rgba(255,255,255,.025));
          padding: 22px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
        }
        .trackingHero::after {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          right: -80px;
          top: -90px;
          border-radius: 50%;
          background: rgba(110,168,255,.08);
          filter: blur(4px);
        }
        .trackingHeroTop {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          margin-bottom: 30px;
        }
        .trackingEyebrow {
          color: #6fa4ff;
          font-size: 8px;
          font-weight: 1000;
          letter-spacing: 1.7px;
        }
        .trackingHeroTop h3 { margin: 6px 0 6px; font-size: 22px; }
        .trackingHeroTop p { margin: 0; color: #7f899c; font-size: 11px; line-height: 1.6; max-width: 580px; }
        .trackingEta {
          min-width: 155px;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(0,0,0,.14);
          text-align: right;
        }
        .trackingEta span { display:block; color:#69758a; font-size:8px; font-weight:900; letter-spacing:1px; }
        .trackingEta strong { display:block; margin-top:5px; color:#f3f6ff; font-size:12px; }
        .trackingProgressWrap { position: relative; z-index: 1; }
        .trackingProgressRail {
          position:absolute;
          left:8.33%;
          right:8.33%;
          top:14px;
          height:3px;
          border-radius:99px;
          background:rgba(255,255,255,.08);
        }
        .trackingProgressFill {
          position:absolute;
          left:8.33%;
          top:14px;
          height:3px;
          border-radius:99px;
          background:linear-gradient(90deg,#5f9cff,#8d7bff);
          box-shadow:0 0 14px rgba(95,156,255,.4);
          transition:width .45s ease;
        }
        .trackingSteps { display:grid; grid-template-columns:repeat(6,1fr); gap:8px; }
        .trackingStep { position:relative; text-align:center; color:#596477; font-size:8px; }
        .trackingDot {
          position:relative;
          z-index:2;
          width:30px;
          height:30px;
          margin:0 auto 9px;
          display:grid;
          place-items:center;
          border-radius:50%;
          border:1px solid rgba(255,255,255,.1);
          background:#0d1320;
          color:#596477;
          font-size:10px;
          font-weight:1000;
          transition:.25s ease;
        }
        .trackingStep strong { display:block; font-size:9px; color:inherit; }
        .trackingStep span { display:block; margin:5px auto 0; max-width:115px; color:#596477; line-height:1.35; }
        .trackingStep.active { color:#9ebfff; }
        .trackingStep.active .trackingDot { background:linear-gradient(145deg,#5f9cff,#756bff); color:white; border-color:rgba(155,190,255,.6); box-shadow:0 0 18px rgba(95,156,255,.2); }
        .trackingStep.current .trackingDot { animation: trackingPulse 1.8s ease-in-out infinite; }
        .trackingStep.current strong { color:#fff; }
        @keyframes trackingPulse { 0%,100% { box-shadow:0 0 0 0 rgba(95,156,255,.18); } 50% { box-shadow:0 0 0 8px rgba(95,156,255,0); } }
        .trackingFooter {
          position:relative; z-index:1;
          display:flex; align-items:center; gap:10px;
          margin-top:26px; padding-top:15px;
          border-top:1px solid rgba(255,255,255,.07);
          color:#667187; font-size:9px;
        }
        .trackingFooter strong { color:#a9b5c9; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:.5px; }
        .trackingSecure { margin-left:auto; color:#6ddf9a; }

        .orderInfoCard, .orderTotalCard {
          border:1px solid rgba(255,255,255,.08); border-radius:17px;
          background:rgba(255,255,255,.035); padding:18px;
        }

        .orderDetailGrid { display:grid; grid-template-columns:1.25fr .75fr; gap:16px; }
        .orderInfoCard h3 { margin:0 0 14px; }
        .orderItemRow { display:grid; grid-template-columns:48px 1fr auto; gap:11px; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.06); }
        .orderItemRow:last-child { border-bottom:0; }
        .orderItemRow img { width:48px; height:48px; border-radius:10px; object-fit:cover; background:#151b2a; }
        .orderItemRow strong, .orderItemRow span { display:block; }
        .orderItemRow strong { font-size:11px; }
        .orderItemRow span { margin-top:4px; color:#737d90; font-size:9px; }
        .orderItemRow b { font-size:11px; }
        .orderInfoCard > p { color:#8992a5; font-size:11px; line-height:1.55; margin:6px 0; }
        .paymentChip { display:inline-flex; margin-top:8px; padding:6px 9px; border-radius:8px; background:rgba(110,168,255,.09); color:#8fb6ff; font-size:9px; font-weight:900; }

        .orderTotalCard { display:grid; gap:10px; }
        .orderTotalCard > div { display:flex; justify-content:space-between; gap:15px; color:#8992a5; font-size:11px; }
        .orderTotalCard .discountRow { color:#72df9c; }
        .orderTotalCard .grandTotal { margin-top:5px; padding-top:13px; border-top:1px solid rgba(255,255,255,.08); color:#fff; font-size:14px; }

        .toast {
          position: fixed;
          z-index: 300;
          right: 20px;
          bottom: 20px;
          max-width: min(380px, calc(100% - 40px));
          padding: 13px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(16,20,33,0.94);
          color: #eef2f9;
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
          backdrop-filter: blur(15px);
          font-size: 12px;
        }

        @media (max-width: 1050px) {
          .navbar {
            grid-template-columns: auto 1fr auto auto;
          }

          .navlinks {
            display: none;
          }

          .search {
            grid-column: 2;
          }

          .productGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 800px) {
          .container {
            width: min(100% - 24px, 650px);
          }

          .navbar {
            grid-template-columns: auto 1fr auto;
            gap: 9px;
            min-height: 70px;
          }

          .search {
            grid-column: 1 / -1;
            grid-row: 2;
            padding-bottom: 10px;
          }

          .accountButton {
            font-size: 11px;
            padding: 10px;
          }

          .cartButton {
            font-size: 11px;
            padding: 10px;
          }

          .hero {
            padding-top: 38px;
          }

          .heroGrid,
          .checkoutGrid,
          .reviewsHeader {
            align-items: stretch;
          }

          .reviewAverage {
            min-width: 68px;
          }

          .productModal,
          .authModal {
            grid-template-columns: 1fr;
          }

          .heroProductImage {
            height: 300px;
          }

          .authVisual {
            display: none;
          }

          .authFormSide {
            padding: 25px 20px;
          }

          .productGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .benefits {
            grid-template-columns: repeat(2, 1fr);
            padding: 50px 0;
          }

          .modalImage {
            min-height: 290px;
          }
        }

        @media (max-width: 520px) {
          .logo {
            font-size: 24px;
          }

          .accountButton {
            padding: 9px 10px;
          }

          .profilePill .avatar {
            display: none;
          }

          h1 {
            font-size: 51px;
            letter-spacing: -3px;
          }

          .heroButtons > button {
            width: 100%;
          }

          .heroTrust {
            display: grid;
            grid-template-columns: 1fr;
          }

          .sectionHeader {
            align-items: stretch;
            flex-direction: column;
          }

          .productGrid {
            grid-template-columns: 1fr;
          }

          .productImage {
            height: 270px;
          }

          .benefits {
            grid-template-columns: 1fr;
          }

          .newsletterForm,
          .profileActions {
            flex-direction: column;
          }

          .newsletterForm button {
            min-height: 46px;
          }

          .formGrid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }

          .ordersModal {
            padding: 18px;
          }

          .orderCard {
            grid-template-columns: 46px 1fr;
          }

          .orderCardIcon {
            width: 46px;
            height: 46px;
          }

          .orderCardPrice {
            grid-column: 2;
            text-align: left;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .trackingHeroTop {
            flex-direction: column;
          }

          .trackingEta {
            width: 100%;
            text-align: left;
          }

          .trackingSteps {
            grid-template-columns: repeat(3, 1fr);
            row-gap: 22px;
          }

          .trackingProgressRail, .trackingProgressFill {
            display: none;
          }

          .trackingFooter {
            flex-wrap: wrap;
          }

          .trackingSecure {
            margin-left: 0;
            width: 100%;
          }

          .orderDetailGrid {
            grid-template-columns: 1fr;
          }

          .orderDetailsTop {
            align-items: flex-start;
            flex-direction: column;
          }

          .checkoutPanel {
            padding: 15px;
          }

          .authForm h2 {
            font-size: 28px;
          }

          footer {
            flex-direction: column;
          }
        }

        .adminLaunchButton {
          width: 100%;
          margin: 18px 0 2px;
          border: 1px solid rgba(125, 151, 255, 0.35);
          background: linear-gradient(135deg, rgba(87, 112, 255, 0.18), rgba(173, 92, 255, 0.14));
          color: #eef1ff;
          padding: 13px 15px;
          border-radius: 14px;
          font-weight: 900;
          letter-spacing: 0.2px;
          transition: transform .2s ease, border-color .2s ease, background .2s ease;
        }
        .adminLaunchButton:hover { transform: translateY(-1px); border-color: rgba(145, 165, 255, .7); background: linear-gradient(135deg, rgba(87,112,255,.25), rgba(173,92,255,.2)); }
        .adminOverlay {
          position: fixed; inset: 0; z-index: 120; padding: 22px; overflow: auto;
          background: rgba(3,5,12,.82); backdrop-filter: blur(18px);
        }
        .adminShell {
          width: min(1320px, 100%); margin: 0 auto; min-height: calc(100vh - 44px);
          background: linear-gradient(180deg, #0d1120, #090c16);
          border: 1px solid rgba(255,255,255,.08); border-radius: 26px;
          box-shadow: 0 30px 100px rgba(0,0,0,.55); overflow: hidden;
        }
        .adminTop { padding: 25px 28px; display:flex; justify-content:space-between; gap:20px; align-items:center; border-bottom:1px solid rgba(255,255,255,.07); }
        .adminTop h2 { margin: 4px 0 5px; font-size: 32px; letter-spacing:-1.2px; }
        .adminTop p { margin:0; color:#8993a8; font-size:12px; }
        .adminClose { width:42px; height:42px; border-radius:13px; border:1px solid rgba(255,255,255,.08); background:#121727; color:#fff; font-size:25px; }
        .adminBody { padding: 24px 28px 32px; }
        .adminStats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:18px; }
        .adminStat { padding:20px; border-radius:18px; border:1px solid rgba(255,255,255,.07); background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018)); }
        .adminStat span { color:#8993a8; font-size:11px; text-transform:uppercase; letter-spacing:.8px; font-weight:800; }
        .adminStat strong { display:block; margin-top:9px; font-size:25px; letter-spacing:-.8px; }
        .adminStat small { display:block; margin-top:6px; color:#69748a; font-size:10px; }
        .adminAnalytics { display:grid; grid-template-columns:1.35fr 1fr; gap:14px; margin: 18px 0; }
        .adminAnalyticsCard { border:1px solid rgba(255,255,255,.07); border-radius:18px; padding:18px; background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018)); }
        .adminAnalyticsHead { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:15px; }
        .adminAnalyticsHead h3 { margin:0; font-size:15px; }
        .adminAnalyticsHead span { color:#69748a; font-size:10px; }
        .adminMiniRevenue { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-bottom:15px; }
        .adminMiniMetric { padding:12px; border-radius:13px; background:#0a0f1c; border:1px solid rgba(255,255,255,.05); }
        .adminMiniMetric span { display:block; color:#69748a; font-size:9px; text-transform:uppercase; letter-spacing:.7px; }
        .adminMiniMetric strong { display:block; margin-top:5px; font-size:17px; }
        .adminBars { height:150px; display:flex; align-items:flex-end; gap:9px; padding-top:10px; }
        .adminBarItem { flex:1; height:100%; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; gap:7px; min-width:24px; }
        .adminBarValue { color:#aab6ff; font-size:8px; white-space:nowrap; }
        .adminBarTrack { width:100%; max-width:38px; height:105px; display:flex; align-items:flex-end; border-radius:9px 9px 5px 5px; background:#0a0f1b; overflow:hidden; }
        .adminBarFill { width:100%; min-height:4px; border-radius:9px 9px 5px 5px; background:linear-gradient(180deg,#91a7ff,#6f55ff); transition:height .4s ease; }
        .adminBarLabel { color:#69748a; font-size:9px; }
        .adminStatusList { display:grid; gap:9px; }
        .adminStatusRow { display:grid; grid-template-columns:105px 1fr 30px; align-items:center; gap:10px; font-size:10px; }
        .adminStatusRow > span:first-child { color:#aab2c2; }
        .adminStatusTrack { height:7px; background:#0a0f1b; border-radius:99px; overflow:hidden; }
        .adminStatusFill { height:100%; border-radius:99px; background:linear-gradient(90deg,#6f55ff,#91a7ff); }
        .adminStatusRow strong { text-align:right; font-size:10px; }
        .adminTopProducts { margin:0 0 18px; border:1px solid rgba(255,255,255,.07); border-radius:18px; padding:18px; background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018)); }
        .adminProductRow { display:grid; grid-template-columns:190px 1fr 75px; gap:12px; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.05); }
        .adminProductRow:last-child { border-bottom:0; }
        .adminProductName { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:10px; font-weight:800; }
        .adminProductTrack { height:7px; background:#0a0f1b; border-radius:99px; overflow:hidden; }
        .adminProductFill { height:100%; border-radius:99px; background:linear-gradient(90deg,#7c5cff,#9cb1ff); }
        .adminProductQty { text-align:right; color:#9aa3b5; font-size:10px; }
        .adminAnalyticsControls { display:flex; justify-content:space-between; align-items:center; gap:15px; margin-bottom:16px; padding:14px 16px; border:1px solid rgba(255,255,255,.07); border-radius:16px; background:rgba(255,255,255,.025); }
        .adminControlEyebrow { display:block; color:#69748a; font-size:8px; letter-spacing:1px; font-weight:900; margin-bottom:4px; }
        .adminAnalyticsControls strong { font-size:14px; }
        .adminRangeButtons { display:flex; gap:7px; flex-wrap:wrap; justify-content:flex-end; }
        .adminRangeButtons button { border:1px solid rgba(255,255,255,.08); background:#0b0f1b; color:#9aa3b5; padding:9px 12px; border-radius:10px; font-size:10px; font-weight:800; cursor:pointer; }
        .adminRangeButtons button.active { color:#fff; background:linear-gradient(135deg,#5c4cff,#8c7bff); border-color:transparent; }
        .adminRangeButtons .adminExportButton { color:#fff; background:rgba(255,255,255,.07); }
        .adminInsightGrid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:18px; }
        .adminBreakdownList { display:grid; gap:11px; }
        .adminBreakdownRow { display:grid; grid-template-columns:90px 1fr 28px; align-items:center; gap:10px; font-size:10px; }
        .adminBreakdownRow span { color:#aab2c2; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .adminBreakdownRow strong { text-align:right; }
        .adminMutedText { color:#69748a; font-size:11px; margin:10px 0; }
        .adminCategoryRow { display:grid; grid-template-columns:105px 1fr 85px; gap:10px; align-items:center; padding:9px 0; border-bottom:1px solid rgba(255,255,255,.05); }
        .adminCategoryRow:last-child { border-bottom:0; }
        .adminCategoryRow div:first-child { display:flex; flex-direction:column; gap:3px; }
        .adminCategoryRow strong { font-size:10px; }
        .adminCategoryRow span { color:#69748a; font-size:8px; }
        .adminCategoryRow b { text-align:right; font-size:10px; }
        .adminCategoryTrack { height:7px; background:#0a0f1b; border-radius:99px; overflow:hidden; }
        .adminCustomerPulse { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .adminCustomerPulse div { padding:14px; background:#0a0f1c; border:1px solid rgba(255,255,255,.05); border-radius:13px; }
        .adminCustomerPulse span { display:block; color:#69748a; font-size:9px; }
        .adminCustomerPulse strong { display:block; margin-top:5px; font-size:20px; }
        .adminToolbar { display:flex; gap:10px; margin: 18px 0; flex-wrap:wrap; }
        .adminSearch { flex:1 1 260px; min-width:200px; background:#0b0f1b; color:#fff; border:1px solid rgba(255,255,255,.08); border-radius:13px; padding:13px 14px; outline:none; }
        .adminFilter { background:#0b0f1b; color:#fff; border:1px solid rgba(255,255,255,.08); border-radius:13px; padding:13px 14px; outline:none; }
        .adminTableWrap { overflow:auto; border:1px solid rgba(255,255,255,.07); border-radius:18px; background:rgba(7,10,18,.55); }
        .adminTable { width:100%; border-collapse:collapse; min-width:850px; }
        .adminTable th { text-align:left; padding:13px 15px; color:#69748a; font-size:10px; text-transform:uppercase; letter-spacing:.7px; border-bottom:1px solid rgba(255,255,255,.07); }
        .adminTable td { padding:15px; border-bottom:1px solid rgba(255,255,255,.05); vertical-align:middle; font-size:12px; }
        .adminTable tr:last-child td { border-bottom:0; }
        .adminCustomer strong { display:block; color:#eef1f7; }
        .adminCustomer span { color:#6f788a; font-size:10px; }
        .adminOrderId { color:#91a7ff; font-weight:900; }
        .adminStatus { border-radius:999px; padding:7px 9px; font-size:9px; font-weight:900; border:1px solid rgba(255,255,255,.08); background:#111728; color:#dfe5f5; }
        .adminViewButton { border:1px solid rgba(255,255,255,.08); background:#121827; color:#fff; padding:8px 10px; border-radius:10px; font-weight:800; font-size:10px; }
        .adminViewButton:hover { background:#1a2134; }
        .adminEmpty { text-align:center; padding:70px 20px; color:#737e92; }
        .adminDetail { margin-top:20px; padding:20px; border:1px solid rgba(255,255,255,.07); border-radius:18px; background:#0a0e19; }
        .adminDetailHead { display:flex; justify-content:space-between; gap:15px; align-items:flex-start; margin-bottom:18px; }
        .adminDetailHead h3 { margin:4px 0; font-size:22px; }
        .adminDetailHead p { margin:0; color:#6f788a; font-size:11px; }
        .adminStatusSelect { background:#111827; color:#fff; border:1px solid rgba(255,255,255,.1); padding:11px 12px; border-radius:11px; font-weight:800; }
        .adminDetailGrid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .adminDetailCard { border:1px solid rgba(255,255,255,.06); border-radius:15px; padding:16px; }
        .adminDetailCard h4 { margin:0 0 10px; font-size:12px; }
        .adminDetailCard p { margin:5px 0; color:#9aa3b5; font-size:11px; }
        .adminItem { display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid rgba(255,255,255,.05); }
        .adminItem:last-child { border-bottom:0; }
        .adminItem img { width:44px; height:44px; object-fit:cover; border-radius:10px; }
        .adminItem div { flex:1; }
        .adminItem strong { display:block; font-size:11px; }
        .adminItem span { color:#707a8e; font-size:9px; }
        .adminNav { display:flex; gap:8px; padding:0 28px; border-top:1px solid rgba(255,255,255,.05); border-bottom:1px solid rgba(255,255,255,.06); background:rgba(7,10,18,.42); }
        .adminNavButton { border:0; background:transparent; color:#7f899c; padding:13px 14px; font-weight:900; font-size:11px; cursor:pointer; border-bottom:2px solid transparent; }
        .adminNavButton.active { color:#fff; border-bottom-color:#91a7ff; }
        .adminNavButton span { margin-left:6px; padding:2px 6px; border-radius:999px; background:#171e31; color:#aab6ff; }
        .adminCustomersSection { min-height:400px; }
        .customerSectionIntro { display:flex; justify-content:space-between; gap:20px; align-items:flex-end; margin-bottom:18px; }
        .customerSectionIntro h3 { margin:4px 0; font-size:24px; }
        .customerSectionIntro p { margin:0; color:#69748a; font-size:11px; }
        .customerSectionCount { padding:12px 15px; border:1px solid rgba(255,255,255,.07); border-radius:14px; background:#0b0f1b; text-align:right; }
        .customerSectionCount strong { display:block; font-size:22px; }
        .customerSectionCount span { color:#69748a; font-size:9px; text-transform:uppercase; letter-spacing:.6px; }
        .customerToolbar { display:flex; gap:10px; margin-bottom:14px; }
        .customerCards { display:grid; gap:10px; }
        .customerCard { width:100%; display:grid; grid-template-columns:50px minmax(180px,1fr) 90px 110px 24px; gap:14px; align-items:center; text-align:left; padding:14px; border:1px solid rgba(255,255,255,.06); border-radius:16px; background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.015)); color:#fff; cursor:pointer; transition:.2s ease; }
        .customerCard:hover { transform:translateY(-1px); border-color:rgba(145,167,255,.35); background:#101626; }
        .customerAvatar { width:46px; height:46px; border-radius:14px; display:grid; place-items:center; overflow:hidden; background:linear-gradient(135deg,#252d50,#151b31); border:1px solid rgba(255,255,255,.08); font-weight:900; color:#b9c5ff; }
        .customerAvatar.large { width:58px; height:58px; border-radius:17px; }
        .customerAvatar img { width:100%; height:100%; object-fit:cover; }
        .customerMain strong { display:block; font-size:13px; }
        .customerMain span { display:block; margin-top:3px; color:#9aa3b5; font-size:10px; }
        .customerMain small { display:block; margin-top:5px; color:#626c7f; font-size:9px; }
        .customerMetric { padding-left:12px; border-left:1px solid rgba(255,255,255,.06); }
        .customerMetric b { display:block; font-size:13px; }
        .customerMetric span { color:#69748a; font-size:9px; text-transform:uppercase; letter-spacing:.5px; }
        .customerArrow { color:#7f8aa1; font-size:24px; text-align:right; }
        .customerDetail { margin-top:18px; padding:20px; border:1px solid rgba(255,255,255,.07); border-radius:18px; background:#0a0e19; }
        .customerDetailTop { display:flex; justify-content:space-between; align-items:center; gap:15px; margin-bottom:18px; }
        .customerProfileHero { display:flex; align-items:center; gap:13px; }
        .customerProfileHero h3 { margin:2px 0; font-size:20px; }
        .customerProfileHero p { margin:0; color:#737e92; font-size:10px; }
        .customerDetailStats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:18px; }
        .customerDetailStats > div { padding:13px; border-radius:13px; background:#0e1422; border:1px solid rgba(255,255,255,.05); }
        .customerDetailStats span { display:block; color:#69748a; font-size:9px; text-transform:uppercase; letter-spacing:.5px; }
        .customerDetailStats strong { display:block; margin-top:6px; font-size:13px; }
        .customerHistory { border-top:1px solid rgba(255,255,255,.06); padding-top:15px; }
        .customerHistory h4 { margin:0 0 10px; font-size:12px; }
        .customerHistoryRow { display:flex; justify-content:space-between; gap:15px; padding:11px 0; border-bottom:1px solid rgba(255,255,255,.05); }
        .customerHistoryRow strong { display:block; font-size:11px; }
        .customerHistoryRow span { display:block; margin-top:3px; color:#69748a; font-size:9px; }
        .customerHistoryRow b { font-size:11px; }
        .customerNoOrders { color:#69748a; font-size:10px; }
        .adminReviewsSection { min-height:400px; }
        .reviewAdminIntro { display:flex; justify-content:space-between; gap:20px; align-items:flex-end; margin-bottom:18px; }
        .reviewAdminIntro h3 { margin:4px 0; font-size:24px; }
        .reviewAdminIntro p { margin:0; color:#69748a; font-size:11px; }
        .reviewAdminStats { display:grid; grid-template-columns:repeat(4,minmax(105px,1fr)); gap:8px; }
        .reviewAdminStats > div { min-width:105px; padding:11px 12px; border:1px solid rgba(255,255,255,.07); border-radius:13px; background:#0b0f1b; }
        .reviewAdminStats span { display:block; color:#69748a; font-size:8px; text-transform:uppercase; letter-spacing:.55px; }
        .reviewAdminStats strong { display:block; margin-top:5px; font-size:16px; }
        .reviewAdminList { display:grid; gap:10px; }
        .reviewAdminCard { display:grid; grid-template-columns:210px minmax(240px,1fr) 76px; gap:15px; align-items:center; padding:15px; border:1px solid rgba(255,255,255,.06); border-radius:16px; background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.015)); }
        .reviewAdminProduct { display:flex; align-items:center; gap:10px; min-width:0; }
        .reviewAdminProduct img, .reviewAdminImageFallback { width:48px; height:48px; border-radius:12px; object-fit:cover; background:#151c2d; border:1px solid rgba(255,255,255,.07); display:grid; place-items:center; color:#9eaeff; font-weight:900; }
        .reviewAdminProduct strong { display:block; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .reviewAdminProduct span { display:block; margin-top:4px; color:#69748a; font-size:9px; }
        .reviewAdminContent { min-width:0; }
        .reviewAdminTopline { display:flex; align-items:center; gap:8px; }
        .reviewAdminStars { color:#ffc857; letter-spacing:1px; font-size:12px; }
        .reviewAdminTopline b { color:#e8ecf5; font-size:10px; }
        .reviewAdminTopline small { color:#69748a; font-size:9px; }
        .reviewAdminContent p { margin:7px 0; color:#b8c0cf; font-size:11px; line-height:1.55; }
        .reviewAdminCustomer { display:flex; align-items:center; gap:7px; color:#69748a; font-size:9px; }
        .reviewAdminCustomer strong { color:#cfd6e4; }
        .reviewCustomerAvatar { width:23px; height:23px; border-radius:8px; display:grid; place-items:center; background:#151d32; color:#aab6ff; font-weight:900; font-size:9px; }
        .reviewDeleteButton { border:1px solid rgba(255,100,120,.22); background:rgba(255,75,95,.07); color:#ff9aa8; padding:9px 9px; border-radius:10px; font-size:9px; font-weight:900; cursor:pointer; }
        .reviewDeleteButton:hover { background:rgba(255,75,95,.13); }
        .reviewDeleteButton:disabled { opacity:.55; cursor:not-allowed; }
        .adminRefresh { border:1px solid rgba(255,255,255,.08); background:#121827; color:#fff; padding:12px 14px; border-radius:12px; font-weight:800; }
        @media (max-width: 900px) { .adminStats { grid-template-columns:repeat(2,1fr); } .adminAnalytics { grid-template-columns:1fr; } .adminInsightGrid { grid-template-columns:1fr; } .adminAnalyticsControls { align-items:flex-start; flex-direction:column; } .adminRangeButtons { justify-content:flex-start; } .adminBody { padding:20px; } .adminTop { padding:20px; } }
        @media (max-width: 700px) { .reviewAdminIntro { align-items:flex-start; flex-direction:column; } .reviewAdminStats { width:100%; grid-template-columns:1fr 1fr; } .reviewAdminCard { grid-template-columns:1fr 70px; } .reviewAdminProduct { grid-column:1 / -1; } .reviewAdminContent { grid-column:1 / -1; } .reviewDeleteButton { grid-column:2; grid-row:2; justify-self:end; } .customerCard { grid-template-columns:46px 1fr 70px; } .customerMetric:nth-of-type(4), .customerArrow { display:none; } .customerSectionIntro { align-items:flex-start; flex-direction:column; } .customerDetailStats { grid-template-columns:1fr 1fr; } .customerToolbar { flex-direction:column; } .adminNav { padding:0 14px; } }
        @media (max-width: 760px) { .adminSection > div[style*="grid-template-columns:repeat(4"] { grid-template-columns:1fr 1fr !important; } }
        @media (max-width: 560px) { .adminAnalyticsControls { padding:12px; } .adminRangeButtons button { padding:8px 9px; } .adminCategoryRow { grid-template-columns:85px 1fr 70px; } .adminOverlay { padding:8px; } .adminShell { min-height:calc(100vh - 16px); border-radius:18px; } .adminStats { grid-template-columns:1fr 1fr; gap:9px; } .adminStat { padding:14px; } .adminStat strong { font-size:20px; } .adminDetailGrid { grid-template-columns:1fr; } .adminDetailHead { flex-direction:column; } .adminProductRow { grid-template-columns:1fr 65px; } .adminProductTrack { grid-column:1 / -1; grid-row:2; } .adminProductQty { grid-column:2; grid-row:1; } .adminStatusRow { grid-template-columns:92px 1fr 24px; } }

        .adminDetail { margin-top:20px; padding:22px; border:1px solid rgba(255,255,255,.08); border-radius:22px; background:linear-gradient(145deg,rgba(18,24,39,.96),rgba(7,10,18,.98)); box-shadow:0 18px 55px rgba(0,0,0,.25); }
        .adminDetailHead { display:flex; justify-content:space-between; gap:15px; align-items:flex-start; margin-bottom:20px; }
        .adminDetailHead h3 { margin:5px 0 4px; font-size:24px; letter-spacing:-.7px; }
        .adminDetailHead p { margin:0; color:#778196; font-size:11px; }
        .adminDetailHeadActions { display:flex; align-items:center; gap:8px; }
        .adminDetailClose { width:38px; height:38px; border-radius:11px; border:1px solid rgba(255,255,255,.08); background:#111827; color:#aeb8ca; font-size:19px; cursor:pointer; }
        .adminTimeline { display:grid; grid-template-columns:repeat(6,1fr); gap:8px; padding:16px; margin-bottom:16px; border:1px solid rgba(255,255,255,.06); border-radius:16px; background:rgba(255,255,255,.018); }
        .adminTimelineStep { position:relative; text-align:center; color:#687388; }
        .adminTimelineDot { width:30px; height:30px; margin:0 auto 8px; display:grid; place-items:center; border-radius:50%; border:1px solid rgba(255,255,255,.1); background:#101624; font-size:11px; font-weight:900; }
        .adminTimelineStep.active { color:#dce4f5; }
        .adminTimelineStep.active .adminTimelineDot { background:#dce8ff; color:#111827; border-color:#dce8ff; box-shadow:0 0 0 5px rgba(220,232,255,.07); }
        .adminTimelineStep.current .adminTimelineDot { outline:2px solid rgba(145,167,255,.55); outline-offset:3px; }
        .adminTimelineStep span { display:block; font-size:8px; font-weight:900; line-height:1.3; }
        .adminCancelled { padding:13px 15px; margin-bottom:16px; border-radius:13px; border:1px solid rgba(255,120,120,.2); background:rgba(255,80,80,.06); color:#ffb4b4; font-size:11px; font-weight:800; }
        .adminDetailGrid { display:grid; grid-template-columns:1fr 1.35fr; gap:14px; }
        .adminDetailCard { border:1px solid rgba(255,255,255,.06); border-radius:16px; padding:17px; background:rgba(255,255,255,.018); }
        .adminDetailCard h4 { margin:0 0 13px; font-size:12px; }
        .adminInfoRow { display:flex; gap:10px; padding:9px 0; border-bottom:1px solid rgba(255,255,255,.05); }
        .adminInfoRow:last-child { border-bottom:0; }
        .adminInfoIcon { width:28px; height:28px; flex:0 0 28px; display:grid; place-items:center; border-radius:9px; background:#121a2b; font-size:12px; }
        .adminInfoText span { display:block; color:#687388; font-size:8px; text-transform:uppercase; letter-spacing:.7px; font-weight:900; margin-bottom:3px; }
        .adminInfoText strong { display:block; color:#e9edf6; font-size:11px; line-height:1.45; }
        .adminItem { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.05); }
        .adminItem:last-child { border-bottom:0; }
        .adminItem img { width:50px; height:50px; object-fit:cover; border-radius:12px; background:#151b2a; }
        .adminItem div { flex:1; min-width:0; }
        .adminItem strong { display:block; font-size:11px; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .adminItem span { color:#707a8e; font-size:9px; }
        .adminItem b { font-size:11px; white-space:nowrap; }
        .adminMoney { margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,.07); }
        .adminMoneyRow { display:flex; justify-content:space-between; padding:5px 0; color:#7e899d; font-size:10px; }
        .adminMoneyRow strong { color:#dfe5f2; }
        .adminMoneyTotal { display:flex; justify-content:space-between; margin-top:7px; padding-top:10px; border-top:1px solid rgba(255,255,255,.08); color:#fff; font-size:12px; }
        .adminMoneyTotal strong { font-size:16px; }
        .adminPaymentChip { display:inline-flex !important; width:max-content; margin-top:7px; padding:6px 9px; border-radius:999px; background:#111b2d; color:#a9c0ff !important; font-size:9px !important; font-weight:900; text-transform:uppercase; }
        .adminSection { margin-top:22px; padding:20px; border:1px solid rgba(255,255,255,.07); border-radius:18px; background:rgba(7,10,18,.55); }
        .adminSectionHead { display:flex; justify-content:space-between; gap:14px; align-items:flex-end; margin-bottom:16px; }
        .adminSectionHead h3 { margin:3px 0 4px; font-size:19px; }
        .adminSectionHead p { margin:0; color:#737e92; font-size:10px; }
        .adminProductForm { display:grid; grid-template-columns:repeat(2,1fr); gap:11px; padding:15px; margin-bottom:15px; border:1px solid rgba(255,255,255,.06); border-radius:15px; background:#0a0e19; }
        .adminProductForm input, .adminProductForm select, .adminProductForm textarea { width:100%; box-sizing:border-box; background:#111827; color:#fff; border:1px solid rgba(255,255,255,.09); border-radius:11px; padding:11px 12px; outline:none; font:inherit; }
        .adminProductForm textarea { min-height:82px; resize:vertical; }
        .adminProductForm .full { grid-column:1 / -1; }
        .adminProductActions { grid-column:1 / -1; display:flex; gap:9px; justify-content:flex-end; }
        .adminPrimaryButton, .adminSecondaryButton { border-radius:11px; padding:11px 14px; font-weight:900; border:1px solid rgba(255,255,255,.09); cursor:pointer; }
        .adminPrimaryButton { background:linear-gradient(135deg,#8096ff,#a56cff); color:#fff; }
        .adminSecondaryButton { background:#121827; color:#fff; }
        .adminProductGrid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
        .adminProductRow { display:flex; align-items:center; gap:12px; padding:12px; border:1px solid rgba(255,255,255,.06); border-radius:14px; background:#0a0e19; }
        .adminProductRow img { width:58px; height:58px; object-fit:cover; border-radius:12px; background:#151b2b; }
        .adminProductInfo { flex:1; min-width:0; }
        .adminProductInfo strong { display:block; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .adminProductInfo span { display:block; margin-top:4px; color:#737e92; font-size:10px; }
        .adminProductPrice { text-align:right; white-space:nowrap; }
        .adminProductPrice strong { display:block; font-size:12px; }
        .adminProductPrice span { color:#737e92; font-size:9px; }
        .adminProductRowActions { display:flex; gap:6px; }
        .adminMiniButton { border:1px solid rgba(255,255,255,.08); background:#121827; color:#fff; padding:8px 9px; border-radius:9px; font-size:9px; font-weight:800; cursor:pointer; }
        @media (max-width: 900px) { .adminDetailGrid { grid-template-columns:1fr; } .adminTimeline { grid-template-columns:repeat(3,1fr); } .adminProductGrid { grid-template-columns:1fr; } }
        @media (max-width: 560px) { .adminDetailHead { flex-direction:column; } .adminDetailHeadActions { width:100%; } .adminStatusSelect { flex:1; } .adminTimeline { grid-template-columns:repeat(2,1fr); } .adminProductForm { grid-template-columns:1fr; } .adminProductForm .full { grid-column:auto; } }

        .wishlistButton { border:1px solid rgba(22,29,43,.12); background:#fff; color:#111827; border-radius:999px; padding:10px 13px; font-weight:800; cursor:pointer; white-space:nowrap; }
        .wishlistButton:hover { transform:translateY(-1px); box-shadow:0 10px 24px rgba(17,24,39,.08); }
        .wishlistOverlay { position:fixed; inset:0; z-index:80; background:rgba(7,10,18,.52); backdrop-filter:blur(7px); display:flex; justify-content:flex-end; }
        .wishlistDrawer { width:min(500px,94vw); height:100%; overflow:auto; background:#0b0f18; color:#f4f6fb; padding:25px; box-sizing:border-box; box-shadow:-24px 0 70px rgba(0,0,0,.28); animation:wishlistIn .22s ease-out; }
        @keyframes wishlistIn { from { transform:translateX(35px); opacity:.4; } to { transform:translateX(0); opacity:1; } }
        .wishlistHead { display:flex; justify-content:space-between; align-items:flex-start; gap:15px; padding-bottom:20px; border-bottom:1px solid rgba(255,255,255,.08); }
        .wishlistHead h2 { margin:3px 0 5px; font-size:27px; }
        .wishlistHead p { margin:0; color:#8490a6; font-size:12px; }
        .wishlistEmpty { min-height:65vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:#8994a9; }
        .wishlistEmptyIcon { width:78px; height:78px; border-radius:24px; display:grid; place-items:center; background:rgba(255,255,255,.06); color:#ff5c7c; font-size:40px; margin-bottom:14px; }
        .wishlistEmpty h3 { color:#fff; margin:0 0 7px; font-size:18px; }
        .wishlistEmpty p { max-width:300px; margin:0 0 20px; line-height:1.6; }
        .wishlistShopButton, .wishlistCheckoutButton { width:100%; border:0; border-radius:13px; padding:13px 15px; background:linear-gradient(135deg,#8096ff,#a56cff); color:#fff; font-weight:900; cursor:pointer; }
        .wishlistToolbar { display:flex; justify-content:space-between; align-items:center; padding:17px 0 12px; color:#8994a9; font-size:11px; }
        .wishlistToolbar button { border:1px solid rgba(255,255,255,.1); background:#141a27; color:#fff; border-radius:10px; padding:9px 11px; font-weight:800; cursor:pointer; }
        .wishlistList { display:flex; flex-direction:column; gap:12px; padding-bottom:15px; }
        .wishlistItem { display:flex; gap:13px; padding:12px; border:1px solid rgba(255,255,255,.07); background:#101522; border-radius:17px; }
        .wishlistItem img { width:88px; height:88px; object-fit:cover; border-radius:13px; flex:none; background:#161d2c; }
        .wishlistItemInfo { min-width:0; flex:1; }
        .wishlistItemCategory { color:#8e9ab0; text-transform:uppercase; letter-spacing:.08em; font-size:8px; font-weight:900; }
        .wishlistItemInfo h3 { margin:4px 0; font-size:13px; color:#fff; }
        .wishlistItemInfo strong { font-size:13px; color:#fff; }
        .wishlistItemInfo > span { display:block; margin-top:4px; color:#78849b; font-size:9px; }
        .wishlistItemActions { display:flex; gap:7px; margin-top:9px; }
        .wishlistCartButton { border:0; background:#fff; color:#111827; border-radius:9px; padding:7px 9px; font-size:9px; font-weight:900; cursor:pointer; }
        .wishlistRemove { border:1px solid rgba(255,255,255,.09); background:transparent; color:#aab3c4; border-radius:9px; padding:7px 9px; font-size:9px; font-weight:800; cursor:pointer; }
        .wishlistRemove:hover { color:#ff7f99; border-color:rgba(255,127,153,.3); }
        .wishlistCheckoutButton { margin-top:5px; }
        @media (max-width:900px) { .wishlistButton { padding:9px 10px; } }
        @media (max-width:700px) { .wishlistButton { display:none; } .wishlistDrawer { width:100%; padding:20px; } }


        .notificationButton { position:relative; width:42px; height:42px; border:1px solid rgba(22,29,43,.12); background:#fff; color:#111827; border-radius:50%; cursor:pointer; font-size:17px; display:grid; place-items:center; }
        .notificationButton:hover { transform:translateY(-1px); box-shadow:0 10px 24px rgba(17,24,39,.08); }
        .notificationBadge { position:absolute; top:-4px; right:-3px; min-width:18px; height:18px; padding:0 5px; border-radius:999px; display:grid; place-items:center; background:#ff4f6d; color:#fff; font-size:9px; font-weight:900; border:2px solid #fff; }
        .notificationOverlay { position:fixed; inset:0; z-index:85; background:rgba(7,10,18,.45); backdrop-filter:blur(6px); display:flex; justify-content:flex-end; }
        .notificationDrawer { width:min(430px,94vw); height:100%; overflow:auto; background:#0b0f18; color:#f4f6fb; padding:22px; box-shadow:-24px 0 70px rgba(0,0,0,.3); animation:notificationIn .2s ease-out; }
        @keyframes notificationIn { from { transform:translateX(30px); opacity:.5; } to { transform:translateX(0); opacity:1; } }
        .notificationHead { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; padding-bottom:18px; border-bottom:1px solid rgba(255,255,255,.08); }
        .notificationHead h2 { margin:3px 0 5px; font-size:25px; }
        .notificationHead p { margin:0; color:#8490a6; font-size:11px; }
        .notificationActions { display:flex; gap:7px; margin:16px 0; }
        .notificationActions button { border:1px solid rgba(255,255,255,.09); background:#141a27; color:#fff; border-radius:9px; padding:8px 10px; font-size:9px; font-weight:800; cursor:pointer; }
        .notificationList { display:flex; flex-direction:column; gap:9px; }
        .notificationItem { width:100%; text-align:left; border:1px solid rgba(255,255,255,.07); background:#101522; color:#fff; border-radius:15px; padding:13px; cursor:pointer; }
        .notificationItem.unread { border-color:rgba(128,150,255,.45); background:linear-gradient(135deg,rgba(128,150,255,.12),#101522); }
        .notificationItemTop { display:flex; align-items:center; gap:9px; }
        .notificationIcon { width:32px; height:32px; flex:none; display:grid; place-items:center; border-radius:10px; background:rgba(128,150,255,.13); }
        .notificationItem strong { font-size:12px; }
        .notificationItem small { margin-left:auto; color:#707b91; font-size:8px; }
        .notificationItem p { margin:8px 0 0 41px; color:#8994a9; font-size:10px; line-height:1.5; }
        .notificationEmpty { min-height:55vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:#8994a9; }
        .notificationEmptyIcon { width:68px; height:68px; border-radius:22px; display:grid; place-items:center; background:rgba(255,255,255,.06); font-size:30px; margin-bottom:12px; }
        @media (max-width:700px) { .notificationButton { display:none; } .notificationDrawer { width:100%; padding:20px; } }


      `}
</style>

      <div className="topbar">
        ✨ Free delivery on orders above ₹999 &nbsp; • &nbsp; Easy 7-day returns
      </div>

      <header className="container navbar">
        <div className="logo">VELO<span>.</span></div>

        <nav className="navlinks">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Home
          </button>
          <button onClick={scrollToProducts}>Products</button>
          <button
            onClick={() =>
              document
                .getElementById("categories")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Categories
          </button>
          <button
            onClick={() =>
              document
                .getElementById("deals")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Deals
          </button>
          <button
            onClick={() =>
              document
                .getElementById("about")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            About
          </button>
        </nav>

        <div className="search">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
          />
        </div>

        <button
          className="wishlistButton"
          onClick={() => setShowWishlist(true)}
          aria-label="Open wishlist"
        >
          ♥ Wishlist {liked.length > 0 ? `(${liked.length})` : ""}
        </button>

        {loggedIn && (
          <button
            className="notificationButton"
            onClick={() => { setShowNotifications(true); loadNotifications(); }}
            aria-label="Open notifications"
          >
            🔔
            {unreadNotificationCount > 0 && (
              <span className="notificationBadge">{unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}</span>
            )}
          </button>
        )}

        <button className="accountButton" onClick={openProfile}>
          {loggedIn ? (
            <span className="profilePill">
              <span className="avatar">
                {(profileName || authName || "V").trim().charAt(0).toUpperCase()}
              </span>
              Account
            </span>
          ) : (
            "Login / Sign up"
          )}
        </button>

        <button className="cartButton" onClick={() => setShowCart(true)}>
          🛒 Cart {cartCount > 0 ? `(${cartCount})` : ""}
        </button>
      </header>

      <section className="container hero">
        <div className="heroGrid">
          <div>
            <div className="eyebrow">CURATED. MODERN. YOURS.</div>
            <h1>
              Level Up
              <br />
              <span>Your Lifestyle.</span>
            </h1>
            <p className="heroText">
              Discover premium products across tech, fashion, home, beauty,
              travel and gaming — selected to make everyday life a little more
              exceptional.
            </p>

            <div className="heroButtons">
              <button className="primaryButton" onClick={scrollToProducts}>
                Shop Collection →
              </button>
              <button
                className="secondaryButton"
                onClick={() => {
                  setSelectedCategory("Electronics");
                  scrollToProducts();
                }}
              >
                Explore Tech
              </button>
            </div>

            <div className="heroTrust">
              <div>
                <span>🚚</span>
                <strong>Free Delivery</strong>
                <small>Orders above ₹999</small>
              </div>
              <div>
                <span>🔒</span>
                <strong>Secure Payment</strong>
                <small>Trusted checkout flow</small>
              </div>
              <div>
                <span>↩️</span>
                <strong>Easy Returns</strong>
                <small>7-day hassle free</small>
              </div>
            </div>
          </div>

          <div className="heroVisual">
            <div className="heroProductCard">
              <div className="heroProductImage">
                <img
                  className="heroRealImage"
                  src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=90"
                  alt="Premium technology collection"
                />
                <div className="heroFloatingCard">
                  <span>NEW DROP</span>
                  <strong>Nova X Pro</strong>
                  <small>Tech essentials from ₹999</small>
                </div>
              </div>
              <div className="heroProductInfo">
                <small>FEATURED DROP</small>
                <h3>Nova X Pro Collection</h3>
                <p>Starting ₹2,499</p>
                <button onClick={scrollToProducts}>View Collection →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container" id="categories">
        <div className="categories">
          {categories.map((category) => (
            <button
              key={category}
              className={`categoryBtn ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => {
                setSelectedCategory(category);
                scrollToProducts();
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {flashSaleActive && flashSaleProductIds.size > 0 && (
        <section className="container" style={{ marginTop: 28 }}>
          <div style={{ position: "relative", overflow: "hidden", borderRadius: 28, padding: 24, border: "1px solid rgba(255,160,90,0.22)", background: "linear-gradient(135deg, rgba(255,132,52,0.12), rgba(105,71,255,0.08) 55%, rgba(10,12,24,0.94))", boxShadow: "0 18px 50px rgba(0,0,0,0.22)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 18 }}>
              <div>
                <div className="sectionLabel" style={{ color: "#ffb36b" }}>⚡ LIMITED TIME</div>
                <h2 style={{ margin: "5px 0 4px" }}>FLASH SALE</h2>
                <p style={{ margin: 0, color: "#9aa3b8", fontSize: 13 }}>Exclusive discounts on selected VELO favourites.</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", borderRadius: 14, background: "rgba(0,0,0,0.28)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ color: "#8f98aa", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Ends in</span>
                <strong style={{ fontSize: 20, letterSpacing: 2, fontVariantNumeric: "tabular-nums" }}>{formatFlashSaleTime()}</strong>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14 }}>
              {products.filter((product) => flashSaleProductIds.has(product.id)).slice(0, 4).map((product) => {
                const salePrice = getSalePrice(product);
                const percent = getFlashSalePercent(product);
                const stockState = getStockState(product);
                return (
                  <article key={`flash-${product.id}`} onClick={() => setSelectedProduct(product)} style={{ cursor: "pointer", borderRadius: 19, overflow: "hidden", background: "rgba(5,7,15,0.72)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ position: "relative" }}>
                      <img src={product.image} alt={product.name} loading="lazy" style={{ width: "100%", aspectRatio: "1 / 0.82", objectFit: "cover", display: "block" }} />
                      <span style={{ position: "absolute", top: 10, left: 10, padding: "5px 8px", borderRadius: 999, background: "#ff8a3d", color: "#160b04", fontSize: 10, fontWeight: 950 }}>-{percent}%</span>
                    </div>
                    <div style={{ padding: 13 }}>
                      <div style={{ color: "#7f89a1", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>{product.category}</div>
                      <strong style={{ display: "block", marginTop: 5, lineHeight: 1.35 }}>{product.name}</strong>
                      <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 7 }}>
                        <span style={{ fontSize: 17, fontWeight: 950 }}>₹{salePrice.toLocaleString("en-IN")}</span>
                        <del style={{ color: "#687187", fontSize: 11 }}>₹{product.price.toLocaleString("en-IN")}</del>
                      </div>
                      <div style={{ marginTop: 8, color: stockState.tone === "danger" ? "#ff7c7c" : "#ffb36b", fontSize: 10, fontWeight: 800 }}>{stockState.label}</div>
                      <button className="addButton" disabled={stockState.disabled} onClick={(event) => { event.stopPropagation(); addToCart(product.id); }} style={{ width: "100%", marginTop: 10 }}>{stockState.disabled ? "Out of Stock" : "Grab Deal +"}</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="container" id="products">
        <div className="sectionHeader">
          <div>
            <div className="sectionLabel">OUR COLLECTION</div>
            <h2>Featured Products</h2>
            <p>{filteredProducts.length} products available</p>
          </div>

          <select
            className="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="featured">Sort: Featured</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        <div className="productGrid">
          {filteredProducts.map((product) => (
            <article
              className="productCard"
              key={product.id}
              onClick={() => setSelectedProduct(product)}
            >
              <div className="productImage">
                <span className="tag">{product.tag}</span>

                <button
                  className={`like ${
                    liked.includes(product.id) ? "active" : ""
                  }`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleLike(product.id);
                  }}
                  aria-label="Wishlist"
                >
                  {liked.includes(product.id) ? "♥" : "♡"}
                </button>

                <img
                  className="productPhoto"
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                />
              </div>

              <div className="productInfo">
                <div className="productCategory">{product.category}</div>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="rating">★ {product.rating}</div>
                {(() => {
                  const stockState = getStockState(product);
                  return <span className={`stockBadge ${stockState.tone}`}>● {stockState.label}</span>;
                })()}

                <div className="priceRow">
                  <span className="price">
                    ₹{getSalePrice(product).toLocaleString("en-IN")}
                  </span>
                  <span className="oldPrice">
                    ₹{(getSalePrice(product) < product.price ? product.price : product.oldPrice).toLocaleString("en-IN")}
                  </span>
                  {flashSaleActive && flashSaleProductIds.has(product.id) && (
                    <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 900, color: "#ffb36b" }}>-{getFlashSalePercent(product)}%</span>
                  )}
                </div>

                <button
                  className="addButton"
                  disabled={getStockState(product).disabled}
                  onClick={(event) => {
                    event.stopPropagation();
                    addToCart(product.id);
                  }}
                >
                  {getStockState(product).disabled ? "Out of Stock" : "Add to Cart +"}
                </button>
              </div>
            </article>
          ))}
        </div>

        {recommendedProducts.length > 0 && (
          <div style={{ marginTop: 34, padding: 22, borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(135deg, rgba(255,255,255,0.045), rgba(110,168,255,0.035))" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
              <div>
                <div className="sectionLabel">SMART FOR YOU</div>
                <h3 style={{ margin: "4px 0 5px", fontSize: 24 }}>Recommended for you</h3>
                <p style={{ margin: 0, color: "#8e96aa", fontSize: 13 }}>Based on what you've viewed and the categories you like.</p>
              </div>
              <span style={{ fontSize: 11, color: "#7d89a4", border: "1px solid rgba(255,255,255,0.08)", padding: "7px 10px", borderRadius: 999 }}>Personalized locally</span>
            </div>
            <div className="smartRecommendationGrid" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14 }}>
              {recommendedProducts.map((product) => (
                <button key={product.id} type="button" onClick={() => setSelectedProduct(product)} style={{ textAlign: "left", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(7,9,18,0.72)", color: "#fff", borderRadius: 18, padding: 10, overflow: "hidden" }}>
                  <img src={product.image} alt={product.name} loading="lazy" style={{ width: "100%", aspectRatio: "1 / 0.82", objectFit: "cover", borderRadius: 13, display: "block" }} />
                  <span style={{ display: "block", color: "#7f8aa2", fontSize: 10, marginTop: 10, textTransform: "uppercase", letterSpacing: 1 }}>{product.category}</span>
                  <strong style={{ display: "block", marginTop: 5, fontSize: 13, lineHeight: 1.35 }}>{product.name}</strong>
                  <span style={{ display: "block", marginTop: 7, fontWeight: 900 }}>₹{getSalePrice(product).toLocaleString("en-IN")}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="empty">
            <div style={{ fontSize: 45 }}>🔎</div>
            <h3>No products found</h3>
            <p>Try another product name or category.</p>
          </div>
        )}
      </section>

      <section className="container benefits" id="deals">
        <div className="benefit">
          <span>🚚</span>
          <h3>Fast Delivery</h3>
          <p>Quick and reliable delivery on thousands of products.</p>
        </div>
        <div className="benefit">
          <span>🛡️</span>
          <h3>Secure Shopping</h3>
          <p>Your shopping experience is designed with safety in mind.</p>
        </div>
        <div className="benefit">
          <span>↩️</span>
          <h3>Simple Returns</h3>
          <p>Easy 7-day return experience on eligible products.</p>
        </div>
        <div className="benefit">
          <span>💬</span>
          <h3>Friendly Support</h3>
          <p>Get help whenever you need it from our support team.</p>
        </div>
      </section>

      <section className="container newsletter" id="about">
        <div className="sectionLabel">VELO COMMUNITY</div>
        <h2>Get the good stuff first.</h2>
        <p>
          New drops, useful products and exclusive offers — straight to your
          inbox.
        </p>

        <div className="newsletterForm">
          <input
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            placeholder="Enter your email address"
            type="email"
          />
          <button onClick={handleNewsletter}>Subscribe</button>
        </div>
      </section>

      <footer className="container">
        <div>© 2026 VELO. Made for modern living.</div>
        <div>Privacy • Terms • Support</div>
      </footer>

      {showAuth && (
        <div
          className="authOverlay"
          onClick={() => {
            if (!passwordRecovery) setShowAuth(false);
          }}
        >
          <div className="authModal" onClick={(e) => e.stopPropagation()}>
            <div className="authVisual">
              <div className="authBrand">
                VELO<span>.</span>
              </div>

              <div>
                <div className="eyebrow">MEMBER EXPERIENCE</div>
                <h2>
                  Shop smarter.
                  <br />
                  Live better.
                </h2>
                <p>
                  Save your wishlist, manage your profile and get a faster
                  checkout experience with your VELO account.
                </p>
              </div>

              <div className="authTrust">
                <span>🔒 Secure UI</span>
                <span>⚡ Fast checkout</span>
                <span>❤️ Wishlist</span>
              </div>
            </div>

            <div className="authFormSide">
              <button
                className="close authClose"
                onClick={() => {
                  if (passwordRecovery) return;
                  setShowAuth(false);
                }}
                aria-label="Close authentication"
              >
                ×
              </button>

              <div className="authForm">
                <div className="eyebrow">
                  {authMode === "login"
                    ? "SECURE SIGN IN"
                    : authMode === "signup"
                    ? "SECURE SIGN UP"
                    : "ACCOUNT RECOVERY"}
                </div>

                <h2>
                  {authMode === "login"
                    ? "Sign in to VELO"
                    : authMode === "signup"
                    ? "Create your account"
                    : passwordRecovery
                    ? "Set a new password"
                    : "Reset your password"}
                </h2>

                <p className="authSubtitle">
                  {authMode === "login"
                    ? "Your password is verified by Supabase Auth. We never store your password in this app."
                    : authMode === "signup"
                    ? "Use a strong password and verify your email to protect your account."
                    : passwordRecovery
                    ? "Choose a new strong password for your VELO account."
                    : "Enter your email and we will send a secure password-reset link."}
                </p>

                {authMode === "signup" && (
                  <div className="authField">
                    <label>Full Name</label>
                    <input
                      className="authInput"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                      maxLength={80}
                    />
                  </div>
                )}

                <div className="authField">
                  <label>Email Address</label>
                  <input
                    className="authInput"
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete={
                      authMode === "login" ? "email" : "username"
                    }
                    maxLength={254}
                    disabled={passwordRecovery}
                  />
                </div>

                {authMode !== "reset" || passwordRecovery ? (
                  <>
                    <div className="authField">
                      <label>
                        {passwordRecovery ? "New Password" : "Password"}
                      </label>

                      <div className="authInputWrap">
                        <input
                          className="authInput"
                          type={showPassword ? "text" : "password"}
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder={
                            passwordRecovery
                              ? "Create a new password"
                              : "Enter password"
                          }
                          autoComplete={
                            authMode === "login"
                              ? "current-password"
                              : "new-password"
                          }
                          maxLength={128}
                        />

                        <button
                          className="passwordToggle"
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    {(authMode === "signup" || passwordRecovery) && (
                      <>
                        <div className="passwordMeter">
                          <div className="passwordMeterTrack">
                            <div
                              className="passwordMeterFill"
                              style={{
                                width: `${
                                  (Object.values(passwordChecks).filter(Boolean)
                                    .length /
                                    5) *
                                  100
                                }%`,
                              }}
                            />
                          </div>

                          <span>
                            {strongPassword
                              ? "Strong password"
                              : "Password strength: build it stronger"}
                          </span>
                        </div>

                        <div className="passwordRules">
                          <span
                            className={passwordChecks.length ? "ok" : ""}
                          >
                            12+ characters
                          </span>
                          <span
                            className={passwordChecks.upper ? "ok" : ""}
                          >
                            Uppercase
                          </span>
                          <span
                            className={passwordChecks.lower ? "ok" : ""}
                          >
                            Lowercase
                          </span>
                          <span
                            className={passwordChecks.number ? "ok" : ""}
                          >
                            Number
                          </span>
                          <span
                            className={passwordChecks.special ? "ok" : ""}
                          >
                            Symbol
                          </span>
                        </div>
                      </>
                    )}

                    {passwordRecovery && (
                      <div className="authField">
                        <label>Confirm New Password</label>
                        <input
                          className="authInput"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) =>
                            setConfirmPassword(e.target.value)
                          }
                          placeholder="Repeat new password"
                          autoComplete="new-password"
                          maxLength={128}
                        />
                      </div>
                    )}
                  </>
                ) : null}

                {authMode === "login" && (
                  <div className="authOptions">
                    <span className="securityHint">
                      Email verification + Auth rate limiting
                    </span>

                    <button
                      type="button"
                      className="forgotButton"
                      onClick={() => {
                        setAuthMode("reset");
                        setPasswordRecovery(false);
                        setAuthPassword("");
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  className="authSubmit"
                  onClick={handleAuth}
                  disabled={authLoading || authCooldown > 0}
                >
                  {authLoading
                    ? "Securing..."
                    : authCooldown > 0
                    ? `Try again in ${authCooldown}s`
                    : authMode === "login"
                    ? "Sign In →"
                    : authMode === "signup"
                    ? "Create Account →"
                    : passwordRecovery
                    ? "Update Password →"
                    : "Send Reset Link →"}
                </button>

                <div className="authSwitch">
                  {authMode === "login" ? (
                    <>
                      New to VELO?{" "}
                      <button
                        onClick={() => {
                          setAuthMode("signup");
                          setPasswordRecovery(false);
                          setAuthPassword("");
                        }}
                      >
                        Create account
                      </button>
                    </>
                  ) : authMode === "signup" ? (
                    <>
                      Already have an account?{" "}
                      <button
                        onClick={() => {
                          setAuthMode("login");
                          setPasswordRecovery(false);
                          setAuthPassword("");
                        }}
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      Remember your password?{" "}
                      <button
                        onClick={() => {
                          setAuthMode("login");
                          setPasswordRecovery(false);
                          setAuthPassword("");
                        }}
                      >
                        Back to sign in
                      </button>
                    </>
                  )}
                </div>

                <div className="securityPanel">
                  <strong>Security by design</strong>
                  <span>✓ Passwords are verified by Supabase Auth</span>
                  <span>✓ Email confirmation protects new accounts</span>
                  <span>✓ Auth rate limits help reduce brute-force attempts</span>
                  <span>✓ Reset links are token based</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div
          className="profileOverlay"
          onClick={() => setShowProfile(false)}
        >
          <div className="profileModal" onClick={(e) => e.stopPropagation()}>
            <div className="profileHead">
              <div>
                <div className="eyebrow">ACCOUNT CENTER</div>
                <h2>Your Profile</h2>
                <p>Manage your VELO account information.</p>
              </div>

              <button
                className="close"
                onClick={() => setShowProfile(false)}
                aria-label="Close profile"
              >
                ×
              </button>
            </div>

            {profileLoading ? (
              <div className="empty">
                <div style={{ fontSize: 32 }}>⏳</div>
                <h3>Loading profile...</h3>
              </div>
            ) : (
              <>
                <div className="profileAvatar">
                  {profileAvatar ? (
                    <img src={profileAvatar} alt="Profile avatar" />
                  ) : (
                    (profileName || authEmail || "V")
                      .trim()
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

                <div className="profileFields">
                  <div className="field">
                    <label>Full Name</label>
                    <input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your full name"
                      maxLength={80}
                    />
                  </div>

                  <div className="field">
                    <label>Phone Number</label>
                    <input
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      inputMode="tel"
                      maxLength={16}
                    />
                  </div>

                  <div className="field">
                    <label>Avatar URL <span style={{color:"#6f788a"}}>(optional)</span></label>
                    <input
                      value={profileAvatar}
                      onChange={(e) => setProfileAvatar(e.target.value)}
                      placeholder="https://..."
                      maxLength={500}
                    />
                  </div>
                </div>

                <div className="profileMeta">
                  <strong style={{ color: "#dfe4ef" }}>Signed-in email:</strong>{" "}
                  {authEmail || "Verified account"}
                  <br />
                  <span style={{ display: "inline-block", marginTop: 5 }}>
                    Your profile is protected by Supabase Row Level Security.
                  </span>
                </div>

                {isAdmin && (
                  <button
                    className="adminLaunchButton"
                    onClick={openAdminDashboard}
                  >
                    ◈ Open Admin Dashboard
                  </button>
                )}

                <div className="profileActions">
                  <button
                    className="ordersButton"
                    onClick={() => { setShowProfile(false); setShowWishlist(true); }}
                  >
                    ♥ Wishlist {liked.length > 0 ? `(${liked.length})` : ""}
                  </button>

                  <button
                    className="ordersButton"
                    onClick={openOrders}
                  >
                    📦 My Orders
                  </button>

                  <button
                    className="logoutButton"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>

                  <button
                    className="saveProfileButton"
                    onClick={saveProfile}
                    disabled={profileSaving}
                  >
                    {profileSaving ? "Saving..." : "Save Profile ✓"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showAdmin && (
        <div className="adminOverlay" onClick={() => setShowAdmin(false)}>
          <div className="adminShell" onClick={(e) => e.stopPropagation()}>
            <div className="adminTop">
              <div>
                <div className="eyebrow">VELO CONTROL CENTER</div>
                <h2>Admin Dashboard</h2>
                <p>Real-time order operations, revenue and customer overview.</p>
              </div>
              <button className="adminClose" onClick={() => setShowAdmin(false)}>×</button>
            </div>

            <div className="adminNav">
              <button className={adminSection === "overview" ? "adminNavButton active" : "adminNavButton"} onClick={() => setAdminSection("overview")}>Overview</button>
              <button className={adminSection === "reports" ? "adminNavButton active" : "adminNavButton"} onClick={() => setAdminSection("reports")}>Reports</button>
              <button className={adminSection === "loyalty" ? "adminNavButton active" : "adminNavButton"} onClick={() => setAdminSection("loyalty")}>Loyalty <span>★</span></button>
              <button className={adminSection === "customers" ? "adminNavButton active" : "adminNavButton"} onClick={() => setAdminSection("customers")}>Customers <span>{adminCustomerCount}</span></button>
              <button className={adminSection === "products" ? "adminNavButton active" : "adminNavButton"} onClick={() => setAdminSection("products")}>Products</button>
              <button className={adminSection === "inventory" ? "adminNavButton active" : "adminNavButton"} onClick={() => setAdminSection("inventory")}>Inventory <span>{products.filter((p) => Number(p.stock ?? 0) <= 5).length}</span></button>
              <button className={adminSection === "reviews" ? "adminNavButton active" : "adminNavButton"} onClick={() => setAdminSection("reviews")}>Reviews <span>{adminReviews.length}</span></button>
              <button className={adminSection === "questions" ? "adminNavButton active" : "adminNavButton"} onClick={() => setAdminSection("questions")}>Q&A <span>{adminQuestions.length}</span></button>
              <button className={adminSection === "coupons" ? "adminNavButton active" : "adminNavButton"} onClick={() => setAdminSection("coupons")}>Coupons <span>{coupons.length}</span></button>
            </div>

            {adminLoading ? (
              <div className="adminEmpty">
                <div style={{fontSize:34}}>◈</div>
                <h3>Loading secure admin data...</h3>
                <p>Verifying admin access and fetching live Supabase data.</p>
              </div>
            ) : (
              <div className="adminBody">
                {adminSection === "overview" ? (
                  <>
                <div className="adminAnalyticsControls">
                  <div>
                    <span className="adminControlEyebrow">ANALYTICS RANGE</span>
                    <strong>{adminAnalyticsRange === "today" ? "Today" : adminAnalyticsRange === "7" ? "Last 7 Days" : adminAnalyticsRange === "30" ? "Last 30 Days" : "All Time"}</strong>
                  </div>
                  <div className="adminRangeButtons">
                    {([['today','Today'],['7','7 Days'],['30','30 Days'],['all','All Time']] as const).map(([value,label]) => (
                      <button key={value} className={adminAnalyticsRange === value ? "active" : ""} onClick={() => setAdminAnalyticsRange(value)}>{label}</button>
                    ))}
                    <button className="adminExportButton" onClick={exportAdminAnalytics}>↓ Export CSV</button>
                  </div>
                </div>

                <div className="adminStats">
                  <div className="adminStat"><span>Revenue</span><strong>₹{adminStats.revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong><small>Selected period</small></div>
                  <div className="adminStat"><span>Orders</span><strong>{adminStats.rangeOrders.length}</strong><small>Orders in period</small></div>
                  <div className="adminStat"><span>Average Order</span><strong>₹{adminStats.average.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong><small>Revenue ÷ orders</small></div>
                  <div className="adminStat"><span>Delivered</span><strong>{adminStats.delivered}/{adminStats.rangeOrders.length}</strong><small>{adminStats.pending} processing · {adminStats.shipped} shipping</small></div>
                </div>

                <div className="adminAnalytics">
                  <div className="adminAnalyticsCard">
                    <div className="adminAnalyticsHead"><h3>Revenue Pulse</h3><span>7-day trend</span></div>
                    <div className="adminMiniRevenue">
                      <div className="adminMiniMetric"><span>7-day revenue</span><strong>₹{adminStats.revenue7.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong></div>
                      <div className="adminMiniMetric"><span>30-day revenue</span><strong>₹{adminStats.revenue30.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong></div>
                    </div>
                    <div className="adminBars">
                      {adminStats.recentDays.map((day) => (
                        <div className="adminBarItem" key={day.label}>
                          <span className="adminBarValue">{day.revenue ? `₹${Math.round(day.revenue).toLocaleString("en-IN")}` : "—"}</span>
                          <div className="adminBarTrack"><div className="adminBarFill" style={{ height: `${Math.max(4, (day.revenue / adminStats.maxDayRevenue) * 100)}%` }} /></div>
                          <span className="adminBarLabel">{day.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="adminAnalyticsCard">
                    <div className="adminAnalyticsHead"><h3>Order Pipeline</h3><span>Live status mix</span></div>
                    <div className="adminStatusList">
                      {adminStats.statusCounts.map((item) => (
                        <div className="adminStatusRow" key={item.key}>
                          <span>{item.label}</span>
                          <div className="adminStatusTrack"><div className="adminStatusFill" style={{ width: `${adminStats.rangeOrders.length ? (item.count / adminStats.rangeOrders.length) * 100 : 0}%` }} /></div>
                          <strong>{item.count}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="adminInsightGrid">
                  <div className="adminTopProducts">
                    <div className="adminAnalyticsHead"><h3>Top Products</h3><span>By units sold</span></div>
                    {adminStats.topProducts.length ? adminStats.topProducts.map((product) => (
                      <div className="adminProductRow" key={product.name}>
                        <div className="adminProductName">{product.name}</div>
                        <div className="adminProductTrack"><div className="adminProductFill" style={{ width: `${(product.quantity / adminStats.maxProductQty) * 100}%` }} /></div>
                        <div className="adminProductQty">{product.quantity} units</div>
                      </div>
                    )) : <div className="adminEmpty" style={{padding: "20px 0"}}>No product sales yet.</div>}
                  </div>

                  <div className="adminAnalyticsCard">
                    <div className="adminAnalyticsHead"><h3>Payment Mix</h3><span>Orders</span></div>
                    <div className="adminBreakdownList">
                      {adminStats.paymentBreakdown.length ? adminStats.paymentBreakdown.map((item) => (
                        <div className="adminBreakdownRow" key={item.name}>
                          <span>{item.name}</span><div className="adminStatusTrack"><div className="adminStatusFill" style={{width:`${(item.count / adminStats.maxPaymentCount) * 100}%`}} /></div><strong>{item.count}</strong>
                        </div>
                      )) : <p className="adminMutedText">No payment data yet.</p>}
                    </div>
                  </div>
                </div>

                <div className="adminInsightGrid">
                  <div className="adminAnalyticsCard">
                    <div className="adminAnalyticsHead"><h3>Category Sales</h3><span>Revenue</span></div>
                    <div className="adminBreakdownList">
                      {adminStats.categorySales.length ? adminStats.categorySales.map((item) => (
                        <div className="adminCategoryRow" key={item.name}>
                          <div><strong>{item.name}</strong><span>{item.quantity} units</span></div>
                          <div className="adminCategoryTrack"><div className="adminProductFill" style={{width:`${(item.revenue / adminStats.maxCategoryRevenue) * 100}%`}} /></div>
                          <b>₹{Math.round(item.revenue).toLocaleString("en-IN")}</b>
                        </div>
                      )) : <p className="adminMutedText">No category sales yet.</p>}
                    </div>
                  </div>

                  <div className="adminAnalyticsCard">
                    <div className="adminAnalyticsHead"><h3>Customer Pulse</h3><span>Selected period</span></div>
                    <div className="adminCustomerPulse">
                      <div><span>New / one-time</span><strong>{adminStats.newCustomers}</strong></div>
                      <div><span>Returning</span><strong>{adminStats.returningCustomers}</strong></div>
                      <div><span>All customers</span><strong>{adminCustomerCount}</strong></div>
                      <div><span>Conversion signal</span><strong>{adminStats.rangeOrders.length ? `${Math.round((adminStats.delivered / adminStats.rangeOrders.length) * 100)}%` : "0%"}</strong></div>
                    </div>
                  </div>
                </div>

                <div className="adminToolbar">
                  <input className="adminSearch" value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} placeholder="Search order ID, customer, phone or city..." />
                  <select className="adminFilter" value={adminStatusFilter} onChange={(e) => setAdminStatusFilter(e.target.value)}>
                    <option value="all">All statuses</option>
                    <option value="placed">Placed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button className="adminRefresh" onClick={loadAdminOrders}>↻ Refresh</button>
                </div>

                <div className="adminTableWrap">
                  <table className="adminTable">
                    <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th><th></th></tr></thead>
                    <tbody>
                      {adminFilteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td><span className="adminOrderId">VLO-{order.id.slice(0,8).toUpperCase()}</span></td>
                          <td><div className="adminCustomer"><strong>{order.full_name}</strong><span>{order.phone} · {order.city}</span></div></td>
                          <td>{formatOrderDate(order.created_at)}</td>
                          <td><span className="adminStatus">{getOrderStatusLabel(order.status)}</span></td>
                          <td><strong>₹{Number(order.total).toLocaleString("en-IN")}</strong></td>
                          <td><button className="adminViewButton" onClick={() => setSelectedOrder(order)}>View</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {adminFilteredOrders.length === 0 && <div className="adminEmpty"><h3>No matching orders</h3><p>Try another search or status filter.</p></div>}
                </div>

                {selectedOrder && (
                  <div className="adminDetail">
                    <div className="adminDetailHead">
                      <div>
                        <span className="eyebrow">ORDER DETAILS</span>
                        <h3>VLO-{selectedOrder.id.slice(0,8).toUpperCase()}</h3>
                        <p>Placed on {formatOrderDate(selectedOrder.created_at)}</p>
                      </div>
                      <div className="adminDetailHeadActions">
                        <select className="adminStatusSelect" value={selectedOrder.status} disabled={adminUpdating} onChange={(e) => updateAdminOrderStatus(selectedOrder.id, e.target.value)}>
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="adminDetailClose" onClick={() => setSelectedOrder(null)} aria-label="Close order details">×</button>
                      </div>
                    </div>

                    {selectedOrder.status === "cancelled" ? (
                      <div className="adminCancelled">✕ This order has been cancelled. No further fulfilment action is required.</div>
                    ) : (
                      <div className="adminTimeline">
                        {trackingSteps.map((step, index) => {
                          const currentIndex = getTrackingIndex(selectedOrder.status);
                          const active = index <= currentIndex;
                          const current = index === currentIndex;
                          return (
                            <div key={step.key} className={`adminTimelineStep ${active ? "active" : ""} ${current ? "current" : ""}`}>
                              <div className="adminTimelineDot">{active ? "✓" : index + 1}</div>
                              <span>{step.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="adminDetailGrid">
                      <div className="adminDetailCard">
                        <h4>Customer & Delivery</h4>
                        <div className="adminInfoRow"><div className="adminInfoIcon">◉</div><div className="adminInfoText"><span>Customer</span><strong>{selectedOrder.full_name}</strong></div></div>
                        <div className="adminInfoRow"><div className="adminInfoIcon">☎</div><div className="adminInfoText"><span>Phone</span><strong>{selectedOrder.phone}</strong></div></div>
                        <div className="adminInfoRow"><div className="adminInfoIcon">⌂</div><div className="adminInfoText"><span>Delivery address</span><strong>{selectedOrder.address}, {selectedOrder.city} — {selectedOrder.pin_code}</strong></div></div>
                        <div className="adminInfoRow"><div className="adminInfoIcon">₹</div><div className="adminInfoText"><span>Payment</span><strong>{selectedOrder.payment_method}</strong><span className="adminPaymentChip">{selectedOrder.payment_method}</span></div></div>
                      </div>

                      <div className="adminDetailCard">
                        <h4>Ordered Items ({selectedOrder.order_items?.length || 0})</h4>
                        {selectedOrder.order_items?.map((item) => (
                          <div className="adminItem" key={item.id}>
                            <img src={item.product_image || ""} alt="" />
                            <div><strong>{item.product_name}</strong><span>Qty {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}</span></div>
                            <b>₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}</b>
                          </div>
                        ))}
                        <div className="adminMoney">
                          <div className="adminMoneyRow"><span>Subtotal</span><strong>₹{Number(selectedOrder.subtotal).toLocaleString("en-IN")}</strong></div>
                          <div className="adminMoneyRow"><span>Delivery</span><strong>{Number(selectedOrder.delivery_fee) === 0 ? "FREE" : `₹${Number(selectedOrder.delivery_fee).toLocaleString("en-IN")}`}</strong></div>
                          <div className="adminMoneyRow"><span>Discount</span><strong>-₹{Number(selectedOrder.discount).toLocaleString("en-IN")}</strong></div>
                          <div className="adminMoneyTotal"><span>Total</span><strong>₹{Number(selectedOrder.total).toLocaleString("en-IN")}</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                  </>
                ) : adminSection === "reports" ? (
                  <div style={{display:"grid",gap:20}}>
                    <div className="customerSectionIntro">
                      <div>
                        <div className="eyebrow">REPORT CENTER</div>
                        <h3>Orders & Sales Reports</h3>
                        <p>Generate clean, downloadable reports from your live Supabase order data.</p>
                      </div>
                      <div className="customerSectionCount"><strong>{adminStats.rangeOrders.length}</strong><span>orders in period</span></div>
                    </div>

                    <div className="adminAnalyticsControls">
                      <div>
                        <span className="adminControlEyebrow">REPORT PERIOD</span>
                        <strong>{adminAnalyticsRange === "today" ? "Today" : adminAnalyticsRange === "7" ? "Last 7 Days" : adminAnalyticsRange === "30" ? "Last 30 Days" : "All Time"}</strong>
                      </div>
                      <div className="adminRangeButtons">
                        {([['today','Today'],['7','7 Days'],['30','30 Days'],['all','All Time']] as const).map(([value,label]) => (
                          <button key={value} className={adminAnalyticsRange === value ? "active" : ""} onClick={() => setAdminAnalyticsRange(value)}>{label}</button>
                        ))}
                      </div>
                    </div>

                    <div className="adminStats">
                      <div className="adminStat"><span>Revenue</span><strong>₹{adminStats.revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong><small>Selected period</small></div>
                      <div className="adminStat"><span>Orders</span><strong>{adminStats.rangeOrders.length}</strong><small>Included in report</small></div>
                      <div className="adminStat"><span>Average Order</span><strong>₹{adminStats.average.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong><small>Average basket value</small></div>
                      <div className="adminStat"><span>Delivered</span><strong>{adminStats.delivered}</strong><small>{adminStats.pending} processing · {adminStats.shipped} shipping</small></div>
                    </div>

                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
                      <button className="adminExportButton" style={{padding:"18px",borderRadius:16,fontSize:14}} onClick={exportAdminAnalytics}>↓ Export Analytics CSV</button>
                      <button className="adminExportButton" style={{padding:"18px",borderRadius:16,fontSize:14}} onClick={exportAdminOrdersReport}>↓ Export Detailed Orders CSV</button>
                      <button className="adminExportButton" style={{padding:"18px",borderRadius:16,fontSize:14}} onClick={printAdminReport}>⎙ Print / Save PDF</button>
                    </div>

                    <div className="adminAnalyticsCard">
                      <div className="adminAnalyticsHead"><h3>Report Preview</h3><span>{adminStats.rangeOrders.length} orders</span></div>
                      <div className="adminTableWrap">
                        <table className="adminTable">
                          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th>Payment</th><th>Total</th></tr></thead>
                          <tbody>
                            {adminStats.rangeOrders.slice(0, 12).map((order) => (
                              <tr key={order.id}>
                                <td><span className="adminOrderId">VLO-{order.id.slice(0,8).toUpperCase()}</span></td>
                                <td><strong>{order.full_name}</strong></td>
                                <td>{formatOrderDate(order.created_at)}</td>
                                <td><span className="adminStatus">{getOrderStatusLabel(order.status)}</span></td>
                                <td>{order.payment_method}</td>
                                <td><strong>₹{Number(order.total).toLocaleString("en-IN")}</strong></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {!adminStats.rangeOrders.length && <div className="adminEmpty"><h3>No orders in this period</h3><p>Choose another report period to see data.</p></div>}
                      </div>
                    </div>
                  </div>
                ) : adminSection === "loyalty" ? (
                  <div className="adminSection adminProductsSection">
                    <div className="adminSectionHead">
                      <div>
                        <div className="eyebrow">CUSTOMER RETENTION</div>
                        <h3>VELO Loyalty Club</h3>
                        <p>Reward customers based on verified order spend. 1 point is earned for every ₹10 spent.</p>
                      </div>
                    </div>

                    <div className="adminStats">
                      <div className="adminStat"><span>Active Members</span><strong>{adminLoyaltyCustomers.length}</strong><small>Customers with profiles</small></div>
                      <div className="adminStat"><span>Total Points</span><strong>{adminLoyaltyStats.totalPoints.toLocaleString("en-IN")}</strong><small>Calculated from orders</small></div>
                      <div className="adminStat"><span>Gold + VIP</span><strong>{adminLoyaltyStats.gold + adminLoyaltyStats.vip}</strong><small>High-value customers</small></div>
                      <div className="adminStat"><span>VIP Members</span><strong>{adminLoyaltyStats.vip}</strong><small>5,000+ points</small></div>
                    </div>

                    <div className="adminToolbar">
                      <input className="adminSearch" value={adminLoyaltySearch} onChange={(e) => setAdminLoyaltySearch(e.target.value)} placeholder="Search customer, phone, tier or points..." />
                      <button className="adminRefresh" onClick={loadAdminOrders}>↻ Refresh Loyalty</button>
                    </div>

                    <div className="adminProductGrid">
                      {adminLoyaltyCustomers.length === 0 ? (
                        <div className="adminEmpty"><div style={{fontSize:30}}>★</div><h3>No loyalty members yet</h3><p>Customers will appear here after their profiles and orders are available.</p></div>
                      ) : adminLoyaltyCustomers.map((customer) => (
                        <div className="adminProductRow" key={customer.id}>
                          <div className="adminProductInfo">
                            <strong>{customer.full_name || "VELO Customer"}</strong>
                            <span>{customer.phone || "No phone"} · {customer.orders} order{customer.orders === 1 ? "" : "s"}</span>
                            <span>₹{Math.round(customer.spent).toLocaleString("en-IN")} lifetime spend · {customer.points.toLocaleString("en-IN")} points</span>
                          </div>
                          <div className="adminProductActions" style={{alignItems:"flex-end"}}>
                            <span className="adminStatusBadge" style={{textTransform:"uppercase"}}>{customer.tier}</span>
                            <span style={{fontSize:11,color:"#7f8ba0"}}>{customer.tier === "VIP" ? "Top tier" : `${customer.pointsToNext.toLocaleString("en-IN")} pts to ${customer.nextTier}`}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : adminSection === "customers" ? (
                  <div className="adminCustomersSection">
                    <div className="customerSectionIntro">
                      <div>
                        <div className="eyebrow">CUSTOMER MANAGEMENT</div>
                        <h3>Customers</h3>
                        <p>Simple, real customer overview powered by your Supabase profiles and orders.</p>
                      </div>
                      <div className="customerSectionCount"><strong>{adminCustomerCount}</strong><span>registered customers</span></div>
                    </div>

                    <div className="customerToolbar">
                      <input className="adminSearch" value={adminCustomerSearch} onChange={(e) => setAdminCustomerSearch(e.target.value)} placeholder="Search customer name, phone or ID..." />
                      <button className="adminRefresh" onClick={loadAdminOrders}>↻ Refresh</button>
                    </div>

                    <div className="customerCards">
                      {adminFilteredCustomers.map((customer) => (
                        <button className="customerCard" key={customer.id} onClick={() => setSelectedCustomer(customer)}>
                          <div className="customerAvatar">
                            {customer.avatar_url ? <img src={customer.avatar_url} alt="" /> : <span>{(customer.full_name || "V").charAt(0).toUpperCase()}</span>}
                          </div>
                          <div className="customerMain">
                            <strong>{customer.full_name}</strong>
                            <span>{customer.phone || "Phone not added"}</span>
                            <small>Joined {formatOrderDate(customer.created_at)}</small>
                          </div>
                          <div className="customerMetric"><b>{customer.total_orders}</b><span>orders</span></div>
                          <div className="customerMetric"><b>₹{Math.round(customer.total_spent).toLocaleString("en-IN")}</b><span>spent</span></div>
                          <div className="customerArrow">›</div>
                        </button>
                      ))}
                    </div>

                    {adminFilteredCustomers.length === 0 && <div className="adminEmpty"><h3>No customers found</h3><p>Try another name, phone number or customer ID.</p></div>}

                    {selectedCustomer && (
                      <div className="customerDetail">
                        <div className="customerDetailTop">
                          <div className="customerProfileHero">
                            <div className="customerAvatar large">{selectedCustomer.avatar_url ? <img src={selectedCustomer.avatar_url} alt="" /> : <span>{(selectedCustomer.full_name || "V").charAt(0).toUpperCase()}</span>}</div>
                            <div><div className="eyebrow">CUSTOMER PROFILE</div><h3>{selectedCustomer.full_name}</h3><p>{selectedCustomer.phone || "Phone not added"}</p></div>
                          </div>
                          <button className="adminViewButton" onClick={() => setSelectedCustomer(null)}>Close</button>
                        </div>
                        <div className="customerDetailStats">
                          <div><span>Total Orders</span><strong>{selectedCustomer.total_orders}</strong></div>
                          <div><span>Total Spent</span><strong>₹{Math.round(selectedCustomer.total_spent).toLocaleString("en-IN")}</strong></div>
                          <div><span>Last Order</span><strong>{selectedCustomer.last_order_at ? formatOrderDate(selectedCustomer.last_order_at) : "No orders yet"}</strong></div>
                          <div><span>Customer Since</span><strong>{formatOrderDate(selectedCustomer.created_at)}</strong></div>
                        </div>
                        <div className="customerHistory">
                          <h4>Order History</h4>
                          {adminOrders.filter((order) => order.user_id === selectedCustomer.id).map((order) => (
                            <div className="customerHistoryRow" key={order.id}>
                              <div><strong>VLO-{order.id.slice(0,8).toUpperCase()}</strong><span>{formatOrderDate(order.created_at)} · {getOrderStatusLabel(order.status)}</span></div>
                              <b>₹{Number(order.total).toLocaleString("en-IN")}</b>
                            </div>
                          ))}
                          {!adminOrders.some((order) => order.user_id === selectedCustomer.id) && <p className="customerNoOrders">No orders placed yet.</p>}
                        </div>
                      </div>
                    )}
                  </div>
                ) : adminSection === "inventory" ? (
                  <div className="adminSection adminProductsSection">
                    <div className="adminSectionHead">
                      <div>
                        <div className="eyebrow">STOCK CONTROL</div>
                        <h3>Inventory Management</h3>
                        <p>Monitor live stock, spot low inventory and update quantities instantly.</p>
                      </div>
                      <button className="adminRefresh" onClick={refreshLiveProducts}>↻ Refresh Stock</button>
                    </div>

                    {(() => {
                      const inventoryRows = products
                        .filter((product) => {
                          const query = adminInventorySearch.trim().toLowerCase();
                          return !query || [product.name, product.category].join(" ").toLowerCase().includes(query);
                        })
                        .sort((a, b) => Number(a.stock ?? 0) - Number(b.stock ?? 0));
                      const outOfStock = products.filter((product) => Number(product.stock ?? 0) <= 0).length;
                      const lowStock = products.filter((product) => Number(product.stock ?? 0) > 0 && Number(product.stock ?? 0) <= 5).length;
                      const healthyStock = products.filter((product) => Number(product.stock ?? 0) > 5).length;
                      const totalUnits = products.reduce((sum, product) => sum + Number(product.stock ?? 0), 0);

                      return (
                        <>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12,marginBottom:16}}>
                            {[
                              ["TOTAL UNITS", totalUnits, "Across live products"],
                              ["OUT OF STOCK", outOfStock, "Needs immediate action"],
                              ["LOW STOCK", lowStock, "5 units or less"],
                              ["HEALTHY", healthyStock, "Above 5 units"],
                            ].map(([label,value,sub]) => (
                              <div key={String(label)} style={{padding:"16px 18px",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,background:"rgba(8,12,22,.62)"}}>
                                <div style={{fontSize:9,fontWeight:900,letterSpacing:1.2,color:"#778198"}}>{label}</div>
                                <strong style={{display:"block",fontSize:25,marginTop:7}}>{value}</strong>
                                <span style={{fontSize:10,color:"#8e98aa"}}>{sub}</span>
                              </div>
                            ))}
                          </div>

                          <div className="adminToolbar">
                            <input className="adminSearch" value={adminInventorySearch} onChange={(e) => setAdminInventorySearch(e.target.value)} placeholder="Search inventory by product or category..." />
                            <button className="adminSecondaryButton" onClick={() => setAdminInventorySearch("")}>Clear</button>
                          </div>

                          <div className="adminTableWrap">
                            <table className="adminTable">
                              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Quick Update</th></tr></thead>
                              <tbody>
                                {inventoryRows.map((product) => {
                                  const stock = Number(product.stock ?? 0);
                                  const status = stock <= 0 ? "OUT OF STOCK" : stock <= 5 ? "LOW STOCK" : "HEALTHY";
                                  return (
                                    <tr key={product.id}>
                                      <td><div className="adminCustomer"><strong>{product.name}</strong><span>ID #{product.id}</span></div></td>
                                      <td>{product.category}</td>
                                      <td>₹{Number(product.price).toLocaleString("en-IN")}</td>
                                      <td><span className="adminStatus">{stock} · {status}</span></td>
                                      <td>
                                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                                          <button className="adminSecondaryButton" disabled={adminInventorySavingId === product.id} onClick={() => updateAdminInventoryStock(product, Math.max(0, stock - 1))}>−</button>
                                          <strong style={{minWidth:28,textAlign:"center"}}>{stock}</strong>
                                          <button className="adminSecondaryButton" disabled={adminInventorySavingId === product.id} onClick={() => updateAdminInventoryStock(product, stock + 1)}>+</button>
                                          <button className="adminPrimaryButton" disabled={adminInventorySavingId === product.id} onClick={() => { const value = window.prompt(`Set stock for ${product.name}:`, String(stock)); if (value !== null) updateAdminInventoryStock(product, Number(value)); }}>Set</button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                            {inventoryRows.length === 0 && <div className="adminEmpty"><h3>No inventory matches</h3><p>Try a different product or category search.</p></div>}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : adminSection === "reviews" ? (
                  <div className="adminReviewsSection">
                    <div className="reviewAdminIntro">
                      <div>
                        <div className="eyebrow">CUSTOMER FEEDBACK</div>
                        <h3>Review Management</h3>
                        <p>Read customer feedback, monitor ratings and remove inappropriate reviews.</p>
                      </div>
                      <div className="reviewAdminStats">
                        <div><span>Total Reviews</span><strong>{adminReviewStats.total}</strong></div>
                        <div><span>Average Rating</span><strong>★ {adminReviewStats.average.toFixed(1)}</strong></div>
                        <div><span>5-Star Reviews</span><strong>{adminReviewStats.five}</strong></div>
                        <div><span>Needs Attention</span><strong>{adminReviewStats.low}</strong></div>
                      </div>
                    </div>

                    <div className="adminToolbar">
                      <input className="adminSearch" value={adminReviewSearch} onChange={(e) => setAdminReviewSearch(e.target.value)} placeholder="Search product, customer or review text..." />
                      <select className="adminFilter" value={adminReviewRatingFilter} onChange={(e) => setAdminReviewRatingFilter(e.target.value)}>
                        <option value="all">All ratings</option>
                        <option value="5">★★★★★ 5 stars</option>
                        <option value="4">★★★★ 4 stars</option>
                        <option value="3">★★★ 3 stars</option>
                        <option value="2">★★ 2 stars</option>
                        <option value="1">★ 1 star</option>
                      </select>
                      <button className="adminRefresh" onClick={loadAdminOrders}>↻ Refresh</button>
                    </div>

                    {adminFilteredReviews.length === 0 ? (
                      <div className="adminEmpty"><div style={{fontSize:34}}>★</div><h3>No reviews found</h3><p>Try another search or rating filter.</p></div>
                    ) : (
                      <div className="reviewAdminList">
                        {adminFilteredReviews.map((review) => (
                          <div className="reviewAdminCard" key={review.id}>
                            <div className="reviewAdminProduct">
                              {review.product_image ? <img src={review.product_image} alt="" /> : <div className="reviewAdminImageFallback">V</div>}
                              <div><strong>{review.product_name}</strong><span>Review #{review.id}</span></div>
                            </div>
                            <div className="reviewAdminContent">
                              <div className="reviewAdminTopline">
                                <span className="reviewAdminStars">{"★".repeat(Math.max(0, Math.min(5, Number(review.rating))))}{"☆".repeat(Math.max(0, 5 - Math.min(5, Number(review.rating))))}</span>
                                <b>{review.rating}/5</b>
                                <small>{formatOrderDate(review.created_at)}</small>
                              </div>
                              <p>“{review.review_text}”</p>
                              <div className="reviewAdminCustomer">
                                <span className="reviewCustomerAvatar">{(review.customer_name || "V").charAt(0).toUpperCase()}</span>
                                <span><strong>{review.customer_name}</strong>{review.customer_phone ? ` · ${review.customer_phone}` : ""}</span>
                              </div>
                            </div>
                            <button className="reviewDeleteButton" onClick={() => deleteAdminReview(review.id)} disabled={adminReviewDeleting === review.id} title="Delete review">
                              {adminReviewDeleting === review.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : adminSection === "questions" ? (
                  <div className="adminSection adminReviewsSection">
                    <div className="reviewAdminIntro">
                      <div><div className="eyebrow">CUSTOMER QUESTIONS</div><h3>Product Q&A Management</h3><p>Answer product questions officially and keep customer conversations useful.</p></div>
                      <div className="reviewAdminStats"><div><span>Total Questions</span><strong>{adminQuestions.length}</strong></div><div><span>Answered</span><strong>{adminQuestions.filter((q) => Boolean(q.answer)).length}</strong></div><div><span>Waiting</span><strong>{adminQuestions.filter((q) => !q.answer).length}</strong></div></div>
                    </div>
                    <div className="adminToolbar"><input className="adminSearch" value={adminQuestionSearch} onChange={(e) => setAdminQuestionSearch(e.target.value)} placeholder="Search product, customer or question..."/><button className="adminRefresh" onClick={loadAdminOrders}>↻ Refresh</button></div>
                    {adminFilteredQuestions.length === 0 ? <div className="adminEmpty"><div style={{fontSize:34}}>?</div><h3>No questions found</h3><p>Customer product questions will appear here.</p></div> : (
                      <div className="reviewAdminList">
                        {adminFilteredQuestions.map((question) => (
                          <div className="reviewAdminCard" key={question.id}>
                            <div className="reviewAdminProduct">{question.product_image ? <img src={question.product_image} alt=""/> : <div className="reviewAdminImageFallback">V</div>}<div><strong>{question.product_name}</strong><span>Question #{question.id}</span></div></div>
                            <div className="reviewAdminContent"><div className="reviewAdminTopline"><b>{question.answer ? "Answered" : "Needs Answer"}</b><small>{formatOrderDate(question.created_at)}</small></div><p><strong>Q:</strong> {question.question}</p>{question.answer && <p><strong>VELO:</strong> {question.answer}</p>}<div className="reviewAdminCustomer"><span className="reviewCustomerAvatar">{(question.customer_name || "V").charAt(0).toUpperCase()}</span><span><strong>{question.customer_name}</strong>{question.customer_phone ? ` · ${question.customer_phone}` : ""}</span></div></div>
                            <div className="reviewAdminActions" style={{display:"flex",gap:8,flexDirection:"column"}}><button className="adminSecondaryButton" onClick={() => saveAdminQuestionAnswer(question)} disabled={adminQuestionSaving === question.id}>{adminQuestionSaving === question.id ? "Saving..." : question.answer ? "Edit Answer" : "Answer"}</button><button className="reviewDeleteButton" onClick={() => deleteAdminQuestion(question.id)} disabled={adminQuestionDeleting === question.id}>{adminQuestionDeleting === question.id ? "Deleting..." : "Delete"}</button></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : adminSection === "coupons" ? (
                  <div className="adminSection adminProductsSection">
                    <div className="adminSectionHead">
                      <div><div className="eyebrow">PROMOTION CONTROL</div><h3>Coupon Management</h3><p>Create simple, realistic discounts for your VELO customers.</p></div>
                      <button className="adminSecondaryButton" onClick={resetCouponForm}>+ New Coupon</button>
                    </div>
                    <div className="adminProductForm" id="admin-coupon-form">
                      <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/\s/g, ""))} placeholder="Coupon code e.g. VELO10" maxLength={30} />
                      <select value={couponType} onChange={(e) => setCouponType(e.target.value as "percentage" | "flat")}><option value="percentage">Percentage (%)</option><option value="flat">Flat Amount (₹)</option></select>
                      <input value={couponValue} onChange={(e) => setCouponValue(e.target.value)} placeholder={couponType === "percentage" ? "Discount %" : "Discount ₹"} inputMode="decimal" />
                      <input value={couponMinOrder} onChange={(e) => setCouponMinOrder(e.target.value)} placeholder="Minimum order ₹" inputMode="decimal" />
                      <input value={couponMaxDiscount} onChange={(e) => setCouponMaxDiscount(e.target.value)} placeholder="Max discount ₹ (optional)" inputMode="decimal" />
                      <input type="datetime-local" value={couponExpiry} onChange={(e) => setCouponExpiry(e.target.value)} />
                      <input value={couponUsageLimit} onChange={(e) => setCouponUsageLimit(e.target.value)} placeholder="Usage limit (optional)" inputMode="numeric" />
                      <label style={{display:"flex",alignItems:"center",gap:8,fontWeight:800,fontSize:13}}><input type="checkbox" checked={couponActive} onChange={(e) => setCouponActive(e.target.checked)} /> Active</label>
                      <div className="adminProductActions">
                        {couponEditingId !== null && <button className="adminSecondaryButton" onClick={resetCouponForm}>Cancel Edit</button>}
                        <button className="adminPrimaryButton" onClick={saveAdminCoupon} disabled={couponSaving}>{couponSaving ? "Saving..." : couponEditingId !== null ? "Save Changes ✓" : "Create Coupon ✓"}</button>
                      </div>
                    </div>
                    <div className="adminToolbar"><input className="adminSearch" value={couponSearch} onChange={(e) => setCouponSearch(e.target.value)} placeholder="Search coupons..." /><button className="adminRefresh" onClick={loadAdminOrders}>↻ Refresh</button></div>
                    <div className="adminProductGrid">
                      {coupons.filter((c) => c.code.toLowerCase().includes(couponSearch.trim().toLowerCase())).map((coupon) => (
                        <div className="adminProductRow" key={coupon.id}>
                          <div className="adminProductInfo"><strong>{coupon.code}</strong><span>{coupon.discount_type === "percentage" ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`} · Min ₹{Number(coupon.min_order_amount).toLocaleString("en-IN")}</span><span>{coupon.is_active ? "🟢 Active" : "⚪ Inactive"} · Used {coupon.used_count}{coupon.usage_limit !== null ? `/${coupon.usage_limit}` : ""}</span></div>
                          <div className="adminProductActions"><button className="adminSecondaryButton" onClick={() => editAdminCoupon(coupon)}>Edit</button><button className="reviewDeleteButton" onClick={() => deleteAdminCoupon(coupon.id)}>Delete</button></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="adminSection adminProductsSection">
                    <div className="adminSectionHead">
                      <div>
                        <div className="eyebrow">CATALOG CONTROL</div>
                        <h3>Product Management</h3>
                        <p>Add, edit, update stock or remove products from the live VELO catalog.</p>
                      </div>
                      <button className="adminSecondaryButton" onClick={resetAdminProductForm}>+ New Product</button>
                    </div>

                    <div className="adminProductForm" id="admin-product-form">
                      <input value={adminProductName} onChange={(e) => setAdminProductName(e.target.value)} placeholder="Product name" maxLength={120} />
                      <select value={adminProductCategory} onChange={(e) => setAdminProductCategory(e.target.value)}>
                        {categories.filter((category) => category !== "All").map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <input value={adminProductPrice} onChange={(e) => setAdminProductPrice(e.target.value)} placeholder="Price (₹)" inputMode="decimal" />
                      <input value={adminProductStock} onChange={(e) => setAdminProductStock(e.target.value)} placeholder="Stock" inputMode="numeric" />
                      <input className="full" value={adminProductImage} onChange={(e) => setAdminProductImage(e.target.value)} placeholder="Product image URL (https://...)" maxLength={1000} />
                      <textarea className="full" value={adminProductDescription} onChange={(e) => setAdminProductDescription(e.target.value)} placeholder="Short product description" maxLength={500} />
                      <div className="adminProductActions">
                        {adminProductEditingId !== null && <button className="adminSecondaryButton" onClick={resetAdminProductForm}>Cancel Edit</button>}
                        <button className="adminPrimaryButton" onClick={saveAdminProduct} disabled={adminProductSaving}>
                          {adminProductSaving ? "Saving..." : adminProductEditingId !== null ? "Save Changes ✓" : "Add Product ✓"}
                        </button>
                      </div>
                    </div>

                    <div className="adminToolbar">
                      <input className="adminSearch" value={adminProductSearch} onChange={(e) => setAdminProductSearch(e.target.value)} placeholder="Search products by name or category..." />
                      <button className="adminRefresh" onClick={refreshLiveProducts}>↻ Refresh Products</button>
                    </div>

                    {productsLoading ? (
                      <div className="adminEmpty"><div style={{fontSize:30}}>◈</div><h3>Loading live products...</h3><p>Fetching the catalog from Supabase.</p></div>
                    ) : (
                      <>
                        <div className="adminProductGrid">
                          {adminFilteredProducts.map((product) => (
                            <div className="adminProductRow" key={product.id}>
                              <img src={product.image} alt={product.name} />
                              <div className="adminProductInfo">
                                <strong>{product.name}</strong>
                                <span>{product.category} · Stock {product.stock ?? 0}</span>
                              </div>
                              <div className="adminProductPrice">
                                <strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>
                                <span>ID {product.id}</span>
                              </div>
                              <div className="adminProductRowActions">
                                <button className="adminMiniButton" onClick={() => startAdminProductEdit(product)}>Edit</button>
                                <button className="adminMiniButton" onClick={() => deleteAdminProduct(product)}>Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {adminFilteredProducts.length === 0 && <div className="adminEmpty"><h3>No products found</h3><p>Add a product or change the search.</p></div>}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showOrders && (
        <div
          className="ordersOverlay"
          onClick={() => setShowOrders(false)}
        >
          <div className="ordersModal" onClick={(e) => e.stopPropagation()}>
            <div className="ordersHeader">
              <div>
                <div className="eyebrow">ORDER CENTER</div>
                <h2>My Orders</h2>
                <p>Track your VELO purchases and view complete order details.</p>
              </div>

              <button
                className="close"
                onClick={() => setShowOrders(false)}
                aria-label="Close orders"
              >
                ×
              </button>
            </div>

            {ordersLoading ? (
              <div className="ordersLoading">
                <div className="ordersSpinner" />
                <h3>Loading your orders...</h3>
                <p>Securely fetching your order history.</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="ordersEmpty">
                <div className="ordersEmptyIcon">📦</div>
                <h3>No orders yet</h3>
                <p>Your VELO purchases will appear here after you place your first order.</p>
                <button
                  className="primaryButton"
                  onClick={() => {
                    setShowOrders(false);
                    scrollToProducts();
                  }}
                >
                  Start Shopping →
                </button>
              </div>
            ) : selectedOrder ? (
              <div className="orderDetails">
                <button
                  className="backOrdersButton"
                  onClick={() => setSelectedOrder(null)}
                >
                  ← Back to My Orders
                </button>

                <div className="orderInvoiceActions">
                  <button className="backOrdersButton" onClick={() => downloadInvoice(selectedOrder)}>🧾 Download Invoice</button>
                  <button className="backOrdersButton" onClick={() => printInvoice(selectedOrder)}>🖨️ Print / Save PDF</button>
                  <button className="backOrdersButton" onClick={() => reorderCustomerOrder(selectedOrder)}>🔄 Reorder</button>
                  {['placed', 'confirmed'].includes(selectedOrder.status) && (
                    <button className="backOrdersButton" onClick={() => cancelCustomerOrder(selectedOrder)}>❌ Cancel Order</button>
                  )}
                </div>

                <div className="orderDetailsTop">
                  <div>
                    <span className="orderSmallLabel">ORDER ID</span>
                    <strong>VLO-{selectedOrder.id.slice(0, 8).toUpperCase()}</strong>
                    <span className="orderDate">{formatOrderDate(selectedOrder.created_at)}</span>
                  </div>
                  <span className={`statusBadge ${selectedOrder.status === "cancelled" ? "cancelled" : selectedOrder.status === "delivered" ? "delivered" : ""}`}>
                    {getOrderStatusLabel(selectedOrder.status)}
                  </span>
                </div>

                <div className="trackingHero">
                  <div className="trackingHeroTop">
                    <div>
                      <span className="trackingEyebrow">LIVE ORDER TRACKING</span>
                      <h3>{getOrderStatusLabel(selectedOrder.status)}</h3>
                      <p>{getTrackingMessage(selectedOrder.status)}</p>
                    </div>
                    <div className="trackingEta">
                      <span>ESTIMATED DELIVERY</span>
                      <strong>{getEstimatedDelivery(selectedOrder.created_at, selectedOrder.status)}</strong>
                    </div>
                  </div>

                  <div className="trackingProgressWrap">
                    <div className="trackingProgressRail" />
                    <div
                      className="trackingProgressFill"
                      style={{
                        width: selectedOrder.status === "cancelled"
                          ? "0%"
                          : `${(getTrackingIndex(selectedOrder.status) / (trackingSteps.length - 1)) * 100}%`,
                      }}
                    />
                    <div className="trackingSteps">
                      {trackingSteps.map((step, index) => {
                        const currentIndex = getTrackingIndex(selectedOrder.status);
                        const active = selectedOrder.status !== "cancelled" && index <= currentIndex;
                        const current = selectedOrder.status !== "cancelled" && index === currentIndex;
                        return (
                          <div className={`trackingStep ${active ? "active" : ""} ${current ? "current" : ""}`} key={step.key}>
                            <div className="trackingDot">{active ? step.icon : index + 1}</div>
                            <strong>{step.label}</strong>
                            <span>{step.note}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="trackingFooter">
                    <span>Tracking ID</span>
                    <strong>VLO-{selectedOrder.id.slice(0, 12).toUpperCase()}</strong>
                    <span className="trackingSecure">🔒 Secure tracking</span>
                  </div>
                </div>

                <div className="orderDetailGrid">
                  <div className="orderInfoCard">
                    <h3>Items</h3>
                    {selectedOrder.order_items?.map((item) => (
                      <div className="orderItemRow" key={item.id}>
                        <img src={item.product_image || ""} alt={item.product_name} />
                        <div>
                          <strong>{item.product_name}</strong>
                          <span>Qty {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}</span>
                        </div>
                        <b>₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}</b>
                      </div>
                    ))}
                  </div>

                  <div className="orderInfoCard">
                    <h3>Delivery</h3>
                    <p><strong>{selectedOrder.full_name}</strong></p>
                    <p>{selectedOrder.address}</p>
                    <p>{selectedOrder.city} — {selectedOrder.pin_code}</p>
                    <p>📞 {selectedOrder.phone}</p>
                    <div className="paymentChip">{selectedOrder.payment_method}</div>
                  </div>
                </div>

                <div className="orderTotalCard">
                  <div><span>Subtotal</span><strong>₹{Number(selectedOrder.subtotal).toLocaleString("en-IN")}</strong></div>
                  <div><span>Delivery</span><strong>{Number(selectedOrder.delivery_fee) === 0 ? "FREE" : `₹${Number(selectedOrder.delivery_fee).toLocaleString("en-IN")}`}</strong></div>
                  {Number(selectedOrder.discount) > 0 && (
                    <div className="discountRow"><span>VELO discount</span><strong>−₹{Number(selectedOrder.discount).toLocaleString("en-IN")}</strong></div>
                  )}
                  <div className="grandTotal"><span>Total Paid</span><strong>₹{Number(selectedOrder.total).toLocaleString("en-IN")}</strong></div>
                </div>
              </div>
            ) : (
              <div className="ordersList">
                {orders.map((order) => (
                  <button
                    className="orderCard"
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="orderCardIcon">📦</div>
                    <div className="orderCardMain">
                      <div className="orderCardTitle">
                        <strong>VLO-{order.id.slice(0, 8).toUpperCase()}</strong>
                        <span className="statusBadge">{getOrderStatusLabel(order.status)}</span>
                      </div>
                      <p>{formatOrderDate(order.created_at)} • {order.order_items?.length || 0} product{(order.order_items?.length || 0) === 1 ? "" : "s"}</p>
                      <span>{order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} item(s) • {order.payment_method}</span>
                    </div>
                    <div className="orderCardPrice">
                      <strong>₹{Number(order.total).toLocaleString("en-IN")}</strong>
                      <span>View details →</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedProduct && (
        <div
          className="modalOverlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div className="productModal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modalClose"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close product"
            >
              ×
            </button>

            <div className="modalImage">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
              />
            </div>

            <div className="modalInfo">
              <div className="productCategory">
                {selectedProduct.category}
              </div>
              <h2>{selectedProduct.name}</h2>
              <div className="modalRating">
                ★ {selectedProduct.rating} / 5
              </div>
              {(() => {
                const stockState = getStockState(selectedProduct);
                return <span className={`stockBadge ${stockState.tone}`}>● {stockState.label}</span>;
              })()}
              <p>{selectedProduct.description}</p>
              <div className="modalPrice">
                ₹{selectedProduct.price.toLocaleString("en-IN")}
              </div>

              <button
                className="addButton"
                disabled={getStockState(selectedProduct).disabled}
                onClick={() => {
                  addToCart(selectedProduct.id);
                  if (!getStockState(selectedProduct).disabled) setSelectedProduct(null);
                }}
              >
                {getStockState(selectedProduct).disabled ? "Out of Stock" : "Add to Cart →"}
              </button>

              <div style={{marginTop:24,paddingTop:24,borderTop:"1px solid rgba(17,24,39,.08)"}}>
                <div className="reviewsHeader">
                  <div>
                    <div className="reviewsLabel">PRODUCT Q&A</div>
                    <h3>Questions & Answers</h3>
                  </div>
                  <div className="reviewAverage"><strong>{productQuestions.length}</strong><small> question{productQuestions.length === 1 ? "" : "s"}</small></div>
                </div>
                <div className="reviewComposer">
                  <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder={loggedIn ? "Ask something about this product..." : "Sign in to ask a question..."} maxLength={300} disabled={!loggedIn || questionSaving}/>
                  <div className="reviewComposerBottom"><span>{questionText.length}/300</span><button type="button" className="reviewSubmit" onClick={submitProductQuestion} disabled={questionSaving}>{questionSaving ? "Posting…" : loggedIn ? "Ask Question" : "Sign in to Ask"}</button></div>
                </div>
                <div className="reviewList">
                  {questionsLoading ? <div className="reviewEmpty">Loading questions…</div> : productQuestions.length === 0 ? (
                    <div className="reviewEmpty"><span>?</span><strong>No questions yet</strong><p>Be the first to ask about this product.</p></div>
                  ) : productQuestions.map((question) => (
                    <article className="reviewItem" key={question.id}>
                      <div className="reviewAvatar">?</div>
                      <div className="reviewBody">
                        <div className="reviewTop"><div><strong>VELO Customer</strong><span>{new Intl.DateTimeFormat("en-IN", {day:"2-digit", month:"short", year:"numeric"}).format(new Date(question.created_at))}</span></div></div>
                        <p><strong>Q:</strong> {question.question}</p>
                        {question.answer ? <div style={{marginTop:8,padding:"10px 12px",borderRadius:12,background:"rgba(17,24,39,.04)"}}><strong>VELO:</strong> {question.answer}</div> : <span style={{fontSize:12,opacity:.6}}>Awaiting an official VELO answer.</span>}
                        {loggedIn && <button type="button" className="reviewDelete" onClick={() => deleteProductQuestion(question)}>Delete</button>}
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="reviewsPanel">
                <div className="reviewsHeader">
                  <div>
                    <div className="reviewsLabel">CUSTOMER REVIEWS</div>
                    <h3>What shoppers say</h3>
                  </div>
                  <div className="reviewAverage">
                    <strong>{reviewAverage.toFixed(1)}</strong>
                    <span>★</span>
                    <small>{productReviews.length} review{productReviews.length === 1 ? "" : "s"}</small>
                  </div>
                </div>

                <div className="reviewComposer">
                  <div className="reviewStars" aria-label="Choose rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={star <= reviewRating ? "selected" : ""}
                        onClick={() => setReviewRating(star)}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={loggedIn ? "Share your experience with this product..." : "Sign in to write a review..."}
                    maxLength={500}
                    disabled={!loggedIn || reviewSaving}
                  />
                  <div className="reviewComposerBottom">
                    <span>{reviewText.length}/500</span>
                    <button
                      type="button"
                      className="reviewSubmit"
                      onClick={submitProductReview}
                      disabled={reviewSaving}
                    >
                      {reviewSaving ? "Saving…" : loggedIn ? "Submit Review" : "Sign in to Review"}
                    </button>
                  </div>
                </div>

                <div className="reviewList">
                  {reviewsLoading ? (
                    <div className="reviewEmpty">Loading reviews…</div>
                  ) : productReviews.length === 0 ? (
                    <div className="reviewEmpty">
                      <span>★</span>
                      <strong>No reviews yet</strong>
                      <p>Be the first VELO customer to review this product.</p>
                    </div>
                  ) : (
                    productReviews.map((review) => (
                      <article className="reviewItem" key={review.id}>
                        <div className="reviewAvatar">
                          {(review.user_id || "V").slice(0, 1).toUpperCase()}
                        </div>
                        <div className="reviewBody">
                          <div className="reviewTop">
                            <div>
                              <strong>VELO Customer</strong>
                              <span>{new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(review.created_at))}</span>
                            </div>
                            <div className="reviewStars compact">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={star <= Number(review.rating) ? "selected" : ""}>★</span>
                              ))}
                            </div>
                          </div>
                          <p>{review.review_text}</p>
                          {loggedIn && (
                            <button
                              type="button"
                              className="reviewDelete"
                              onClick={() => deleteProductReview(review)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNotifications && (
        <div className="notificationOverlay" onClick={() => setShowNotifications(false)}>
          <aside className="notificationDrawer" onClick={(e) => e.stopPropagation()}>
            <div className="notificationHead">
              <div>
                <div className="eyebrow">VELO UPDATES</div>
                <h2>Notifications</h2>
                <p>{unreadNotificationCount} unread notification{unreadNotificationCount === 1 ? "" : "s"}</p>
              </div>
              <button className="close" onClick={() => setShowNotifications(false)} aria-label="Close notifications">×</button>
            </div>

            {notifications.length > 0 && (
              <div className="notificationActions">
                <button onClick={markAllNotificationsRead}>✓ Mark all read</button>
                <button onClick={clearNotifications}>Clear all</button>
              </div>
            )}

            {notificationsLoading ? (
              <div className="notificationEmpty"><div className="notificationEmptyIcon">🔔</div><h3>Loading updates...</h3><p>Your latest VELO activity is being synced.</p></div>
            ) : notifications.length === 0 ? (
              <div className="notificationEmpty"><div className="notificationEmptyIcon">✓</div><h3>You're all caught up</h3><p>Order updates and important VELO activity will appear here.</p></div>
            ) : (
              <div className="notificationList">
                {notifications.map((item) => (
                  <button key={item.id} className={`notificationItem ${item.is_read ? "" : "unread"}`} onClick={() => markNotificationRead(item.id)}>
                    <div className="notificationItemTop">
                      <span className="notificationIcon">{item.type === "order_status" ? "📦" : "✨"}</span>
                      <strong>{item.title}</strong>
                      <small>{new Date(item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</small>
                    </div>
                    <p>{item.message}</p>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}

      {showWishlist && (
        <div
          className="wishlistOverlay"
          onClick={() => setShowWishlist(false)}
        >
          <aside
            className="wishlistDrawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wishlistHead">
              <div>
                <div className="eyebrow">SAVED FOR LATER</div>
                <h2>Your Wishlist</h2>
                <p>{liked.length} saved item{liked.length === 1 ? "" : "s"}</p>
              </div>
              <button className="close" onClick={() => setShowWishlist(false)} aria-label="Close wishlist">×</button>
            </div>

            {wishlistLoading ? (
              <div className="wishlistEmpty"><div className="wishlistEmptyIcon">♥</div><h3>Syncing your wishlist...</h3><p>Loading your saved products securely.</p></div>
            ) : liked.length === 0 ? (
              <div className="wishlistEmpty">
                <div className="wishlistEmptyIcon">♡</div>
                <h3>Your wishlist is empty</h3>
                <p>Tap the heart on any product to save it here.</p>
                <button className="wishlistShopButton" onClick={() => { setShowWishlist(false); scrollToProducts(); }}>Explore Products →</button>
              </div>
            ) : (
              <>
                <div className="wishlistToolbar">
                  <span>♥ {liked.length} saved</span>
                  <button onClick={addAllWishlistToCart}>Add All to Cart</button>
                </div>

                <div className="wishlistList">
                  {liked.map((id) => {
                    const product = products.find((item) => item.id === id);
                    if (!product) return (
                      <div className="wishlistItem" key={id}>
                        <div className="wishlistItemInfo"><strong>Unavailable product</strong><span>This saved item is no longer in the catalog.</span></div>
                        <button className="wishlistRemove" onClick={() => removeFromWishlist(id)}>Remove</button>
                      </div>
                    );

                    return (
                      <article className="wishlistItem" key={product.id}>
                        <img src={product.image} alt={product.name} />
                        <div className="wishlistItemInfo">
                          <div className="wishlistItemCategory">{product.category}</div>
                          <h3>{product.name}</h3>
                          <strong>₹{getSalePrice(product).toLocaleString("en-IN")}</strong>
                          <span>★ {product.rating} · {product.tag}</span>
                          <div className="wishlistItemActions">
                            <button className="wishlistCartButton" onClick={() => addWishlistItemToCart(product.id)}>Add to Cart</button>
                            <button className="wishlistRemove" disabled={wishlistBusyId === product.id} onClick={() => removeFromWishlist(product.id)}>
                              {wishlistBusyId === product.id ? "..." : "Remove"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <button className="wishlistCheckoutButton" onClick={() => { setShowWishlist(false); setShowCart(true); }}>View Cart →</button>
              </>
            )}
          </aside>
        </div>
      )}

      {showCart && (
        <div
          className="cartOverlay"
          onClick={() => setShowCart(false)}
        >
          <aside
            className="cartDrawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cartHead">
              <h2>Your Cart</h2>
              <button
                className="close"
                onClick={() => setShowCart(false)}
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            {cartProducts.length === 0 ? (
              <div className="empty">
                <div style={{ fontSize: 55 }}>🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add something you love from the collection.</p>
              </div>
            ) : (
              <>
                {Array.from(new Set(cart)).map((id) => {
                  const product = products.find((item) => item.id === id);
                  if (!product) return null;

                  const quantity = getQuantity(product.id);

                  return (
                    <div className="cartItem" key={product.id}>
                      <div className="cartItemIcon">
                        <img src={product.image} alt={product.name} />
                      </div>

                      <div className="cartItemInfo">
                        <h4>{product.name}</h4>
                        <p>₹{getSalePrice(product).toLocaleString("en-IN")}</p>
                        <small>
                          ₹{product.oldPrice.toLocaleString("en-IN")} before
                          discount
                        </small>

                        <div className="cartActions">
                          <button
                            className="qtyButton"
                            onClick={() => decreaseQuantity(product.id)}
                          >
                            −
                          </button>

                          <span className="qtyValue">{quantity}</span>

                          <button
                            className="qtyButton"
                            onClick={() => increaseQuantity(product.id)}
                          >
                            +
                          </button>

                          <button
                            className="remove"
                            onClick={() =>
                              removeAllOfProduct(product.id)
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="summaryBox">
                  <div className="summaryRow">
                    <span>Subtotal</span>
                    <strong>
                      ₹{cartSubtotal.toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="summaryRow">
                    <span>Delivery</span>
                    <strong>
                      {delivery === 0 ? "FREE" : `₹${delivery}`}
                    </strong>
                  </div>

                  {discount > 0 && (
                    <div className="summaryRow discount">
                      <span>VELO discount (5%)</span>
                      <strong>
                        −₹{discount.toLocaleString("en-IN")}
                      </strong>
                    </div>
                  )}

                  <div className="freeDelivery">
                    {delivery === 0
                      ? "✓ You unlocked FREE delivery"
                      : `Add ₹${(999 - cartSubtotal).toLocaleString(
                          "en-IN"
                        )} more for FREE delivery`}
                  </div>

                  <div className="summaryRow">
                    <span>You save</span>
                    <strong>
                      ₹{(cartSavings + discount).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="cartTotal">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button className="checkout" onClick={openCheckout}>
                  Proceed to Checkout →
                </button>
              </>
            )}
          </aside>
        </div>
      )}

      {showCheckout && (
        <div className="checkoutOverlay">
          <div className="checkoutPanel">
            <div className="checkoutTop">
              <div>
                <h2>
                  {orderPlaced ? "Order Confirmed" : "Secure Checkout"}
                </h2>
                <p>
                  {orderPlaced
                    ? "Your VELO order has been placed successfully."
                    : "Complete your delivery details to place the order."}
                </p>
              </div>

              {!orderPlaced && (
                <button
                  className="close"
                  onClick={() => setShowCheckout(false)}
                  aria-label="Close checkout"
                >
                  ×
                </button>
              )}
            </div>

            {orderPlaced ? (
              <div className="successBox">
                <div className="successIcon">✓</div>
                <h2>Thank you for shopping with VELO!</h2>
                <p>
                  Your order has been placed. We will send delivery updates to
                  your contact details.
                </p>

                <div className="orderId">
                  Order #{lastOrderId || "VLO-PENDING"}
                </div>

                <button
                  className="placeOrder"
                  onClick={() => {
                    setOrderPlaced(false);
                    setShowCheckout(false);
                    setCart([]);
                    setLastOrderId("");
                    removeCoupon();
                  }}
                >
                  Continue Shopping →
                </button>
              </div>
            ) : (
              <div className="checkoutGrid">
                <div>
                  <div className="checkoutCard">
                    <h3>1. Delivery Address</h3>

                    <div className="formGrid">
                      <div className="field">
                        <label>Full Name</label>
                        <input
                          value={deliveryName}
                          onChange={(e) =>
                            setDeliveryName(e.target.value)
                          }
                          placeholder="Enter your name"
                        />
                      </div>

                      <div className="field">
                        <label>Mobile Number</label>
                        <input
                          value={deliveryPhone}
                          onChange={(e) =>
                            setDeliveryPhone(
                              e.target.value.replace(/\D/g, "").slice(0, 10)
                            )
                          }
                          placeholder="10-digit mobile number"
                          inputMode="numeric"
                        />
                      </div>

                      <div className="field full">
                        <label>Address</label>
                        <input
                          value={deliveryAddress}
                          onChange={(e) =>
                            setDeliveryAddress(e.target.value)
                          }
                          placeholder="House / Flat / Street / Area"
                        />
                      </div>

                      <div className="field">
                        <label>City</label>
                        <input
                          value={deliveryCity}
                          onChange={(e) => setDeliveryCity(e.target.value)}
                          placeholder="Mumbai"
                        />
                      </div>

                      <div className="field">
                        <label>PIN Code</label>
                        <input
                          value={deliveryPin}
                          onChange={(e) =>
                            setDeliveryPin(
                              e.target.value.replace(/\D/g, "").slice(0, 6)
                            )
                          }
                          placeholder="400001"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="checkoutCard" style={{ marginTop: 16 }}>
                    <h3>2. Payment Method</h3>

                    <div className="paymentOptions">
                      {[
                        ["UPI", "UPI / Google Pay / PhonePe"],
                        ["CARD", "Credit / Debit Card"],
                        ["COD", "Cash on Delivery"],
                      ].map(([value, label]) => (
                        <label
                          key={value}
                          className={`paymentOption ${
                            paymentMethod === value ? "active" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={value}
                            checked={paymentMethod === value}
                            onChange={() => setPaymentMethod(value)}
                          />
                          <span>
                            <strong>{value}</strong> — {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="checkoutCard">
                  <h3>Order Summary</h3>

                  <div className="checkoutItems">
                    {Array.from(new Set(cart)).map((id) => {
                      const product = products.find(
                        (item) => item.id === id
                      );
                      if (!product) return null;

                      const qty = getQuantity(Number(id));

                      return (
                        <div className="checkoutItem" key={id}>
                          <img src={product.image} alt={product.name} />

                          <div className="checkoutItemInfo">
                            <strong>{product.name}</strong>
                            <span>
                              Qty {qty} · ₹
                              {(product.price * qty).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="couponBox" style={{marginTop:16,padding:14,border:"1px solid #252d44",borderRadius:16,background:"#0b1020"}}>
                    <div style={{fontWeight:900,marginBottom:8}}>🎟️ Have a coupon?</div>
                    {appliedCoupon ? (
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}><span><strong>{appliedCoupon.code}</strong> applied · You save ₹{couponDiscount.toLocaleString("en-IN")}</span><button className="adminSecondaryButton" onClick={removeCoupon}>Remove</button></div>
                    ) : (
                      <div style={{display:"flex",gap:8}}><input value={couponCodeInput} onChange={(e)=>setCouponCodeInput(e.target.value.toUpperCase())} placeholder="Enter coupon code" style={{flex:1,padding:"12px 14px",borderRadius:12,border:"1px solid #2b3550",background:"#070b16",color:"#fff"}}/><button className="adminPrimaryButton" onClick={applyCoupon} disabled={couponApplying}>{couponApplying ? "Checking..." : "Apply"}</button></div>
                    )}
                  </div>

                  <div className="summaryBox" style={{ marginTop: 18 }}>
                    <div className="summaryRow">
                      <span>Subtotal</span>
                      <strong>
                        ₹{cartSubtotal.toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div className="summaryRow">
                      <span>Delivery</span>
                      <strong>
                        {delivery === 0 ? "FREE" : `₹${delivery}`}
                      </strong>
                    </div>

                    {discount > 0 && (
                      <div className="summaryRow discount">
                        <span>Discount</span>
                        <strong>
                          −₹{discount.toLocaleString("en-IN")}
                        </strong>
                      </div>
                    )}

                    <div className="cartTotal">
                      <span>Total</span>
                      <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <button
                    className="placeOrder"
                    onClick={placeOrder}
                    disabled={placingOrder}
                    style={{ opacity: placingOrder ? 0.65 : 1 }}
                  >
                    {placingOrder
                      ? "Placing Order…"
                      : `Place Order • ₹${cartTotal.toLocaleString("en-IN")}`}
                  </button>

                  <div className="secureNote">
                    🔒 Demo checkout UI · Connect a trusted payment provider
                    before accepting real payments.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {notice && <div className="toast">{notice}</div>}
    </main>
  );
}
