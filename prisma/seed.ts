import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COVER_IMAGES: Record<string, string> = {
  'sepid-dental': 'https://images.pexels.com/photos/5355863/pexels-photo-5355863.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'vip-barbershop': 'https://images.pexels.com/photos/26832816/pexels-photo-26832816.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'nobatyar-cafe': 'https://images.pexels.com/photos/39047893/pexels-photo-39047893.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'aramesh-massage': 'https://images.pexels.com/photos/6187418/pexels-photo-6187418.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'pakizeh-drycleaning': 'https://images.pexels.com/photos/8774650/pexels-photo-8774650.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'rose-blanc-flowers': 'https://images.pexels.com/photos/35855712/pexels-photo-35855712.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'gamma-language': 'https://images.pexels.com/photos/7156125/pexels-photo-7156125.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'energy-gym': 'https://images.pexels.com/photos/6628962/pexels-photo-6628962.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'salamat-clinic': 'https://images.pexels.com/photos/4269268/pexels-photo-4269268.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'dorakhshan-dental': 'https://images.pexels.com/photos/4269277/pexels-photo-4269277.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'artin-beauty-salon': 'https://images.pexels.com/photos/3037215/pexels-photo-3037215.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'parsian-gold-gym': 'https://images.pexels.com/photos/3888405/pexels-photo-3888405.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'farvardin-restaurant': 'https://images.pexels.com/photos/15105621/pexels-photo-15105621.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'lahzeh-studio': 'https://images.pexels.com/photos/6502543/pexels-photo-6502543.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'novin-counseling': 'https://images.pexels.com/photos/5428012/pexels-photo-5428012.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'mehregan-dental': 'https://images.pexels.com/photos/305567/pexels-photo-305567.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'golestan-beauty': 'https://images.pexels.com/photos/26832816/pexels-photo-26832816.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'asia-sport-club': 'https://images.pexels.com/photos/3838705/pexels-photo-3838705.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
};

// Iranian week: dayOfWeek 0=Saturday, 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday(closed)
const FULL_WEEK: { dayOfWeek: number; openTime: string; closeTime: string }[] = [
  { dayOfWeek: 0, openTime: '09:00', closeTime: '21:00' },
  { dayOfWeek: 1, openTime: '09:00', closeTime: '21:00' },
  { dayOfWeek: 2, openTime: '09:00', closeTime: '21:00' },
  { dayOfWeek: 3, openTime: '09:00', closeTime: '21:00' },
  { dayOfWeek: 4, openTime: '09:00', closeTime: '21:00' },
  { dayOfWeek: 5, openTime: '09:00', closeTime: '18:00' },
];

const WEEK_NO_FRI: { dayOfWeek: number; openTime: string; closeTime: string }[] = [
  { dayOfWeek: 0, openTime: '08:00', closeTime: '20:00' },
  { dayOfWeek: 1, openTime: '08:00', closeTime: '20:00' },
  { dayOfWeek: 2, openTime: '08:00', closeTime: '20:00' },
  { dayOfWeek: 3, openTime: '08:00', closeTime: '20:00' },
  { dayOfWeek: 4, openTime: '08:00', closeTime: '20:00' },
  { dayOfWeek: 5, openTime: '08:00', closeTime: '14:00' },
];

interface ServiceSeed {
  name: string;
  price: number;
  durationMin: number;
}

interface BusinessSeed {
  name: string;
  slug: string;
  description: string;
  phone: string;
  address: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  priceLevel: number;
  appointmentCount: number;
  lat: number;
  lng: number;
  categorySlug: string;
  citySlug: string;
  neighborhoodSlug: string;
  coverImage?: string;
  services: ServiceSeed[];
  workingHours: { dayOfWeek: number; openTime: string; closeTime: string }[];
  staff?: { name: string; role: string; photo?: string }[];
  gallery?: string[];
}

const businessData: BusinessSeed[] = [
  {
    name: 'کلینیک دندان‌پزشکی سپید',
    slug: 'sepid-dental',
    description: 'ارائه خدمات تخصصی دندانپزشکی با کادر مجرب و تجهیزات پیشرفته',
    phone: '021-12345678', address: 'تهران، سعادت‌آباد، خیابان ۲۴',
    rating: 4.9, reviewCount: 124, isFeatured: true, priceLevel: 3, appointmentCount: 1250,
    lat: 35.7560, lng: 51.4180,
    categorySlug: 'doctor', citySlug: 'tehran', neighborhoodSlug: 'saadatabad',
    services: [
      { name: 'معاینه و جرم‌گیری', price: 350000, durationMin: 30 },
      { name: 'عصب‌کشی دندان', price: 1200000, durationMin: 60 },
      { name: 'روکش دندان', price: 2500000, durationMin: 90 },
    ],
    workingHours: FULL_WEEK,
    staff: [
      { name: 'دکتر سحر احمدی', role: 'متخصص دندان‌پزشکی اطفال', photo: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
      { name: 'دکتر رضا کریمی', role: 'متخصص ارتودنسی', photo: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
      { name: 'دکتر مهسا رستمی', role: 'دندان‌پزشک عمومی', photo: 'https://images.pexels.com/photos/5214955/pexels-photo-5214955.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
    ],
  },
  {
    name: 'آرایشگاه مردانه VIP',
    slug: 'vip-barbershop',
    description: 'پیرایش و خدمات مردانه VIP با بهترین استایلیست‌ها',
    phone: '071-2345678', address: 'شیراز، معالی‌آباد، خیابان ۱۴',
    rating: 4.8, reviewCount: 98, isFeatured: true, priceLevel: 2, appointmentCount: 890,
    lat: 29.5918, lng: 52.5837,
    categorySlug: 'beauty', citySlug: 'shiraz', neighborhoodSlug: 'maaliabad',
    services: [
      { name: 'اصلاح مو', price: 150000, durationMin: 30 },
      { name: 'اصلاح ریش', price: 80000, durationMin: 20 },
      { name: 'رنگ مو', price: 450000, durationMin: 60 },
    ],
    workingHours: WEEK_NO_FRI,
    staff: [
      { name: 'علی رضایی', role: 'استایلیست ارشد', photo: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
      { name: 'محمد حسینی', role: 'متخصص ریش‌تراشی', photo: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
      { name: 'سینا مرادی', role: 'متخصص رنگ مو', photo: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
    ],
  },
  {
    name: 'کافه رستوران نوبت‌یار',
    slug: 'nobatyar-cafe',
    description: 'غذاهای سنتی و کافه در محیطی دلنشین',
    phone: '031-1234567', address: 'اصفهان، جلفا، کوچه ارامنه',
    rating: 4.7, reviewCount: 86, isFeatured: true, priceLevel: 2, appointmentCount: 1800,
    lat: 32.6539, lng: 51.6660,
    categorySlug: 'other', citySlug: 'isfahan', neighborhoodSlug: 'jolfa',
    services: [
      { name: 'رزرو میز ۴ نفره', price: 0, durationMin: 90 },
      { name: 'منوی ویژه ناهار', price: 320000, durationMin: 60 },
      { name: 'قهوه اسپرسو', price: 95000, durationMin: 20 },
    ],
    workingHours: FULL_WEEK,
  },
  {
    name: 'مرکز ماساژ آرامش',
    slug: 'aramesh-massage',
    description: 'ماساژ درمانی و خدمات اسپا در محیطی آرام',
    phone: '051-3456789', address: 'مشهد، احمدآباد، بلوار وکیل‌آباد',
    rating: 4.9, reviewCount: 67, isFeatured: true, priceLevel: 3, appointmentCount: 670,
    lat: 36.2970, lng: 59.6060,
    categorySlug: 'beauty', citySlug: 'mashhad', neighborhoodSlug: 'ahmadabad',
    services: [
      { name: 'ماساژ کل بدن', price: 600000, durationMin: 60 },
      { name: 'ماساژ سنگ داغ', price: 750000, durationMin: 90 },
      { name: 'ماساژ پا', price: 250000, durationMin: 30 },
    ],
    workingHours: WEEK_NO_FRI,
    staff: [
      { name: 'نگار صادقی', role: 'متخصص ماساژ درمانی', photo: 'https://images.pexels.com/photos/3865711/pexels-photo-3865711.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
      { name: 'آیدا موسوی', role: 'متخصص ماساژ سنگ داغ', photo: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
    ],
  },
  {
    name: 'خشک‌شویی پاکیزه',
    slug: 'pakizeh-drycleaning',
    description: 'خدمات خشک‌شویی و لباسشویی با کیفیت',
    phone: '041-1234567', address: 'تبریز، خیابان ولیعصر',
    rating: 4.5, reviewCount: 12, isFeatured: false, priceLevel: 1, appointmentCount: 230,
    lat: 38.0800, lng: 46.2919,
    categorySlug: 'other', citySlug: 'tabriz', neighborhoodSlug: 'valiasr',
    services: [
      { name: 'خشک‌شویی کت', price: 120000, durationMin: 30 },
      { name: 'شستشوی لباس عادی', price: 60000, durationMin: 30 },
      { name: 'اتوکاری', price: 45000, durationMin: 20 },
    ],
    workingHours: WEEK_NO_FRI,
  },
  {
    name: 'گل‌فروشی رز سفید',
    slug: 'rose-blanc-flowers',
    description: 'گل و دسته‌گل‌های متنوع برای همه مناسبت‌ها',
    phone: '021-22334455', address: 'تهران، ونک، خیابان ملاصراپ',
    rating: 4.6, reviewCount: 18, isFeatured: false, priceLevel: 1, appointmentCount: 420,
    lat: 35.7570, lng: 51.4100,
    categorySlug: 'other', citySlug: 'tehran', neighborhoodSlug: 'vanak',
    services: [
      { name: 'دسته گل رز', price: 350000, durationMin: 20 },
      { name: 'گل باکس', price: 500000, durationMin: 30 },
      { name: 'تزئین گل آرایی', price: 800000, durationMin: 60 },
    ],
    workingHours: FULL_WEEK,
  },
  {
    name: 'آموزشگاه زبان گاما',
    slug: 'gamma-language',
    description: 'آموزش زبان‌های خارجی با اساتید مجرب',
    phone: '026-1234567', address: 'کرج، گوهردشت، بلوار طالقانی',
    rating: 4.4, reviewCount: 15, isFeatured: false, priceLevel: 2, appointmentCount: 560,
    lat: 35.8400, lng: 50.9800,
    categorySlug: 'education', citySlug: 'karaj', neighborhoodSlug: 'gohardasht',
    services: [
      { name: 'کلاس خصوصی انگلیسی', price: 400000, durationMin: 90 },
      { name: 'کلاس گروهی آیلتس', price: 250000, durationMin: 120 },
      { name: 'کارگاه مکالمه', price: 180000, durationMin: 60 },
    ],
    workingHours: WEEK_NO_FRI,
  },
  {
    name: 'باشگاه بدنسازی انرژی',
    slug: 'energy-gym',
    description: 'بدن‌سازی و کلاس‌های گروهی با تجهیزات پیشرفته',
    phone: '031-7654321', address: 'اصفهان، مرداویج، خیابان امام',
    rating: 4.8, reviewCount: 24, isFeatured: false, priceLevel: 2, appointmentCount: 310,
    lat: 32.6600, lng: 51.6700,
    categorySlug: 'doctor', citySlug: 'isfahan', neighborhoodSlug: 'mardavij',
    services: [
      { name: 'ماهانه بدنسازی', price: 800000, durationMin: 60 },
      { name: 'کلاس CXWORX', price: 150000, durationMin: 45 },
      { name: 'جلسه با مربی خصوصی', price: 500000, durationMin: 60 },
    ],
    workingHours: FULL_WEEK,
  },
  {
    name: 'کلینیک تخصصی سلامت',
    slug: 'salamat-clinic',
    description: 'کلینیک چندتخصصی با پزشکان حاذق',
    phone: '021-88776655', address: 'تهران، الهیه، خیابان مقدم',
    rating: 4.7, reviewCount: 210, isFeatured: true, priceLevel: 3, appointmentCount: 2100,
    lat: 35.7700, lng: 51.4200,
    categorySlug: 'doctor', citySlug: 'tehran', neighborhoodSlug: 'elahieh',
    services: [
      { name: 'ویزیت پزشک عمومی', price: 250000, durationMin: 30 },
      { name: 'ویزیت متخصص قلب', price: 500000, durationMin: 30 },
      { name: 'نوار قلب', price: 350000, durationMin: 30 },
    ],
    workingHours: FULL_WEEK,
    staff: [
      { name: 'دکتر پوریا نوری', role: 'متخصص قلب و عروق', photo: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
      { name: 'دکتر فاطمه عباسی', role: 'پزشک عمومی', photo: 'https://images.pexels.com/photos/5214955/pexels-photo-5214955.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
    ],
  },
  {
    name: 'دندان‌پزشکی درخشان',
    slug: 'dorakhshan-dental',
    description: 'دندان‌پزشکی کودکان و بزرگسالان',
    phone: '021-22445566', address: 'تهران، جردن، خیابان آفریقا',
    rating: 4.6, reviewCount: 76, isFeatured: false, priceLevel: 2, appointmentCount: 540,
    lat: 35.7600, lng: 51.4300,
    categorySlug: 'doctor', citySlug: 'tehran', neighborhoodSlug: 'jordan',
    services: [
      { name: 'ویزیت و مشاوره', price: 200000, durationMin: 30 },
      { name: 'تعمیر دندان', price: 600000, durationMin: 45 },
      { name: 'بلیچینگ دندان', price: 1800000, durationMin: 90 },
    ],
    workingHours: WEEK_NO_FRI,
  },
  {
    name: 'سالن زیبایی آرتین',
    slug: 'artin-beauty-salon',
    description: 'خدمات زیبایی مو و پوست و ناخن',
    phone: '021-33445566', address: 'تهران، ونک، خیابان نلسون ماندلا',
    rating: 4.8, reviewCount: 145, isFeatured: true, priceLevel: 2, appointmentCount: 1100,
    lat: 35.7550, lng: 51.4150,
    categorySlug: 'beauty', citySlug: 'tehran', neighborhoodSlug: 'vanak',
    services: [
      { name: 'کوتاهی و رنگ مو', price: 550000, durationMin: 90 },
      { name: 'کاشت ناخن', price: 400000, durationMin: 60 },
      { name: 'میکاپ عروس', price: 2500000, durationMin: 120 },
    ],
    workingHours: FULL_WEEK,
    staff: [
      { name: 'نازنین احمدی', role: 'متخصص رنگ و مش', photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
      { name: 'سارا محمدی', role: 'متخصص کوتاهی مو', photo: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
      { name: 'پریسا مرادی', role: 'متخصص کراتین و احیا', photo: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
      { name: 'الهام علیزاده', role: 'متخصص شینیون', photo: 'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
    ],
  },
  {
    name: 'باشگاه طلایی پارسیان',
    slug: 'parsian-gold-gym',
    description: 'بدن‌سازی و فیتنس لوکس',
    phone: '021-55667788', address: 'تهران، سعادت‌آباد، بلوار دریا',
    rating: 4.7, reviewCount: 92, isFeatured: false, priceLevel: 3, appointmentCount: 430,
    lat: 35.7580, lng: 51.4190,
    categorySlug: 'doctor', citySlug: 'tehran', neighborhoodSlug: 'saadatabad',
    services: [
      { name: 'اشتراک ۳ ماهه', price: 2400000, durationMin: 60 },
      { name: 'کلاس یوگا', price: 180000, durationMin: 60 },
      { name: 'جلسه پرسنال ترینینگ', price: 600000, durationMin: 60 },
    ],
    workingHours: FULL_WEEK,
    staff: [
      { name: 'بهنام تقوی', role: 'مربی ارشد بدنسازی', photo: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
      { name: 'مرجان جوادی', role: 'مربی یوگا', photo: 'https://images.pexels.com/photos/3865711/pexels-photo-3865711.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
    ],
  },
  {
    name: 'رستوران فروردین',
    slug: 'farvardin-restaurant',
    description: 'غذاهای ایرانی و سنتی در محیطی زیبا',
    phone: '021-66778899', address: 'تهران، الهیه، خیابان دربند',
    rating: 4.5, reviewCount: 310, isFeatured: false, priceLevel: 2, appointmentCount: 1600,
    lat: 35.7720, lng: 51.4250,
    categorySlug: 'other', citySlug: 'tehran', neighborhoodSlug: 'elahieh',
    services: [
      { name: 'رزرو میز ۲ نفره', price: 0, durationMin: 90 },
      { name: 'منوی ویژه شبانه', price: 450000, durationMin: 60 },
      { name: 'دسر سنتی', price: 120000, durationMin: 20 },
    ],
    workingHours: FULL_WEEK,
  },
  {
    name: 'استودیو لحظه',
    slug: 'lahzeh-studio',
    description: 'عکاسی پرتره و خانوادگی',
    phone: '021-77889900', address: 'تهران، جردن، خیابان سعیدی',
    rating: 4.6, reviewCount: 38, isFeatured: false, priceLevel: 2, appointmentCount: 280,
    lat: 35.7610, lng: 51.4280,
    categorySlug: 'other', citySlug: 'tehran', neighborhoodSlug: 'jordan',
    services: [
      { name: 'پرتره نیم‌تنه', price: 500000, durationMin: 45 },
      { name: 'عکاسی خانوادگی', price: 1200000, durationMin: 90 },
      { name: 'ادیت عکس', price: 150000, durationMin: 30 },
    ],
    workingHours: WEEK_NO_FRI,
  },
  {
    name: 'مرکز مشاوره نوین',
    slug: 'novin-counseling',
    description: 'مشاوره روانشناسی و خانواده',
    phone: '021-88990011', address: 'تهران، ونک، خیابان شهرداری',
    rating: 4.8, reviewCount: 56, isFeatured: false, priceLevel: 2, appointmentCount: 390,
    lat: 35.7540, lng: 51.4120,
    categorySlug: 'education', citySlug: 'tehran', neighborhoodSlug: 'vanak',
    services: [
      { name: 'جلسه مشاوره فردی', price: 600000, durationMin: 60 },
      { name: 'مشاوره زوجین', price: 900000, durationMin: 90 },
      { name: 'کارگاه مدیریت خشم', price: 350000, durationMin: 120 },
    ],
    workingHours: WEEK_NO_FRI,
  },
  {
    name: 'دندان‌پزشکی مهرگان',
    slug: 'mehregan-dental',
    description: 'دندان‌پزشکی زیبایی و ایمپلنت',
    phone: '021-99001122', address: 'تهران، سعادت‌آباد، خیابان اسفندیار',
    rating: 4.7, reviewCount: 88, isFeatured: false, priceLevel: 3, appointmentCount: 620,
    lat: 35.7575, lng: 51.4175,
    categorySlug: 'doctor', citySlug: 'tehran', neighborhoodSlug: 'saadatabad',
    services: [
      { name: 'ویزیت و عکس رادیولوژی', price: 300000, durationMin: 30 },
      { name: 'ایمپلنت دندان', price: 15000000, durationMin: 120 },
      { name: 'لامینت دندان', price: 3000000, durationMin: 90 },
    ],
    workingHours: FULL_WEEK,
  },
  {
    name: 'سالن زیبایی گلستان',
    slug: 'golestan-beauty',
    description: 'مو، ناخن، پوست و آرایش',
    phone: '071-99887766', address: 'شیراز، معالی‌آباد، خیابان دانشجو',
    rating: 4.5, reviewCount: 42, isFeatured: false, priceLevel: 1, appointmentCount: 340,
    lat: 29.5900, lng: 52.5800,
    categorySlug: 'beauty', citySlug: 'shiraz', neighborhoodSlug: 'maaliabad',
    services: [
      { name: 'کوتاهی مو', price: 100000, durationMin: 30 },
      { name: 'مانیکور', price: 150000, durationMin: 45 },
      { name: 'رنگ مو کامل', price: 400000, durationMin: 90 },
    ],
    workingHours: WEEK_NO_FRI,
  },
  {
    name: 'باشگاه ورزشی آسیا',
    slug: 'asia-sport-club',
    description: 'بدن‌سازی، ایروبیک و کلاس‌های گروهی',
    phone: '051-99880011', address: 'مشهد، احمدآباد، بلوار سجاد',
    rating: 4.4, reviewCount: 31, isFeatured: false, priceLevel: 1, appointmentCount: 260,
    lat: 36.2950, lng: 59.6100,
    categorySlug: 'doctor', citySlug: 'mashhad', neighborhoodSlug: 'ahmadabad',
    services: [
      { name: 'اشتراک ماهانه', price: 500000, durationMin: 60 },
      { name: 'کلاس ایروبیک', price: 120000, durationMin: 45 },
      { name: 'سونا و جکوزی', price: 80000, durationMin: 30 },
    ],
    workingHours: FULL_WEEK,
  },
];

async function main() {
  // Categories
  const categories = [
    { name: 'زیبایی و سلامت', slug: 'beauty', icon: 'Scissors', description: '۸۹ سالن' },
    { name: 'پزشکی و سلامت', slug: 'doctor', icon: 'Stethoscope', description: '۱۲۸ مطب' },
    { name: 'خودرو و تعمیرات', slug: 'car', icon: 'Car', description: '۶۲ تعمیرگاه' },
    { name: 'خانه و ساختمان', slug: 'home', icon: 'HomeIcon', description: '۳۱ تخصص' },
    { name: 'آموزش و کلاس', slug: 'education', icon: 'GraduationCap', description: '۴۵ مرکز' },
    { name: 'سایر خدمات', slug: 'other', icon: 'MoreHorizontal', description: '۱۲ تخصص' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, description: cat.description },
      create: cat,
    });
  }

  // Cities
  const cities = [
    { name: 'تهران', slug: 'tehran' },
    { name: 'اصفهان', slug: 'isfahan' },
    { name: 'شیراز', slug: 'shiraz' },
    { name: 'مشهد', slug: 'mashhad' },
    { name: 'تبریز', slug: 'tabriz' },
    { name: 'کرج', slug: 'karaj' },
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: { name: city.name },
      create: { name: city.name, slug: city.slug },
    });
  }

  // Neighborhoods
  const neighborhoodData: Record<string, { name: string; slug: string }[]> = {
    tehran: [
      { name: 'سعادت‌آباد', slug: 'saadatabad' },
      { name: 'ونک', slug: 'vanak' },
      { name: 'الهیه', slug: 'elahieh' },
      { name: 'جردن', slug: 'jordan' },
    ],
    isfahan: [{ name: 'جلفا', slug: 'jolfa' }, { name: 'مرداویج', slug: 'mardavij' }],
    shiraz: [{ name: 'معالی‌آباد', slug: 'maaliabad' }],
    mashhad: [{ name: 'احمدآباد', slug: 'ahmadabad' }],
    tabriz: [{ name: 'ولیعصر', slug: 'valiasr' }],
    karaj: [{ name: 'گوهردشت', slug: 'gohardasht' }],
  };

  for (const [citySlug, neighborhoods] of Object.entries(neighborhoodData)) {
    const city = await prisma.city.findUnique({ where: { slug: citySlug } });
    if (!city) continue;
    for (const n of neighborhoods) {
      await prisma.neighborhood.upsert({
        where: { slug: n.slug },
        update: { name: n.name, cityId: city.id },
        create: { ...n, cityId: city.id },
      });
    }
  }

  // Clear old services + working hours + staff + gallery
  await prisma.service.deleteMany({});
  await prisma.workingHours.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.galleryImage.deleteMany({});

  // Businesses
  for (const b of businessData) {
    const category = await prisma.category.findUnique({ where: { slug: b.categorySlug } });
    const city = await prisma.city.findUnique({ where: { slug: b.citySlug } });
    const neighborhood = await prisma.neighborhood.findUnique({ where: { slug: b.neighborhoodSlug } });
    if (!category || !city) continue;

    const coverImage = b.coverImage || COVER_IMAGES[b.slug] || null;

    const business = await prisma.business.upsert({
      where: { slug: b.slug },
      update: {
        name: b.name, description: b.description, phone: b.phone, address: b.address,
        rating: b.rating, reviewCount: b.reviewCount, isFeatured: b.isFeatured,
        priceLevel: b.priceLevel, appointmentCount: b.appointmentCount,
        categoryId: category.id, cityId: city.id, neighborhoodId: neighborhood?.id || null,
        coverImage, lat: b.lat, lng: b.lng,
      },
      create: {
        name: b.name, slug: b.slug, description: b.description, phone: b.phone, address: b.address,
        rating: b.rating, reviewCount: b.reviewCount, isFeatured: b.isFeatured,
        priceLevel: b.priceLevel, appointmentCount: b.appointmentCount,
        categoryId: category.id, cityId: city.id, neighborhoodId: neighborhood?.id || null,
        coverImage, lat: b.lat, lng: b.lng,
      },
    });

    // Services
    for (const svc of b.services) {
      await prisma.service.create({
        data: { ...svc, businessId: business.id },
      });
    }

    // Working hours
    for (const wh of b.workingHours) {
      await prisma.workingHours.create({
        data: { ...wh, businessId: business.id },
      });
    }

    if (b.staff) {
      await prisma.staff.createMany({
        data: b.staff.map((member) => ({ ...member, businessId: business.id })),
      });
    }

    if (b.gallery) {
      await prisma.galleryImage.createMany({
        data: b.gallery.map((url) => ({ url, businessId: business.id })),
      });
    }
  }

  // Reviews
  const reviewData = [
    { name: 'علی محمدی', rating: 5, comment: 'رزرو نوبت از کلینیک بسیار راحت بود. سیستم یادآوری پیامکی ۲ ساعت قبل نوبت رو بهم یادآوری کرد.', businessSlug: 'sepid-dental' },
    { name: 'مریم افشار', rating: 5, comment: 'از وقتی سالن زیبایی‌ام رو در نوبت‌یار ثبت کردم، تلفن‌های مزاحم خیلی کمتر شده.', businessSlug: 'vip-barbershop' },
    { name: 'پوریا حسینی', rating: 5, comment: 'دقیقاً در ساعت رزرو شده کارم انجام شد. بدون یک دقیقه معطلی.', businessSlug: 'aramesh-massage' },
    { name: 'سارا محمدی', rating: 4, comment: 'خوب بود ولی کمی تاخیر داشت. در کل راضی‌ام.', businessSlug: 'nobatyar-cafe' },
  ];

  await prisma.review.deleteMany({});
  for (const r of reviewData) {
    const business = await prisma.business.findUnique({ where: { slug: r.businessSlug } });
    if (business) {
      await prisma.review.create({
        data: { name: r.name, rating: r.rating, comment: r.comment, businessId: business.id },
      });
    }
  }

  // FAQs
  await prisma.faq.deleteMany({});
  const faqs = [
    { question: 'چگونه می‌توانم در نوبت‌یار نوبت رزرو کنم؟', answer: 'کافیست ثبت‌نام کنید، خدمت مورد نظر را جستجو کنید، روز و ساعت خالی را برگزیده و دکمه تایید نوبت را بزنید. کل این فرآیند کمتر از یک دقیقه طول می‌کشد.', order: 1 },
    { question: 'آیا برای ثبت کسب‌وکار در نوبت‌یار باید هزینه‌ای پرداخت کنیم؟', answer: 'خیر، ثبت اولیه کاملاً رایگان است. جهت ارتقا به طرح‌های حرفه‌ای می‌توانید بسته‌های ماهیانه را خریداری فرمایید.', order: 2 },
    { question: 'کنسل کردن یا تغییر زمان نوبت رزرو شده امکان‌پذیر است؟', answer: 'بله، از طریق پنل کاربری بخش نوبت‌های من، نوبت خود را لغو یا تغییر زمان دهید.', order: 3 },
  ];

  for (const f of faqs) {
    await prisma.faq.create({ data: f });
  }

  console.log('Seed completed with services + working hours!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
