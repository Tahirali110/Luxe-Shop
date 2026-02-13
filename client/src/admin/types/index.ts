// ============= Product Types =============
export interface ProductColor {
  name: string;
  hex: string;
  image: string;
  images?: string[];
  price?: number;
  originalPrice?: number;
}

export interface VariantStock {
  color: string;
  size: string;
  stock: number;
}

export interface Review {
  _id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  productId?: string;
  productName?: string;
  images?: string[];
  adminReply?: string;
  adminReplyDate?: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  longDescription: string;
  category: 'Clothing' | 'Electronics' | 'Accessories';
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  badge?: string;
  colors: ProductColor[];
  sizes: string[];
  sizePriceAdjustments?: Record<string, number>;
  features: string[];
  stock: number;
  variantStock?: VariantStock[];

  createdAt: string;
  updatedAt: string;
}

// ============= User Types =============
export interface Address {
  _id: string;
  label: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  _id: string;
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  isDefault: boolean;
}

export interface UPI {
  _id: string;
  upiId: string;
  isDefault: boolean;
}

export interface CartItem {
  product: string;
  color: string;
  size: string;
  quantity: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  upiIds: UPI[];
  wishlist: string[];
  cart: CartItem[];
  createdAt: string;
  updatedAt: string;
  totalOrders?: number;
  totalSpent?: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  role: 'admin' | 'demo_admin';
}

// ============= Order Types =============
export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export type PaymentMethodType = 'Credit Card' | 'UPI' | 'Wallet' | 'COD';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed';
export type OrderStatus = 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  _id: string;
  user: string;
  customerName?: string;
  customerEmail?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  totals: OrderTotals;
  createdAt: string;
  updatedAt: string;
}

// ============= Dashboard Types =============
export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
  revenueChange: number;
  ordersChange: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
}

// ============= API Response Types =============
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
}
