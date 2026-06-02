'use client';

import { useState, useRef } from 'react';
import { Locale, getLocaleData } from '@/lib/i18n';
import { SajuResult } from '@/lib/saju/engine';
import Logo from '@/components/Logo';
import LanguageSelector from '@/components/LanguageSelector';
import SajuForm, { FormData } from '@/components/SajuForm';
import FortuneResult from '@/components/FortuneResult';
import MonthlyFortune from '@/components/MonthlyFortune';
import PricingSection from '@/components/PricingSection';
import PaymentModal from '@/components/PaymentModal';

type View = 'home' | 'form1' | 'result1' | 'form2' | 'result2' | 'pricing';

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>('ko');
  const [view, setView] = useState<View>('home');
  const [loading, setLoading] = useState(false);
  const [saju, setSaju] = useState<SajuResult | null>(null);
  const [selectedService, setSelectedService] = useState<1 | 2 | 3 | null>(null);
  const [paidServices, setPaidServices] = useState<Set<number>>(new Set());
  const resultRef = useRef<HTMLDivElement>(null);

  const t = getLocaleData(locale);

  function handleLocaleChange(l: Locale) {
    setLocale(l);
  }

  function handleSajuResult(result: SajuResult) {
    setSaju(result);
  }

  function handleSelectService(s: 1 | 2 | 3) {
    setSelectedService(s);
  }

  function handlePaymentSuccess() {
    if (selectedService) {
      setPaidServices(prev => new Set(Array.from(prev).concat(selectedService)));
      if (selectedService === 1) setView('form1');
      if (selectedService === 2) setView('form2');
      if (selectedService === 3) {
        setPaidServices(new Set([1, 2, 3]));
        setView('form1');
      }
    }
    setSelectedService(null);
  }


  return (
    <div className="min-h-screen bg-saju-black bg-particles">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 border-b border-saju-border bg-saju-black/90 backdrop-blur-md safe-top">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => setView('home')}>
            <Logo size="sm" showSubtitle={false} />
          </button>
          <LanguageSelector locale={locale} onChange={handleLocaleChange} />
        </div>
      </nav>

      <main className="max-w-md mx-auto px-4 pb-24">
        {/* HOME */}
        {view === 'home' && (
          <div className="space-y-0">
            {/* Hero */}
            <section className="py-12 text-center space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-saju-gold/30 bg-saju-gold/5 text-saju-gold text-xs font-medium">
                ✦ {t.hero.badge}
              </div>

              <div className="animate-float">
                <Logo size="xl" showSubtitle={true} subtitle={t.nav.subtitle} />
              </div>

              <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line font-light">
                {t.hero.subtitle}
              </p>
              <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">
                {t.hero.desc}
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => setView('pricing')}
                  className="w-full py-4 bg-gradient-gold text-saju-black font-bold text-lg rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-gold-lg animate-glow"
                >
                  {t.hero.cta}
                </button>
                <p className="text-gray-600 text-sm">{t.hero.ctaSub}</p>
              </div>
            </section>

            {/* What is SAJU */}
            <section className="py-10">
              <div className="rounded-2xl border border-saju-border bg-saju-card p-6 space-y-5">
                <div className="text-center">
                  <div className="text-4xl mb-3">☯</div>
                  <h2 className="text-xl font-display font-semibold text-saju-gold">{t.whatIsSaju.title}</h2>
                  <p className="text-saju-gold/60 text-sm mt-1">{t.whatIsSaju.subtitle}</p>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed">{t.whatIsSaju.desc}</p>

                <div className="grid grid-cols-2 gap-3">
                  {t.whatIsSaju.pillars.map((pillar, i) => (
                    <div key={i} className="rounded-xl border border-saju-border bg-saju-deep p-3 text-center">
                      <div className="text-saju-gold font-serif text-lg mb-1">
                        {['年', '月', '日', '時'][i]}
                      </div>
                      <div className="text-white text-sm font-medium">{pillar}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{t.whatIsSaju.pillarDesc[i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Quick service preview */}
            <section className="py-6 space-y-3">
              {[
                { icon: '☯', title: t.pricing.service1.name, price: t.pricing.service1.price, desc: t.pricing.service1.desc.slice(0, 60) + '...', svc: 1 as const },
                { icon: '📅', title: t.pricing.service2.name, price: t.pricing.service2.price, desc: t.pricing.service2.desc.slice(0, 60) + '...', svc: 2 as const },
                { icon: '∞', title: t.pricing.service3.name, price: t.pricing.service3.price, desc: t.pricing.service3.desc.slice(0, 60) + '...', svc: 3 as const },
              ].map((item) => (
                <button
                  key={item.svc}
                  onClick={() => { setView('pricing'); }}
                  className="w-full text-left p-4 rounded-xl border border-saju-border bg-saju-card hover:border-saju-gold/40 transition-colors card-hover"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-sm">{item.title}</span>
                        <span className="text-saju-gold font-bold text-sm">{item.price}</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">{item.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </section>

            {/* Testimonials / Stats */}
            <section className="py-6">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { num: '5,000년', label: '동양 철학의 역사' },
                  { num: '8가지', label: '운세 분야 분석' },
                  { num: '5개', label: '언어 지원' },
                ].map((s, i) => (
                  <div key={i} className="text-center p-3 rounded-xl border border-saju-border bg-saju-card">
                    <div className="text-saju-gold font-bold text-lg">{s.num}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* PRICING */}
        {view === 'pricing' && (
          <div>
            <button onClick={() => setView('home')} className="mt-4 text-saju-gold/60 text-sm flex items-center gap-1 hover:text-saju-gold">
              ← 돌아가기
            </button>
            <PricingSection t={t} locale={locale} onSelectService={handleSelectService} />
          </div>
        )}

        {/* FORM - Service 1 */}
        {view === 'form1' && (
          <div className="py-6">
            <button onClick={() => setView('pricing')} className="text-saju-gold/60 text-sm flex items-center gap-1 hover:text-saju-gold mb-6">
              ← {t.pricing.service1.name}
            </button>
            <div className="rounded-2xl border border-saju-border bg-saju-card p-5">
              <h2 className="text-lg font-bold text-saju-gold mb-1">{t.form.title}</h2>
              <p className="text-gray-500 text-sm mb-5">정확한 사주 분석을 위해 생년월일시를 입력해주세요</p>
              <SajuForm
                t={t}
                onResult={(result) => {
                  handleSajuResult(result);
                  setView('result1');
                }}
                onLoading={setLoading}
              />
            </div>
            {loading && <LoadingOverlay t={t} />}
          </div>
        )}

        {/* RESULT - Service 1 */}
        {view === 'result1' && saju && (
          <div className="py-6" ref={resultRef}>
            <button onClick={() => setView('form1')} className="text-saju-gold/60 text-sm flex items-center gap-1 hover:text-saju-gold mb-4">
              ← 다시 입력하기
            </button>
            <div className="rounded-2xl border border-saju-border bg-saju-card p-5">
              <h2 className="text-lg font-bold text-saju-gold mb-4">{t.result.title}</h2>
              <FortuneResult
                saju={saju}
                t={t}
                locale={locale}
              />
            </div>
          </div>
        )}

        {/* FORM - Service 2 */}
        {view === 'form2' && (
          <div className="py-6">
            <button onClick={() => setView('pricing')} className="text-saju-gold/60 text-sm flex items-center gap-1 hover:text-saju-gold mb-6">
              ← {t.pricing.service2.name}
            </button>
            <div className="rounded-2xl border border-saju-border bg-saju-card p-5">
              <h2 className="text-lg font-bold text-saju-gold mb-1">{t.monthly.title}</h2>
              <p className="text-gray-500 text-sm mb-5">먼저 생년월일시를 입력해주세요</p>
              <SajuForm
                t={t}
                onResult={(result) => {
                  handleSajuResult(result);
                  setView('result2');
                }}
                onLoading={setLoading}
              />
            </div>
            {loading && <LoadingOverlay t={t} />}
          </div>
        )}

        {/* RESULT - Service 2 */}
        {view === 'result2' && saju && (
          <div className="py-6">
            <button onClick={() => setView('form2')} className="text-saju-gold/60 text-sm flex items-center gap-1 hover:text-saju-gold mb-4">
              ← 다시 입력하기
            </button>
            <div className="rounded-2xl border border-saju-border bg-saju-card p-5">
              <h2 className="text-lg font-bold text-saju-gold mb-4">{t.monthly.title}</h2>
              <MonthlyFortune saju={saju} t={t} locale={locale} />
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-saju-border bg-saju-black/95 backdrop-blur-md safe-bottom">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-0">
          {[
            { icon: '🏠', label: '홈', target: 'home' as View },
            { icon: '☯', label: '사주', target: 'pricing' as View },
            { icon: '📅', label: '월운', target: 'form2' as View },
            { icon: '∞', label: '평생권', target: 'pricing' as View },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.target === 'form2' && !paidServices.has(2) && !paidServices.has(3)) {
                  setSelectedService(2);
                } else {
                  setView(item.target);
                }
              }}
              className={`flex flex-col items-center justify-center py-2.5 text-xs transition-colors ${
                view === item.target ? 'text-saju-gold' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="mt-0.5">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Payment Modal */}
      {selectedService && (
        <PaymentModal
          service={selectedService}
          t={t}
          locale={locale}
          onClose={() => setSelectedService(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

function LoadingOverlay({ t }: { t: ReturnType<typeof getLocaleData> }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-saju-black/80 backdrop-blur-sm">
      <div className="text-center space-y-4 p-8">
        <div className="text-5xl animate-spin">☯</div>
        <p className="text-saju-gold font-medium">{t.result.loading}</p>
        <p className="text-gray-500 text-sm">{t.result.loadingDesc}</p>
      </div>
    </div>
  );
}
