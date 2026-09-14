import { PrismaClient, Role, BookingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.smsLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.businessHours.deleteMany();
  await prisma.business.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.city.deleteMany();

  // Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'آرایشگاه مردانه', slug: 'mens-barber', icon: 'scissors', image: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg' } }),
    prisma.category.create({ data: { name: 'سالن زیبایی', slug: 'beauty-salon', icon: 'sparkles', image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg' } }),
    prisma.category.create({ data: { name: 'کلینیک زیبایی', slug: 'beauty-clinic', icon: 'heart', image: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg' } }),
    prisma.category.create({ data: { name: 'آرایشگاه عروس', slug: 'bridal-salon', icon: 'crown', image: 'https://images.pexels.com/photos/3997389/pexels-photo-3997389.jpeg' } }),
    prisma.category.create({ data: { name: 'ناخن', slug: 'nail-salon', icon: 'hand', image: 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg' } }),
  ]);

  // Cities
  const cities = await Promise.all([
    prisma.city.create({ data: { name: 'کرمان', slug: 'kerman' } }),
    prisma.city.create({ data: { name: 'تهران', slug: 'tehran' } }),
    prisma.city.create({ data: { name: 'اصفهان', slug: 'isfahan' } }),
  ]);

  // Users
  const passwordHash = await bcrypt.hash('12345678', 10);

  const owner1 = await prisma.user.create({
    data: { name: 'علی محمدی', phone: '09120000001', passwordHash, role: Role.BUSINESS_OWNER },
  });

  const owner2 = await prisma.user.create({
    data: { name: 'مریم حسینی', phone: '09120000002', passwordHash, role: Role.BUSINESS_OWNER },
  });

  const customer1 = await prisma.user.create({
    data: { name: 'رضا کریمی', phone: '09120000003', passwordHash, role: Role.CUSTOMER },
  });

  const customer2 = await prisma.user.create({
    data: { name: 'سارا احمدی', phone: '09120000004', passwordHash, role: Role.CUSTOMER },
  });

  const admin = await prisma.user.create({
    data: { name: 'مدیر سیستم', phone: '09120000000', passwordHash, role: Role.ADMIN },
  });

  // Business 1
  const business1 = await prisma.business.create({
    data: {
      slug: 'salon-ali-kerman',
      name: 'سالن زیبایی علی',
      category: 'beauty-salon',
      city: 'kerman',
      neighborhood: 'مهدی‌آباد',
      address: 'کرمان، بلوار جمهوری، پلاک ۱۲',
      phone: '03432100000',
      coverImage: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
      profileImage: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
      description: 'سالن زیبایی علی با بیش از ۱۰ سال تجربه در ارائه خدمات زیبایی و پوست در شهر کرمان. محیطی مدرن و پرسنلی مجرب.',
      isVerified: true,
      isFeatured: true,
      autoConfirm: true,
      minAdvanceBookingHours: 2,
      ownerId: owner1.id,
    },
  });

  // Business hours for business 1 (Saturday=6 to Wednesday=3 open, Thursday=4 half, Friday=5 closed)
  for (let day = 0; day < 7; day++) {
    const isFriday = day === 5;
    const isThursday = day === 4;
    await prisma.businessHours.create({
      data: {
        businessId: business1.id,
        dayOfWeek: day,
        openTime: isThursday ? '09:00' : '08:00',
        closeTime: isThursday ? '14:00' : '20:00',
        isClosed: isFriday,
      },
    });
  }

  // Staff for business 1
  const staff1 = await prisma.staff.create({
    data: { businessId: business1.id, name: 'علی محمدی', specialty: 'اصلاح و کوتاه کردن مو', photo: 'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg' },
  });
  const staff2 = await prisma.staff.create({
    data: { businessId: business1.id, name: 'نگار رضایی', specialty: ' رنگ مو و هایلایت', photo: 'https://images.pexels.com/photos/3992659/pexels-photo-3992659.jpeg' },
  });

  // Services for business 1
  const service1 = await prisma.service.create({
    data: { businessId: business1.id, name: 'اصلاح مو مردانه', durationMinutes: 30, price: 80000, description: 'اصلاح و کوتاه کردن مو با دستگاه و قیچی' },
  });
  const service2 = await prisma.service.create({
    data: { businessId: business1.id, name: 'رنگ مو کامل', durationMinutes: 90, price: 350000, description: 'رنگ کامل مو با مواد درجه یک' },
  });
  const service3 = await prisma.service.create({
    data: { businessId: business1.id, name: 'هایلایت مو', durationMinutes: 120, price: 500000, description: 'هایلایت مو با تکنیک‌های روز' },
  });
  const service4 = await prisma.service.create({
    data: { businessId: business1.id, name: 'شستشوی مو و حالت‌دهی', durationMinutes: 45, price: 60000, description: 'شستشوی مو با محصولات تخصصی و حالت‌دهی' },
  });

  // Business 2
  const business2 = await prisma.business.create({
    data: {
      slug: 'clinic-maryam-tehran',
      name: 'کلینیک زیبایی مریم',
      category: 'beauty-clinic',
      city: 'tehran',
      neighborhood: 'سعادت‌آباد',
      address: 'تهران، سعادت‌آباد، خیابان نگارستان، پلاک ۸۵',
      phone: '02122700000',
      coverImage: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg',
      profileImage: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg',
      description: 'کلینیک زیبایی مریم ارائه‌دهنده خدمات تخصصی پوست، لیزر و زیبایی با تجهیزات مدرن و کادر پزشکی مجرب.',
      isVerified: true,
      isFeatured: false,
      autoConfirm: false,
      minAdvanceBookingHours: 4,
      ownerId: owner2.id,
    },
  });

  // Business hours for business 2
  for (let day = 0; day < 7; day++) {
    const isFriday = day === 5;
    await prisma.businessHours.create({
      data: {
        businessId: business2.id,
        dayOfWeek: day,
        openTime: '10:00',
        closeTime: '18:00',
        isClosed: isFriday,
      },
    });
  }

  // Staff for business 2
  const staff3 = await prisma.staff.create({
    data: { businessId: business2.id, name: 'دکتر مریم حسینی', specialty: 'متخصص پوست و زیبایی', photo: 'https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg' },
  });
  const staff4 = await prisma.staff.create({
    data: { businessId: business2.id, name: 'پریا صادقی', specialty: 'لیزر و پاکسازی پوست', photo: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg' },
  });

  // Services for business 2
  const service5 = await prisma.service.create({
    data: { businessId: business2.id, name: 'مشاوره پوست', durationMinutes: 30, price: 200000, description: 'مشاوره تخصصی با پزشک متخصص پوست' },
  });
  const service6 = await prisma.service.create({
    data: { businessId: business2.id, name: 'لیزر موهای زائد', durationMinutes: 60, price: 400000, description: 'لیزر دائمی موهای زائد با دستگاه جدید' },
  });
  const service7 = await prisma.service.create({
    data: { businessId: business2.id, name: 'پاکسازی پوست', durationMinutes: 45, price: 250000, description: 'پاکسازی عمیق پوست صورت' },
  });

  // Bookings
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const dayAfter = new Date(now);
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(14, 0, 0, 0);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(11, 0, 0, 0);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(15, 0, 0, 0);

  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastWeek.setHours(12, 0, 0, 0);

  const lastWeek2 = new Date(now);
  lastWeek2.setDate(lastWeek2.getDate() - 6);
  lastWeek2.setHours(9, 0, 0, 0);

  const lastWeek3 = new Date(now);
  lastWeek3.setDate(lastWeek3.getDate() - 5);
  lastWeek3.setHours(10, 0, 0, 0);

  const lastWeek4 = new Date(now);
  lastWeek4.setDate(lastWeek4.getDate() - 4);
  lastWeek4.setHours(14, 0, 0, 0);

  const lastWeek5 = new Date(now);
  lastWeek5.setDate(lastWeek5.getDate() - 3);
  lastWeek5.setHours(16, 0, 0, 0);

  const lastWeek6 = new Date(now);
  lastWeek6.setDate(lastWeek6.getDate() - 2);
  lastWeek6.setHours(15, 0, 0, 0);

  const lastWeek7 = new Date(now);
  lastWeek7.setDate(lastWeek7.getDate() - 8);
  lastWeek7.setHours(11, 0, 0, 0);

  const bookings = [
    { business: business1, service: service1, staff: staff1, customer: customer1, name: 'رضا کریمی', phone: '09120000003', date: tomorrow, start: '10:00', end: '10:30', status: BookingStatus.CONFIRMED, code: 'ABCD1234' },
    { business: business1, service: service2, staff: staff2, customer: customer2, name: 'سارا احمدی', phone: '09120000004', date: dayAfter, start: '14:00', end: '15:30', status: BookingStatus.PENDING, code: 'EFGH5678' },
    { business: business2, service: service5, staff: staff3, customer: null, name: 'محمد رضایی', phone: '09120000005', date: nextWeek, start: '11:00', end: '11:30', status: BookingStatus.CONFIRMED, code: 'IJKL9012' },
    { business: business1, service: service3, staff: staff2, customer: customer1, name: 'رضا کریمی', phone: '09120000003', date: yesterday, start: '15:00', end: '17:00', status: BookingStatus.COMPLETED, code: 'MNOP3456' },
    { business: business2, service: service6, staff: staff4, customer: null, name: 'فاطمه نوری', phone: '09120000006', date: lastWeek, start: '12:00', end: '13:00', status: BookingStatus.COMPLETED, code: 'QRST7890' },
    { business: business1, service: service4, staff: staff1, customer: customer2, name: 'سارا احمدی', phone: '09120000004', date: lastWeek2, start: '09:00', end: '09:45', status: BookingStatus.COMPLETED, code: 'UVWX1111' },
    { business: business1, service: service1, staff: staff1, customer: customer1, name: 'رضا کریمی', phone: '09120000003', date: lastWeek3, start: '10:00', end: '10:30', status: BookingStatus.COMPLETED, code: 'ZYAB2222' },
    { business: business2, service: service7, staff: staff3, customer: null, name: 'نرگس فرهمند', phone: '09120000007', date: lastWeek4, start: '14:00', end: '14:45', status: BookingStatus.COMPLETED, code: 'CDEF3333' },
    { business: business1, service: service2, staff: staff2, customer: customer2, name: 'مریم جعفری', phone: '09120000004', date: lastWeek5, start: '16:00', end: '17:30', status: BookingStatus.COMPLETED, code: 'GHIJ4444' },
    { business: business2, service: service5, staff: staff4, customer: null, name: 'حسین رحیمی', phone: '09120000008', date: lastWeek6, start: '15:00', end: '15:30', status: BookingStatus.COMPLETED, code: 'KLMN5555' },
    { business: business1, service: service4, staff: staff1, customer: null, name: 'سمیرا قاسمی', phone: '09120000009', date: lastWeek7, start: '11:00', end: '11:45', status: BookingStatus.COMPLETED, code: 'PQRS6666' },
  ];

  for (const b of bookings) {
    await prisma.booking.create({
      data: {
        businessId: b.business.id,
        serviceId: b.service.id,
        staffId: b.staff.id,
        customerId: b.customer?.id || null,
        customerName: b.name,
        customerPhone: b.phone,
        date: b.date,
        startTime: b.start,
        endTime: b.end,
        status: b.status,
        confirmationCode: b.code,
      },
    });
  }

  // Reviews
  const reviews = [
    { business: business1, customerName: 'رضا کریمی', rating: 5, comment: 'عالی بود، خیلی راضی بودم. محیط تمیز و پرسنل حرفه‌ای.', bookingCode: 'MNOP3456' },
    { business: business1, customerName: 'سارا احمدی', rating: 4, comment: 'کیفیت کار خوب بود ولی کمی دیر شد.', bookingCode: 'ABCD1234' },
    { business: business2, customerName: 'فاطمه نوری', rating: 5, comment: 'کلینیک بسیار تمیز و دکتر عالی بود. حتما باز میام.', bookingCode: 'QRST7890' },
    { business: business1, customerName: 'محمد علوی', rating: 5, comment: 'بهترین سالن زیبایی کرمان، پیشنهاد می‌کنم.', bookingCode: 'UVWX1111' },
    { business: business1, customerName: 'زهرا موسوی', rating: 4, comment: 'خدمات خوب بود ولی قیمت کمی بالا.', bookingCode: 'ZYAB2222' },
    { business: business2, customerName: 'نرگس فرهمند', rating: 5, comment: 'پاکسازی پوست فوق‌العاده شد، ممنون.', bookingCode: 'CDEF3333' },
    { business: business2, customerName: 'علی کاظمی', rating: 3, comment: 'مشاوره خوب بود ولی وقت کمی کم شد.', bookingCode: 'IJKL9012' },
    { business: business1, customerName: 'مریم جعفری', rating: 5, comment: 'رنگ مو عالی بود، ممنون از نگار خانم.', bookingCode: 'GHIJ4444' },
    { business: business2, customerName: 'حسین رحیمی', rating: 5, comment: 'مشاوره پوست خیلی خوب انجام شد.', bookingCode: 'KLMN5555' },
    { business: business1, customerName: 'سمیرا قاسمی', rating: 4, comment: 'کارشون خوبه ولی باید زودتر برید که صف نباشه.', bookingCode: 'PQRS6666' },
  ];

  for (const r of reviews) {
    const booking = await prisma.booking.findFirst({
      where: { confirmationCode: r.bookingCode, businessId: r.business.id },
    });
    if (!booking) continue;
    await prisma.review.create({
      data: {
        businessId: r.business.id,
        bookingId: booking.id,
        customerName: r.customerName,
        rating: r.rating,
        comment: r.comment,
        businessReply: r.rating <= 3 ? 'ممنون از نظر شما، حتما بهبود ایجاد می‌کنیم.' : null,
      },
    });
  }

  console.log('Seed completed successfully!');
  console.log(`Categories: ${categories.length}, Cities: ${cities.length}`);
  console.log('Businesses: 2, Staff: 4, Services: 7, Bookings: 12, Reviews: 10');
  console.log('Admin login: 09120000000 / 12345678');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
