export interface ServiceItem {
  id: number;
  name: string;
  price: number;
  durationMin: number;
}

export interface WorkingHoursItem {
  id: number;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface ReviewItem {
  id: number;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface StaffItem {
  id: number;
  name: string;
  role: string;
  photo: string | null;
}

export interface GalleryItem {
  id: number;
  url: string;
}

export interface SimilarBusiness {
  id: number;
  name: string;
  slug: string;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  category: { name: string };
  neighborhood: { name: string } | null;
}

export interface BusinessDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  coverImage: string | null;
  logoImage: string | null;
  lat: number | null;
  lng: number | null;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isVerified: boolean;
  priceLevel: number;
  category: { name: string; slug: string };
  city: { name: string };
  neighborhood: { name: string } | null;
  services: ServiceItem[];
  workingHours: WorkingHoursItem[];
  reviews: ReviewItem[];
  staff: StaffItem[];
  galleryImages: GalleryItem[];
  today: {
    day: string;
    openTime: string | null;
    closeTime: string | null;
    isOpen: boolean;
  };
  gallery: GalleryItem[];
}

export interface SalonApiResponse {
  business: BusinessDetail;
  similarBusinesses: SimilarBusiness[];
}

export interface AvailabilityResponse {
  date: string;
  duration: number;
  slots: string[];
}

export interface BookingResponse {
  booking: {
    id: number;
    date: string;
    time: string;
    customerName: string;
    totalPrice: number;
  };
}

export const PERSIAN_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

export function formatPrice(price: number): string {
  return price.toLocaleString('fa-IR');
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h} ساعت و ${m} دقیقه`;
  if (h > 0) return `${h} ساعت`;
  return `${m} دقیقه`;
}

export function toPersianDigits(input: string): string {
  return input.replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}
