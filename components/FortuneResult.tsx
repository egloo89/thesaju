'use client';

import { useState, useEffect } from 'react';
import { SajuResult } from '@/lib/saju/engine';
import { LocaleData, Locale } from '@/lib/i18n';
import SajuPillars from './SajuPillars';

interface Props {
  saju: SajuResult;
  t: LocaleData;
  locale: Locale;
  onDownloadPDF: () => void;
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

export default function FortuneResult({ saju, t, locale, onDownloadPDF }: Props) {
  const [interpretations, setInterpretations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'fortune' | 'pillars'>('fortune');

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
          onClick={onDownloadPDF}
          className="flex items-center justify-center gap-2 py-3.5 bg-saju-card border border-saju-gold/40 text-saju-gold rounded-xl font-medium hover:bg-saju-gold/10 transition-colors"
        >
          <DownloadIcon className="w-4 h-4" />
          {t.result.download}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3.5 bg-gradient-gold text-saju-black rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          <ShareIcon className="w-4 h-4" />
          {t.result.share}
        </button>
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
