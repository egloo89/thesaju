'use client';

import { LocaleData, Locale } from '@/lib/i18n';

interface Props {
  service: 1 | 2 | 3;
  t: LocaleData;
  locale: Locale;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ service, t, locale, onClose, onSuccess }: Props) {
  const isDomestic = locale === 'ko';

  const prices = {
    1: t.pricing.service1.price,
    2: t.pricing.service2.price,
    3: t.pricing.service3.price,
  };
  const names = {
    1: t.pricing.service1.name,
    2: t.pricing.service2.name,
    3: t.pricing.service3.name,
  };

  async function handleTossPayment() {
    // TossPayments integration
    alert('토스페이먼츠 결제 연동 준비 중입니다. TOSS_CLIENT_KEY 환경 변수를 설정하세요.');
  }

  async function handleLemonSqueezy() {
    // LemonSqueezy integration
    const checkoutUrls: Record<string, string> = {
      '1': process.env.NEXT_PUBLIC_LS_CHECKOUT_1 || '#',
      '2': process.env.NEXT_PUBLIC_LS_CHECKOUT_2 || '#',
      '3': process.env.NEXT_PUBLIC_LS_CHECKOUT_3 || '#',
    };
    window.open(checkoutUrls[String(service)], '_blank');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-saju-deep border border-saju-border rounded-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">{t.payment.title}</h3>
            <p className="text-saju-gold text-sm mt-0.5">{names[service]} — {prices[service]}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-2xl leading-none">×</button>
        </div>

        <div className="space-y-3">
          {isDomestic ? (
            <>
              <p className="text-gray-400 text-sm">{t.payment.domestic}</p>
              <button
                onClick={handleTossPayment}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <span>💳</span>
                토스페이 / 카드 / 계좌이체
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-400 text-sm">{t.payment.international}</p>
              <button
                onClick={handleLemonSqueezy}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                🍋 Pay with LemonSqueezy
              </button>
              <p className="text-xs text-gray-500 text-center">
                PayPal · Credit Card · LINE Pay · Alipay 지원
              </p>
            </>
          )}
        </div>

        {/* Demo button */}
        <button
          onClick={onSuccess}
          className="w-full py-2.5 border border-saju-gold/30 text-saju-gold/60 text-sm rounded-xl hover:bg-saju-gold/5 transition-colors"
        >
          🔓 데모 모드로 체험하기 (무료)
        </button>

        <p className="text-xs text-gray-600 text-center">
          결제 시 이용약관 및 환불 정책에 동의하는 것으로 간주됩니다
        </p>
      </div>
    </div>
  );
}
