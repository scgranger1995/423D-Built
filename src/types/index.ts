type OrderStatus = string;
type PaymentStatus = string;
type ServiceType = string;
type InquiryTimeline = string;

// ============================================
// Cart Types
// ============================================

/** Item structure used during checkout */
export interface CheckoutItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // in cents
  customization?: string | null;
  image?: string;
}

// ============================================
// Shipping Types
// ============================================

/** Shipping rate returned from rate calculation APIs */
export interface ShippingRate {
  id: string;
  provider: string;
  serviceName: string;
  serviceLevel: string;
  estimatedDays: number;
  amount: number; // in cents
  currency: string;
  shippoRateId?: string;
}

// ============================================
// Service Inquiry Form Types
// ============================================

/** Form data submitted by customers requesting custom services */
export interface ServiceInquiryFormData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  company?: string;
  serviceType: ServiceType;
  description: string;
  material?: string;
  color?: string;
  quantity: number;
  fileUrls?: string[];
  timeline: InquiryTimeline;
  budget?: string;
  referralSource?: string;
}

// ============================================
// Admin Dashboard Types
// ============================================

/** Aggregated statistics displayed on the admin dashboard */
export interface AdminDashboardStats {
  totalRevenue: number; // in cents
  totalOrders: number;
  pendingOrders: number;
  newInquiries: number;
  totalProducts: number;
  activeProducts: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: number; // in cents
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: Date;
  }[];
  revenueByDay: {
    date: string; // ISO date string
    revenue: number; // in cents
  }[];
  ordersByStatus: {
    status: OrderStatus;
    count: number;
  }[];
}

// ============================================
// Site Content Types
// ============================================

/** Key-value map for retrieving site content by section */
export type SiteContentMap = Record<
  string,
  {
    value: string;
    type: "TEXT" | "HTML" | "IMAGE" | "JSON";
  }
>;

// ============================================
// Address Types
// ============================================

/** Shipping or billing address structure stored as JSON */
export interface Address {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

// ============================================
// API Response Types
// ============================================

/** Standard API success response */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
