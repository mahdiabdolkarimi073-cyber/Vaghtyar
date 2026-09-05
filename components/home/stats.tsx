interface StatsProps {
  businessCount: number;
  appointmentCount: number;
  cityCount: number;
  customerCount: number;
}

export function Stats({ businessCount, appointmentCount, cityCount, customerCount }: StatsProps) {
  const stats = [
    { value: `${businessCount.toLocaleString('fa-IR')}+`, label: 'کسب‌وکار فعال' },
    { value: `${appointmentCount.toLocaleString('fa-IR')}+`, label: 'نوبت ثبت شده' },
    { value: `${cityCount.toLocaleString('fa-IR')}+`, label: 'شهر تحت پوشش' },
    { value: `${customerCount.toLocaleString('fa-IR')}+`, label: 'مشتری راضی' },
  ];

  return (
    <section className="w-full border-y border-slate-200 bg-white" aria-label="آمار پلتفرم">
      <ul className="flex w-full items-start px-4 py-8 sm:px-20">
        {stats.map((stat, index) => (
          <li
            key={stat.label}
            className="flex min-w-0 flex-1 items-center"
          >
            <dl className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <dd className="text-[32px] font-extrabold leading-tight text-indigo-500">
                {stat.value}
              </dd>
              <dt className="whitespace-nowrap text-center text-sm font-normal text-slate-600">
                {stat.label}
              </dt>
            </dl>
            {index < stats.length - 1 && (
              <div className="h-16 w-px shrink-0 bg-slate-200" />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
