'use client';

import { useState, useEffect, useRef } from 'react';
import { SajuResult } from '@/lib/saju/engine';
import { LocaleData, Locale } from '@/lib/i18n';
import SajuPillars from './SajuPillars';
import { captureElementToPDF } from '@/lib/pdf/generator';

interface Props {
  saju: SajuResult;
  t: LocaleData;
  locale: Locale;
  onDownloadPDF?: () => void;
}

const fortuneIcons: Record<string, string> = {
  total: '☯', health: '❤', love: '💕', marriage: '💍',
  business: '🏆', career: '🎯', work: '💼', wealth: '💰',
};

const fortuneColors: Record<string, string> = {
  total: '#C9A84C',
  health: '#E74C3C',
  love: '#FF6B9D',
  marriage: '#C9A84C',
  business: '#3498DB',
  career: '#9B59B6',
  work: '#1ABC9C',
  wealth: '#F39C12',
};

export default function FortuneResult({ saju, t, locale }: Props) {
  const [interpretations, setInterpretations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'fortune' | 'pillars'>('fortune');
  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  async function handleDownloadPDF() {
    if (!pdfRef.current || pdfLoading) return;
    setPdfLoading(true);
    try {
      await captureElementToPDF(pdfRef.current, `THE-SAJU-${saju.birthDate}.pdf`);
    } catch (e) {
      console.error(e);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setPdfLoading(false);
    }
  }

  useEffect(() => {
    async function fetchInterpretation() {
      try {
        const res = await fetch('/api/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ saju, locale, serviceType: 'full' }),
        });
        const data = await res.json();
        setInterpretations(data.interpretations || {});
      } catch {
        // Use fallback
      } finally {
        setLoading(false);
      }
    }
    fetchInterpretation();
  }, [saju, locale]);

  async function handleShare() {
    const shareData = {
      title: 'THE SAJU — 나의 사주 결과',
      text: `${saju.animal}띠 · ${saju.dayMasterHanja}일간 · THE SAJU에서 나의 사주를 확인했어요!`,
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다!');
    }
  }

  const fortuneKeys = ['total', 'health', 'love', 'marriage', 'business', 'career', 'work', 'wealth'] as const;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border border-saju-border rounded-xl overflow-hidden">
        {(['fortune', 'pillars'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-saju-gold/15 text-saju-gold'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab === 'fortune' ? '✨ 운세 결과' : '☯ 사주팔자'}
          </button>
        ))}
      </div>

      {activeTab === 'pillars' ? (
        <SajuPillars saju={saju} t={t} />
      ) : (
        <>
          {loading ? (
            <div className="text-center py-12 space-y-4">
              <div className="text-4xl animate-spin inline-block">☯</div>
              <div>
                <p className="text-saju-gold font-medium">{t.result.loading}</p>
                <p className="text-gray-500 text-sm mt-1">{t.result.loadingDesc}</p>
              </div>
              <div className="flex justify-center gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-saju-gold/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {fortuneKeys.map((key) => (
                <FortuneCard
                  key={key}
                  icon={fortuneIcons[key]}
                  color={fortuneColors[key]}
                  title={t.result.fortuneTypes[key]}
                  content={interpretations[key] || '분석 중입니다...'}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading || loading}
          className="flex items-center justify-center gap-2 py-3.5 bg-saju-card border border-saju-gold/40 text-saju-gold rounded-xl font-medium hover:bg-saju-gold/10 transition-colors disabled:opacity-50"
        >
          <DownloadIcon className="w-4 h-4" />
          {pdfLoading ? '생성 중...' : t.result.download}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3.5 bg-gradient-gold text-saju-black rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          <ShareIcon className="w-4 h-4" />
          {t.result.share}
        </button>
      </div>

      {/* PDF 전용 캡처 영역 (화면 밖에 렌더, 한글/한자 포함) */}
      <div
        ref={pdfRef}
        data-pdf-capture
        style={{ position: 'fixed', left: '-10000px', top: 0, width: '760px', display: 'block' }}
        className="bg-saju-black p-8 text-white"
      >
        {/* 헤더 */}
        <div className="text-center border-b border-saju-gold/40 pb-5 mb-6">
          <div className="text-3xl font-display font-bold text-saju-gold tracking-widest" style={{ fontFamily: 'serif' }}>THE SAJU</div>
          <div className="text-xs text-saju-gold/60 tracking-widest mt-1">四柱命理 · Traditional Korean Fortune Mapping</div>
          <div className="text-sm text-gray-300 mt-3">
            {saju.birthDate} {saju.calendarType === 'lunar' ? '(음력입력)' : '(양력)'} · {saju.animal}띠 ({saju.animalEn}) · {saju.gender === 'male' ? '남성' : '여성'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            일간: {saju.dayMasterHanja}({saju.dayMasterKor}) · 대표오행 {saju.dayMasterOhaengHanja}({saju.dayMasterOhaeng}) {saju.dayMasterYinYang}
          </div>
        </div>
        {/* 사주팔자 */}
        <div className="mb-8">
          <SajuPillars saju={saju} t={t} />
        </div>
        {/* 운세 해석 */}
        <h3 className="text-saju-gold font-bold text-base mb-3 border-b border-saju-gold/30 pb-2">운세 분석</h3>
        <div className="space-y-3">
          {fortuneKeys.map((key) => (
            <div key={key} className="p-3 rounded-lg bg-saju-card" style={{ borderLeft: `3px solid ${fortuneColors[key]}` }}>
              <div className="font-bold text-sm mb-1" style={{ color: fortuneColors[key] }}>
                {fortuneIcons[key]} {t.result.fortuneTypes[key]}
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">{interpretations[key] || ''}</p>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-gray-600 mt-6 pt-4 border-t border-saju-border">
          THE SAJU · thesaju-boostweb.vercel.app
        </div>
      </div>
    </div>
  );
}

function FortuneCard({ icon, color, title, content }: {
  icon: string; color: string; title: string; content: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = content.length > 100;

  return (
    <div
      className="p-4 rounded-xl border border-saju-border bg-saju-card card-hover cursor-pointer"
      onClick={() => setExpanded(!expanded)}
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm mb-1" style={{ color }}>{title}</h3>
          <p className={`text-gray-300 text-sm leading-relaxed ${!expanded && isLong ? 'line-clamp-2' : ''}`}>
            {content}
          </p>
          {isLong && (
            <span className="text-xs mt-1" style={{ color: `${color}80` }}>
              {expanded ? '접기 ▲' : '더 보기 ▼'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DownloadIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function ShareIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
    </svg>
  );
}
