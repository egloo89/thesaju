'use client';

import { LocaleData, Locale } from '@/lib/i18n';
import { guideCopy } from './Consultant';

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
    <section className="py-12">
      <div className="mx-auto">
        <div className="text-center mb-10">
          <h1 className="view-title">{t.pricing.title}</h1>
          <p className="text-gray-400">{t.pricing.subtitle}</p>
        </div>

        <div className="pricing-grid">
          {services.map((svc, i) => (
            <div
              key={svc.num}
              className="price-card"
            >
              {/* Badge */}
              <div className="space-y-5">
                <div>
                  <h3>{svc.data.name}</h3>
                  <div className={`inline-flex mt-1 text-xs px-2.5 py-0.5 rounded-full border font-medium ${serviceBadgeColors[i]}`}>
                    {svc.data.badge}
                  </div>
                </div>
                <div>
                  <div className="price-amount">{svc.data.price}</div>
                  <div className="text-xs text-gray-400 mt-2">{locale === 'ko' ? (svc.num === 2 ? '1개월 · 자동 갱신 없음' : '일회성 결제') : ({ en: 'One-time payment', ja: '一回払い', zh: '一次性付款', tw: '一次性付款' }[locale])}</div>
                </div>
              </div>

              <details><summary>{guideCopy(locale).detail}</summary><p className="mt-3">{svc.data.desc}</p></details>

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
                className="primary-action"
              >
                {svc.data.cta}
              </button>

              {svc.num === 2 && <p className="text-xs text-gray-400 leading-relaxed">{locale === 'ko' ? '월 10,000원 구독은 준비 중입니다. 현재는 1개월 단건 상품만 체험할 수 있습니다.' : ({ en:'Monthly subscription coming soon. This is a one-month purchase.', ja:'月額プランは準備中です。現在は1か月の一回払いです。', zh:'月度订阅即将推出。目前为一个月的一次性购买。', tw:'月度訂閱即將推出。目前為一個月的一次性購買。' }[locale])}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
