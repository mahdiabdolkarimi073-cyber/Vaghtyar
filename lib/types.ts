export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'CUSTOMER' | 'BUSINESS_OWNER' | 'ADMIN';
}

export interface Business {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  neighborhood?: string | null;
  address?: string | null;
  phone?: string | null;
  coverImage?: string | null;
  profileImage?: string | null;
  description?: string | null;
  isVerified: boolean;
  isFeatured: boolean;
  autoConfirm: boolean;
  minAdvanceBookingHours: number;
  createdAt: string;
  ownerId: string;
  avgRating?: number;
  reviewCount?: number;
  minPrice?: number;
  isOpenNow?: boolean;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  durationMinutes: number;
  price: number;
  description?: string | null;
}

export interface Staff {
  id: string;
  businessId: string;
  name: string;
  photo?: string | null;
  specialty?: string | null;
}

export interface BusinessHours {
  id: string;
  businessId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Review {
  id: string;
  businessId: string;
  bookingId: string;
  customerName: string;
  rating: number;
  comment?: string | null;
  businessReply?: string | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  businessId: string;
  serviceId: string;
  staffId?: string | null;
  customerId?: string | null;
  customerName: string;
  customerPhone: string;
  customerNote?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  confirmationCode: string;
  createdAt: string;
  business?: Business;
  service?: Service;
  staff?: Staff | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  image?: string | null;
}

export interface City {
  id: string;
  name: string;
  slug: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
