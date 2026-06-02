'use client';

import { LocaleData, Locale } from '@/lib/i18n';

interface Props {
  t: LocaleData;
  locale: Locale;
  onSelectService: (service: 1 | 2 | 3) => void;
}

const serviceGradients = [
  'from-saju-gold/20 to-saju-gold/5',
  'from-blue-500/20 to-blue-500/5',
  'from-purple-500/20 to-purple-500/5',
];
const serviceBorders = [
  'border-saju-gold/40',
  'border-blue-500/40',
  'border-purple-500/40',
];
const serviceBadgeColors = [
  'bg-saju-gold/20 text-saju-gold border-saju-gold/30',
  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'bg-purple-500/20 text-purple-400 border-purple-500/30',
];
const serviceAccents = ['text-saju-gold', 'text-blue-400', 'text-purple-400'];
const serviceCTAColors = [
  'bg-gradient-gold text-saju-black',
  'bg-blue-600 text-white hover:bg-blue-500',
  'bg-gradient-to-r from-purple-600 to-purple-500 text-white',
];

export default function PricingSection({ t, locale, onSelectService }: Props) {
  const services = [
    { num: 1 as const, data: t.pricing.service1, extra: null },
    { num: 2 as const, data: t.pricing.service2, extra: (t.pricing.service2 as any).priceMonthly },
    { num: 3 as const, data: t.pricing.service3, extra: null },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-display font-semibold text-saju-gold mb-2">{t.pricing.title}</h2>
          <p className="text-gray-400">{t.pricing.subtitle}</p>
        </div>

        <div className="space-y-4">
          {services.map((svc, i) => (
            <div
              key={svc.num}
              className={`relative rounded-2xl border bg-gradient-to-br p-5 ${serviceGradients[i]} ${serviceBorders[i]} card-hover`}
            >
              {/* Badge */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className={`text-lg font-bold ${serviceAccents[i]}`}>{svc.data.name}</h3>
                  <div className={`inline-flex mt-1 text-xs px-2.5 py-0.5 rounded-full border font-medium ${serviceBadgeColors[i]}`}>
                    {svc.data.badge}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${serviceAccents[i]}`}>{svc.data.price}</div>
                  {svc.extra && (
                    <div className="text-xs text-gray-500 mt-0.5">{svc.extra}</div>
                  )}
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 leading-relaxed">{svc.data.desc}</p>

              <ul className="space-y-1.5 mb-5">
                {svc.data.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className={`flex-shrink-0 mt-0.5 ${serviceAccents[i]}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelectService(svc.num)}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 ${serviceCTAColors[i]}`}
              >
                {svc.data.cta}
              </button>

              {svc.num === 2 && (svc.data as any).ctaSub && (
                <button
                  onClick={() => onSelectService(svc.num)}
                  className="w-full mt-2 py-2.5 rounded-xl font-medium text-sm border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors"
                >
                  {(svc.data as any).ctaSub}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
