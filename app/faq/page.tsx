import type { Metadata } from 'next';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { HelpCircle, Calendar, Store, CreditCard, Bell, Search } from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nobetyar.ir';

export const metadata: Metadata = {
  title: 'سوالات متداول',
  description: 'پاسخ به پرسش‌های پرتکرار درباره رزرو نوبت، ثبت کسب‌وکار، پرداخت و امکانات نوبت‌یار.',
  alternates: { canonical: `${SITE_URL}/faq` },
};

const FAQ_SECTIONS = [
  {
    icon: Calendar,
    title: 'رزرو نوبت',
    items: [
      {
        q: 'چگونه می‌توانم نوبت رزرو کنم؟',
        a: 'در صفحه جستجو، کسب‌وکار مورد نظر خود را پیدا کنید، روی آن کلیک کنید، خدمت و زمان مناسب را انتخاب کرده و اطلاعات خود را وارد کنید. در کمتر از یک دقیقه نوبت شما ثبت می‌شود.',
      },
      {
        q: 'آیا برای رزرو نوبت نیاز به ثبت‌نام دارم؟',
        a: 'خیر، می‌توانید به‌صورت مهمان نیز نوبت رزرو کنید. اما با ثبت‌نام می‌توانید نوبت‌های خود را مدیریت کنید و از یادآوری‌های پیامکی بهره‌مند شوید.',
      },
      {
        q: 'چگونه می‌توانم نوبت خود را لغو کنم؟',
        a: 'با استفاده از کد پیگیری که پس از رزرو دریافت می‌کنید، می‌توانید نوبت خود را پیدا کرده و لغو کنید. لغو باید حداقل ۲ ساعت قبل از زمان نوبت انجام شود.',
      },
      {
        q: 'آیا رزرو نوبت هزینه‌ای دارد؟',
        a: 'خیر، استفاده از پلتفرم نوبت‌یار برای مشتریان کاملاً رایگان است. شما تنها هزینه خدمت دریافت‌شده را به کسب‌وکار پرداخت می‌کنید.',
      },
      {
        q: 'چگونه می‌توانم زمان نوبت خود را تغییر دهم؟',
        a: 'در حال حاضر باید نوبت فعلی را لغو کنید و نوبت جدیدی رزرو کنید. این امکان در نسخه‌های بعدی اضافه خواهد شد.',
      },
    ],
  },
  {
    icon: Store,
    title: 'ثبت کسب‌وکار',
    items: [
      {
        q: 'چگونه می‌توانم کسب‌وکار خود را ثبت کنم؟',
        a: 'روی دکمه «ثبت‌نام کسب‌وکار» کلیک کنید، حساب کاربری ایجاد کنید و اطلاعات کسب‌وکار خود را وارد کنید. پس از تأیید توسط تیم نوبت‌یار، کسب‌وکار شما در پلتفرم نمایش داده می‌شود.',
      },
      {
        q: 'چقدر طول می‌کشد تا کسب‌وکارم تأیید شود؟',
        a: 'معمولاً ظرف ۲۴ ساعت کسب‌وکار شما بررسی و تأیید می‌شود. در صورت نیاز به اطلاعات بیشتر، با شما تماس می‌گیریم.',
      },
      {
        q: 'چه اطلاعاتی برای ثبت کسب‌وکار نیاز است؟',
        a: 'نام کسب‌وکار، دسته‌بندی، شهر، محله، آدرس، تلفن و ساعات کاری. می‌توانید بعداً خدمات، کارکنان و تصاویر را اضافه کنید.',
      },
      {
        q: 'آیا می‌توانم اطلاعات کسب‌وکارم را بعداً تغییر دهم؟',
        a: 'بله، از پنل کسب‌وکار می‌توانید تمام اطلاعات را ویرایش کنید: خدمات، کارکنان، ساعات کاری، تصاویر و توضیحات.',
      },
    ],
  },
  {
    icon: CreditCard,
    title: 'اشتراک و پرداخت',
    items: [
      {
        q: 'پلن رایگان چه امکاناتی دارد؟',
        a: 'پلن رایگان شامل ثبت کسب‌وکار، خدمات نامحدود، مدیریت نوبت و نمایش در جستجو است. امکانات پیشرفته مانند یادآوری پیامکی و گزارش درآمد در پلن‌های پولی موجود است.',
      },
      {
        q: 'چگونه می‌توانم پلن خود را ارتقا دهم؟',
        a: 'از پنل کسب‌وکار به بخش «اشتراک» بروید، پلن مورد نظر را انتخاب کنید و پرداخت را انجام دهید. اشتراک شما بلافاصله فعال می‌شود.',
      },
      {
        q: 'آیا پرداخت امن است؟',
        a: 'بله، پرداخت‌ها از طریق درگاه‌های بانکی معتبر انجام می‌شوند و اطلاعات کارت شما نزد ما ذخیره نمی‌شود.',
      },
      {
        q: 'اگر اشتراکم منقضی شود چه می‌شود؟',
        a: 'کسب‌وکار شما همچنان در پلتفرم می‌ماند ولی امکانات پولی غیرفعال می‌شوند. می‌توانید هر زمان اشتراک را تمدید کنید.',
      },
    ],
  },
  {
    icon: Bell,
    title: 'پیامک و اعلان‌ها',
    items: [
      {
        q: 'آیا یادآوری پیامکی دریافت می‌کنم؟',
        a: 'بله، اگر کسب‌وکار این امکان را فعال کرده باشد، قبل از زمان نوبت پیام یادآوری دریافت می‌کنید.',
      },
      {
        q: 'چگونه می‌توانم پیامک‌ها را غیرفعال کنم؟',
        a: 'پیامک‌های تأیید و یادآوری نوبت ضروری هستند و غیرفعال نمی‌شوند. پیامک‌های تبلیغاتی را می‌توانید از تنظیمات غیرفعال کنید.',
      },
    ],
  },
  {
    icon: Search,
    title: 'جستجو و کشف',
    items: [
      {
        q: 'چگونه می‌توانم کسب‌وکار نزدیک خود را پیدا کنم؟',
        a: 'در صفحه جستجو، شهر و محله خود را انتخاب کنید و فیلترها را اعمال کنید. می‌توانید بر اساس دسته‌بندی، امتیاز، قیمت و وضعیت باز/بسته فیلتر کنید.',
      },
      {
        q: 'آیا می‌توانم نظرات دیگران را بخوانم؟',
        a: 'بله، در صفحه هر کسب‌وکار بخش نظرات وجود دارد. می‌توانید تجربه دیگران را بخوانید و خودتان نیز نظر بدهید.',
      },
    ],
  },
];

export default function FaqPage() {
  const allFaqs = FAQ_SECTIONS.flatMap((s) =>
    s.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    }))
  );

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs,
  };

  return (
    <div className="container mx-auto px-4 max-w-3xl py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-3">سوالات متداول</h1>
        <p className="text-text-secondary">پاسخ به پرسش‌های پرتکرار درباره نوبت‌یار</p>
      </div>

      <div className="space-y-8">
        {FAQ_SECTIONS.map((section, si) => (
          <div key={si}>
            <div className="flex items-center gap-2 mb-4">
              <section.icon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-text-primary">{section.title}</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {section.items.map((item, ii) => (
                <AccordionItem
                  key={`${si}-${ii}`}
                  value={`${si}-${ii}`}
                  className="bg-surface rounded-xl border border-border px-5"
                >
                  <AccordionTrigger className="text-right font-medium text-text-primary hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-text-secondary leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center bg-surface rounded-2xl border border-border p-8">
        <h2 className="text-xl font-bold text-text-primary mb-3">پاسخ خود را پیدا نکردید؟</h2>
        <p className="text-text-secondary mb-6">تیم پشتیبانی ما آماده پاسخ‌گویی به سوالات شماست.</p>
        <Link href="/contact">
          <Button className="bg-primary hover:bg-primary-dark text-white">تماس با ما</Button>
        </Link>
      </div>
    </div>
  );
}