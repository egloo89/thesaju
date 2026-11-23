'use client';

import { useState, useRef, useEffect } from 'react';
import ConsultantHome, { GuideId, GuideGreeting } from '@/components/Consultant';
import { Locale, getLocaleData } from '@/lib/i18n';
import { SajuResult } from '@/lib/saju/engine';
import Logo from '@/components/Logo';
import LanguageSelector from '@/components/LanguageSelector';
import SajuForm, { FormData } from '@/components/SajuForm';
import FortuneResult from '@/components/FortuneResult';
import MonthlyFortune from '@/components/MonthlyFortune';
import PricingSection from '@/components/PricingSection';
import PaymentModal from '@/components/PaymentModal';
import { ProductId, isProductId } from '@/lib/catalog';

type View = 'home' | 'form1' | 'result1' | 'form2' | 'result2' | 'pricing';

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>('ko');
  const [view, setView] = useState<View>('home');
  const [guide, setGuide] = useState<GuideId>('seoha');
  useEffect(() => {
    try { const saved = localStorage.getItem('the-saju-guide'); if (saved === 'yoon' || saved === 'seoha') setGuide(saved); } catch { /* Storage can be disabled in private browsers. */ }
  }, []);
  function chooseGuide(value: GuideId) {
    setGuide(value);
    try { localStorage.setItem('the-saju-guide', value); } catch { /* Selection still works without storage. */ }
  }
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [view]);
  const [loading, setLoading] = useState(false);
  const [saju, setSaju] = useState<SajuResult | null>(null);
  const [selectedService, setSelectedService] = useState<ProductId | null>(null);
  const [edition, setEdition] = useState<ProductId>(1);
  const [paidServices, setPaidServices] = useState<Set<number>>(new Set());
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('payment') !== 'confirmed') return;
    fetch('/api/payments/receipt').then(r => r.json()).then(data => {
      if (!isProductId(data.service)) return;
      setEdition(data.service);
      setPaidServices(new Set(data.service === 3 ? [1, 2, 3] : [data.service]));
      setView(data.service === 2 ? 'form2' : 'form1');
      window.history.replaceState(null, '', '/');
    }).catch(() => {});
  }, []);

  const t = getLocaleData(locale);
  useEffect(() => { document.documentElement.lang = ({ko:'ko',en:'en',ja:'ja',zh:'zh-Hans',tw:'zh-Hant'})[locale]; }, [locale]);

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
      setEdition(selectedService);
      setPaidServices(prev => new Set(Array.from(prev).concat(selectedService)));
      if (selectedService === 1 || selectedService > 3) setView('form1');
      if (selectedService === 2) setView('form2');
      if (selectedService === 3) {
        setPaidServices(new Set([1, 2, 3]));
        setView('form1');
      }
    }
    setSelectedService(null);
  }


  return (
    <div className="saju-app min-h-screen bg-saju-black">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 border-b border-saju-border bg-saju-black/90 backdrop-blur-md safe-top">
        <div className="app-header mx-auto flex items-center justify-between px-5 py-4">
          <button onClick={() => setView('home')}>
            <Logo size="sm" showSubtitle={false} />
          </button>
          <LanguageSelector locale={locale} onChange={handleLocaleChange} />
        </div>
      </nav>

      <main className={`app-main mx-auto px-5 pb-28 ${view === 'home' ? 'is-home' : ''}`}>
        {/* HOME */}
        {view === 'home' && (
          <ConsultantHome locale={locale} guide={guide} onGuide={chooseGuide} onStart={() => setSelectedService(1)} onMonthly={() => setSelectedService(2)} onLifetime={() => setSelectedService(3)} onProduct={setSelectedService} t={t} />
        )}
        {/* PRICING */}
        {view === 'pricing' && (
          <div>
            <button onClick={() => setView('home')} className="mt-4 text-saju-gold/60 text-sm flex items-center gap-1 hover:text-saju-gold">
              ← {t.common.back}
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
              <GuideGreeting guide={guide} locale={locale} />
              <h1 className="view-title">{t.form.title}</h1>
              <p className="text-gray-500 text-sm mb-5 text-center">{t.form.subtitle}</p>
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
              ← {t.common.reenter}
            </button>
            <div className="result-shell">
              <GuideGreeting guide={guide} locale={locale} />
              <h1 className="view-title">{t.result.title}</h1>
              <FortuneResult
                saju={saju}
                t={t}
                locale={locale}
                guide={guide}
                edition={edition}
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
              <GuideGreeting guide={guide} locale={locale} />
              <h1 className="view-title">{t.monthly.title}</h1>
              <p className="text-gray-500 text-sm mb-5 text-center">{t.form.subtitleMonthly}</p>
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
              ← {t.common.reenter}
            </button>
            <div className="rounded-2xl border border-saju-border bg-saju-card p-5">
              <h1 className="view-title">{t.monthly.title}</h1>
              <MonthlyFortune saju={saju} t={t} locale={locale} guide={guide} />
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-dock fixed bottom-0 left-0 right-0 z-30 border-t border-saju-border bg-saju-black/95 backdrop-blur-md safe-bottom">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-0">
          {[
            { icon: '🏠', label: t.nav.home, target: 'home' as View },
            { icon: '☯', label: t.nav.saju, target: 'pricing' as View },
            { icon: '📅', label: t.nav.monthly, target: 'form2' as View },
            { icon: '∞', label: t.nav.lifetime, target: 'pricing' as View },
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
