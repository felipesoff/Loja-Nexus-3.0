export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  cpf?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[];
  date: string;
  approved: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  active: boolean;
  parentId?: string;
  featured?: boolean;
  isGuide?: boolean;
}

export interface PaymentConfig {
  pixKey: string;
  pixQrCode: string;
  pixLegend: string;
  creditCardInfo: string;
  shippingFee: number;
  contactPhone?: string;
  contactEmail?: string;
  instagramUrl?: string;
}

export interface SizeStock {
  [size: string]: number;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  team: string;
  league: string;
  price: number;
  promotionalPrice?: number;
  costPrice?: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description: string;
  category: string; // Changed to string to support custom collections
  sizes: string[]; // Keep for compatibility, but prefer sizeStock
  sizeStock: SizeStock;
  stock: number; // Total stock
  active?: boolean;
  isNewArrival?: boolean;
}

export interface AbandonedCart {
  id: string;
  userId?: string;
  items: CartItem[];
  total: number;
  date: string;
  customerEmail?: string;
  customerName?: string;
}

export interface CartItem extends Product {
  selectedSize: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  shippingAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  date: string;
  paymentMethod: 'pix' | 'credit_card';
  trackingCode?: string;
  adminNotes?: string;
  couponCode?: string;
  discount?: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number;
  maxOrderValue?: number;
  minQuantity?: number;
  maxQuantity?: number;
  active: boolean;
  usageCount: number;
  maxUsage?: number;
  expiryDate?: string;
  isReferral?: boolean;
  indicatorName?: string;
  indicatorRewardType?: 'percentage' | 'fixed';
  indicatorRewardPerUse?: number;
  assignedUserId?: string;
  commissionPercentage?: number;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  couponCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId: string;
  orderTotal: number;
  discountApplied: number;
  date: string;
  commissionEarned?: number;
}
