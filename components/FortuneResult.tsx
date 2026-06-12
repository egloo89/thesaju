'use client';

import { useState, useEffect, useRef } from 'react';
import { SajuResult } from '@/lib/saju/engine';
import { buildSajuProfile, SajuProfile, buildDaewunAnalysis, DaewunPhase, buildLuckGuide, LuckGuide } from '@/lib/saju/profile';
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
  total: '☯', personality: '🧭', health: '❤', love: '💕', marriage: '💍',
  business: '🏆', career: '🎯', work: '💼', wealth: '💰',
  study: '📚', relationship: '🤝', moving: '✈', children: '👶',
  earlyLife: '🌱', youth: '🌿', middleAge: '🌳', latterLife: '🌅',
};

const fortuneColors: Record<string, string> = {
  total: '#C9A84C', personality: '#8B5CF6', health: '#E74C3C', love: '#FF6B9D',
  marriage: '#C9A84C', business: '#3498DB', career: '#9B59B6', work: '#1ABC9C',
  wealth: '#F39C12', study: '#16A085', relationship: '#E67E22', moving: '#5DADE2',
  children: '#F1948A', earlyLife: '#52BE80', youth: '#27AE60', middleAge: '#1E8449', latterLife: '#D4A017',
};

// 주제별 운세 출력 순서
const FORTUNE_ORDER = [
  'total', 'personality', 'wealth', 'business', 'career', 'work',
  'study', 'love', 'marriage', 'relationship', 'health',
  'moving', 'children',
] as const;

// 인생 시기별 운세
const LIFE_STAGE_ORDER = ['earlyLife', 'youth', 'middleAge', 'latterLife'] as const;

const OHAENG_COLORS_MAP: Record<string, string> = {
  '목': '#2D6A4F', '화': '#C0392B', '토': '#D4A017', '금': '#95A5A6', '수': '#1A3A5C',
};

export default function FortuneResult({ saju, t, locale }: Props) {
  const [interpretations, setInterpretations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'fortune' | 'pillars'>('fortune');
  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const profile = buildSajuProfile(saju);
  const daewunPhases = buildDaewunAnalysis(saju);
  const luckGuide = buildLuckGuide(saju);

  async function handleDownloadPDF() {
    if (!pdfRef.current || pdfLoading) return;
    setPdfLoading(true);
    try {
      await captureElementToPDF(pdfRef.current, `THE-SAJU-${saju.birthDate}-FULL.pdf`);
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
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchInterpretation();
  }, [saju, locale]);

  async function handleShare() {
    const animalName = locale === 'ko' ? saju.animal : saju.animalEn;
    const shareData = {
      title: t.result.labels.shareTitle,
      text: t.result.labels.shareText.replace('{animal}', animalName).replace('{hanja}', saju.dayMasterHanja),
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert(t.result.labels.linkCopied);
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border border-saju-border rounded-xl overflow-hidden">
        {(['fortune', 'pillars'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-saju-gold/15 text-saju-gold' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab === 'fortune' ? t.result.labels.tabFortune : t.result.labels.tabPillars}
          </button>
        ))}
      </div>

      {activeTab === 'pillars' ? (
        <SajuPillars saju={saju} t={t} />
      ) : loading ? (
        <div className="text-center py-12 space-y-4">
          <div className="text-4xl animate-spin inline-block">☯</div>
          <div>
            <p className="text-saju-gold font-medium">{t.result.loading}</p>
            <p className="text-gray-500 text-sm mt-1">{t.result.loadingDesc}</p>
          </div>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 bg-saju-gold/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      ) : (
        // 블로그 포스팅 형식의 종합 리포트 (목차 + 챕터 구조)
        <div className="space-y-8">
          {/* 목차 */}
          <nav className="rounded-xl border border-saju-gold/30 bg-saju-deep/60 p-5">
            <div className="text-saju-gold font-bold text-base mb-3">📑 {t.result.tocTitle}</div>
            <ol className="space-y-2">
              {[
                { id: 'ch1', no: 'Ⅰ', title: t.result.profile.title, icon: '🍀' },
                { id: 'ch2', no: 'Ⅱ', title: t.result.luckGuide.title, icon: '🧿' },
                { id: 'ch3', no: 'Ⅲ', title: t.result.ohaeng, icon: '📊' },
                { id: 'ch4', no: 'Ⅳ', title: t.result.fortuneSection, icon: '🔮' },
                { id: 'ch5', no: 'Ⅴ', title: t.result.lifeStage, icon: '🌳' },
                { id: 'ch6', no: 'Ⅵ', title: t.result.daewunAnalysis, icon: '🔄' },
              ].map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="flex items-center gap-2 text-[15px] text-gray-300 hover:text-saju-gold transition-colors">
                    <span className="text-saju-gold/70 font-serif w-5">{item.no}.</span>
                    <span>{item.icon}</span>
                    <span>{item.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Ⅰ. 행운 가이드 */}
          <section id="ch1" className="scroll-mt-20 space-y-4">
            <ChapterHeading no="Ⅰ" icon="🍀" title={t.result.profile.title} />
            <ProfileSection profile={profile} t={t} pdf />
          </section>

          {/* Ⅱ. 길흉 가이드 */}
          <section id="ch2" className="scroll-mt-20 space-y-4">
            <ChapterHeading no="Ⅱ" icon="🧿" title={t.result.luckGuide.title} />
            <LuckGuideSection guide={luckGuide} t={t} pdf />
          </section>

          {/* Ⅲ. 오행 균형 그래프 */}
          <section id="ch3" className="scroll-mt-20 space-y-4">
            <ChapterHeading no="Ⅲ" icon="📊" title={t.result.ohaeng} />
            <OhaengChart saju={saju} t={t} pdf />
          </section>

          {/* Ⅳ. 종합 운세 분석 */}
          <section id="ch4" className="scroll-mt-20 space-y-4">
            <ChapterHeading no="Ⅳ" icon="🔮" title={t.result.fortuneSection} />
            <div className="space-y-5">
              {FORTUNE_ORDER.map((key) => (
                <article key={key} className="rounded-xl border border-saju-border bg-saju-card p-5" style={{ borderLeft: `4px solid ${fortuneColors[key]}` }}>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: fortuneColors[key] }}>
                    <span>{fortuneIcons[key]}</span>
                    {(t.result.fortuneTypes as any)[key] || key}
                  </h3>
                  <p className="text-gray-200 text-[15px] leading-7 whitespace-pre-line">
                    {interpretations[key] || t.result.labels.analyzing}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Ⅴ. 인생 시기별 운세 */}
          <section id="ch5" className="scroll-mt-20 space-y-4">
            <ChapterHeading no="Ⅴ" icon="🌳" title={t.result.lifeStage} />
            <div className="space-y-5">
              {LIFE_STAGE_ORDER.map((key) => (
                <article key={key} className="rounded-xl border border-saju-border bg-saju-card p-5" style={{ borderLeft: `4px solid ${fortuneColors[key]}` }}>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: fortuneColors[key] }}>
                    <span>{fortuneIcons[key]}</span>
                    {(t.result.fortuneTypes as any)[key] || key}
                  </h3>
                  <p className="text-gray-200 text-[15px] leading-7 whitespace-pre-line">
                    {interpretations[key] || t.result.labels.analyzing}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Ⅵ. 10년 대운 흐름 & 전환기 전략 */}
          <section id="ch6" className="scroll-mt-20 space-y-4">
            <ChapterHeading no="Ⅵ" icon="🔄" title={t.result.daewunAnalysis} />
            <DaewunAnalysis phases={daewunPhases} t={t} pdf />
          </section>
        </div>
      )}

      {/* 하단 액션: PDF 다운로드 + 공유 */}
      <div className="pt-2 space-y-3">
        <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading || loading}
          className="w-full flex flex-col items-center justify-center py-3 px-4 bg-gradient-gold text-saju-black rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 leading-tight"
        >
          <span className="flex items-center gap-2 text-sm">
            <DownloadIcon className="w-4 h-4 flex-shrink-0" />
            {pdfLoading ? t.result.labels.generating : t.result.download}
          </span>
          {!pdfLoading && (
            <span className="text-[10px] font-semibold tracking-widest mt-0.5 opacity-80">FULL VER.</span>
          )}
        </button>
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-saju-card border border-saju-border text-gray-300 rounded-xl font-medium hover:border-saju-gold/40 transition-colors"
        >
          <ShareIcon className="w-4 h-4" />
          {t.result.share}
        </button>
      </div>

      {/* PDF 전용 캡처 영역 (화면 밖, 한글/한자 포함, 10페이지+ 종합 리포트) */}
      <div
        ref={pdfRef}
        data-pdf-capture
        style={{ position: 'fixed', left: '-10000px', top: 0, width: '760px', display: 'block' }}
        className="bg-saju-black p-10 text-white"
      >
        {/* 표지 헤더 */}
        <div data-pdf-block className="text-center border-b-2 border-saju-gold/50 pb-6 mb-7">
          <div className="text-4xl font-bold text-saju-gold tracking-[0.2em]" style={{ fontFamily: 'serif' }}>THE SAJU</div>
          <div className="text-xs text-saju-gold/60 tracking-[0.3em] mt-2">四柱命理 · TRADITIONAL KOREAN FORTUNE REPORT</div>
          <div className="text-base text-gray-200 mt-5 font-medium">{t.result.labels.pdfTitle}</div>
          <div className="text-sm text-gray-300 mt-3">
            {saju.birthDate} ({saju.calendarType === 'lunar' ? t.result.labels.calLunar : t.result.labels.calSolar}) · {locale === 'ko' ? `${saju.animal}띠 (${saju.animalEn})` : saju.animalEn} · {saju.gender === 'male' ? t.result.labels.male : t.result.labels.female}
          </div>
          <div className="text-sm text-saju-gold/80 mt-1">
            {t.result.labels.ilgan} {saju.dayMasterHanja}{locale === 'ko' ? `(${saju.dayMasterKor})` : ''} · {t.result.labels.repElement} {saju.dayMasterOhaengHanja}{locale === 'en' ? ` (${saju.dayMasterOhaengEn})` : ''} {locale === 'ko' ? saju.dayMasterYinYang : ''}
          </div>
        </div>

        {/* 1. 사주팔자 명식 (제목+내용 한 블록) */}
        <div data-pdf-block className="mb-8">
          <h2 className="text-saju-gold font-bold text-2xl mb-5 border-b-2 border-saju-gold/30 pb-3">Ⅰ. {t.result.labels.chMyeongsik}</h2>
          <SajuPillars saju={saju} t={t} />
        </div>

        {/* 2. 오행 균형 그래프 */}
        <div data-pdf-block data-pdf-chapter className="mb-8">
          <h2 className="text-saju-gold font-bold text-2xl mb-5 border-b-2 border-saju-gold/30 pb-3">Ⅱ. {t.result.ohaeng}</h2>
          <OhaengChart saju={saju} t={t} pdf />
        </div>

        {/* 3. 행운 가이드 */}
        <div data-pdf-block data-pdf-chapter className="mb-8">
          <h2 className="text-saju-gold font-bold text-2xl mb-5 border-b-2 border-saju-gold/30 pb-3">Ⅲ. {t.result.profile.title}</h2>
          <ProfileSection profile={profile} t={t} pdf />
        </div>

        {/* 4. 길흉 가이드 (제목 블록 + 내부 카드 블록) */}
        <h2 data-pdf-block data-pdf-chapter className="text-saju-gold font-bold text-2xl mb-5 border-b-2 border-saju-gold/30 pb-3">Ⅳ. {t.result.luckGuide.title}</h2>
        <div className="mb-8"><LuckGuideSection guide={luckGuide} t={t} pdf /></div>

        {/* 5. 종합 운세 분석 */}
        <h2 data-pdf-block data-pdf-chapter className="text-saju-gold font-bold text-2xl mb-5 border-b-2 border-saju-gold/30 pb-3">Ⅴ. {t.result.fortuneSection}</h2>
        <div className="space-y-4 mb-8">
          {FORTUNE_ORDER.map((key) => (
            <div data-pdf-block key={key} className="p-4 rounded-lg bg-saju-card" style={{ borderLeft: `3px solid ${fortuneColors[key]}` }}>
              <div className="font-bold text-base mb-2.5" style={{ color: fortuneColors[key] }}>
                {fortuneIcons[key]} {(t.result.fortuneTypes as any)[key] || key}
              </div>
              <p className="text-gray-200 text-sm leading-6 whitespace-pre-line">{interpretations[key] || ''}</p>
            </div>
          ))}
        </div>

        {/* 6. 인생 시기별 운세 */}
        <h2 data-pdf-block data-pdf-chapter className="text-saju-gold font-bold text-2xl mb-5 border-b-2 border-saju-gold/30 pb-3">Ⅵ. {t.result.lifeStage}</h2>
        <div className="space-y-4 mb-8">
          {LIFE_STAGE_ORDER.map((key) => (
            <div data-pdf-block key={key} className="p-4 rounded-lg bg-saju-card" style={{ borderLeft: `3px solid ${fortuneColors[key]}` }}>
              <div className="font-bold text-base mb-2.5" style={{ color: fortuneColors[key] }}>
                {fortuneIcons[key]} {(t.result.fortuneTypes as any)[key] || key}
              </div>
              <p className="text-gray-200 text-sm leading-6 whitespace-pre-line">{interpretations[key] || ''}</p>
            </div>
          ))}
        </div>

        {/* 7. 10년 대운 흐름 & 전환기 전략 */}
        <h2 data-pdf-block data-pdf-chapter className="text-saju-gold font-bold text-2xl mb-5 border-b-2 border-saju-gold/30 pb-3">Ⅶ. {t.result.daewunAnalysis}</h2>
        <div className="mb-4"><DaewunAnalysis phases={daewunPhases} t={t} pdf /></div>

        <div data-pdf-block className="text-center text-xs text-gray-600 mt-8 pt-5 border-t border-saju-border">
          {t.result.labels.footerNote} · THE SAJU · thesaju-boostweb.vercel.app
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ profile, t, pdf }: { profile: SajuProfile; t: LocaleData; pdf?: boolean }) {
  const p = t.result.profile;
  const items = [
    { label: p.luckyColor, value: profile.luckyColors.join(' · '), swatch: profile.luckyColorHex },
    { label: p.luckyDirection, value: profile.luckyDirection },
    { label: p.luckyNumber, value: profile.luckyNumbers.join(', ') },
    { label: p.luckySeason, value: profile.luckySeason },
    { label: p.luckyGem, value: profile.luckyGemstone },
    { label: p.caution, value: profile.cautionBody },
  ];

  return (
    <div className={`rounded-xl border border-saju-gold/30 bg-gradient-to-br from-saju-gold/10 to-saju-purple/10 p-5 ${pdf ? '' : ''}`}>
      {!pdf && <h3 className="text-saju-gold font-bold text-base mb-3">🍀 {p.title}</h3>}
      <div className="grid grid-cols-2 gap-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg bg-saju-deep/60 border border-saju-border p-3">
            <div className="text-xs text-gray-500 mb-1">{it.label}</div>
            <div className="flex items-center gap-1.5">
              {it.swatch && it.swatch.map((c, j) => (
                <span key={j} className="inline-block w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c }} />
              ))}
              <span className="text-sm text-white font-medium">{it.value}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 mt-3">
        <div className="rounded-lg bg-saju-deep/60 border border-saju-border p-3">
          <div className="text-xs text-gray-500 mb-1">{p.jobs}</div>
          <div className="text-sm text-white">{profile.recommendedJobs.join(' · ')}</div>
        </div>
        <div className="rounded-lg bg-saju-deep/60 border border-saju-border p-3">
          <div className="text-xs text-gray-500 mb-1">{p.foods}</div>
          <div className="text-sm text-white">{profile.helpfulFoods.join(' · ')}</div>
        </div>
        <div className="rounded-lg bg-saju-deep/60 border border-saju-border p-3">
          <div className="text-xs text-gray-500 mb-1">{p.personality}</div>
          <div className="text-sm text-white">{profile.personality}</div>
        </div>
        <div className="rounded-lg bg-saju-gold/10 border border-saju-gold/30 p-3">
          <div className="text-xs text-saju-gold/70 mb-1">{p.balance}</div>
          <div className="text-sm text-gray-200 leading-relaxed">{profile.balanceComment}</div>
        </div>
      </div>
    </div>
  );
}

// 블로그형 챕터 대제목 (H2)
function ChapterHeading({ no, icon, title }: { no: string; icon: string; title: string }) {
  return (
    <h2 className="flex items-center gap-2.5 text-xl font-bold text-saju-gold border-b-2 border-saju-gold/30 pb-3">
      <span className="font-serif text-saju-gold/70">{no}.</span>
      <span>{icon}</span>
      <span>{title}</span>
    </h2>
  );
}

// 길흉 가이드 (좋은 것 / 피할 것 + 액운방지·행운강화 비결)
function LuckGuideSection({ guide, t, pdf }: { guide: LuckGuide; t: LocaleData; pdf?: boolean }) {
  const g = t.result.luckGuide;
  const row = (label: string, value: string) => (
    <div className="flex gap-2 text-[13px]">
      <span className="text-gray-500 flex-shrink-0 w-16">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );

  return (
    <div className="space-y-3">
      {!pdf && <h3 className="text-saju-gold font-bold text-base">🧿 {g.title}</h3>}
      <div className="grid grid-cols-1 gap-3">
        {/* 좋은 것 */}
        <div data-pdf-block className="rounded-xl border border-green-600/40 bg-green-900/10 p-4">
          <div className="text-green-400 font-bold text-sm mb-2">✅ {g.favorable}</div>
          <div className="space-y-1.5">
            {row(g.foods, guide.favorable.foods.join(' · '))}
            {row(g.colors, guide.favorable.colors.join(' · '))}
            {row(g.direction, guide.favorable.direction)}
            {row(g.time, guide.favorable.timeOfDay)}
            {row(g.weekday, guide.favorable.weekday)}
            {row(g.activities, guide.favorable.activities.join(' / '))}
          </div>
        </div>
        {/* 피할 것 */}
        <div data-pdf-block className="rounded-xl border border-red-600/40 bg-red-900/10 p-4">
          <div className="text-red-400 font-bold text-sm mb-2">⛔ {g.unfavorable}</div>
          <div className="space-y-1.5">
            {row(g.foods, guide.unfavorable.foods.join(' · '))}
            {row(g.colors, guide.unfavorable.colors.join(' · '))}
            {row(g.direction, guide.unfavorable.direction)}
            {row(g.time, guide.unfavorable.timeOfDay)}
            {row(g.weekday, guide.unfavorable.weekday)}
            {row(g.habits, guide.unfavorable.habits.join(' / '))}
          </div>
        </div>
      </div>
      {/* 액운 방지 비결 */}
      <div data-pdf-block className="rounded-xl border border-saju-purple/40 bg-saju-purple/10 p-4">
        <div className="text-saju-accent-light font-bold text-sm mb-2">🛡 {g.wardOff}</div>
        <ul className="space-y-1.5">
          {guide.wardOffTips.map((tip, i) => (
            <li key={i} className="text-[13px] text-gray-200 leading-6 flex gap-1.5">
              <span className="text-saju-accent-light flex-shrink-0">›</span>{tip}
            </li>
          ))}
        </ul>
      </div>
      {/* 행운 강화 비결 */}
      <div data-pdf-block className="rounded-xl border border-saju-gold/40 bg-saju-gold/10 p-4">
        <div className="text-saju-gold font-bold text-sm mb-2">🍀 {g.boost}</div>
        <ul className="space-y-1.5">
          {guide.boostTips.map((tip, i) => (
            <li key={i} className="text-[13px] text-gray-200 leading-6 flex gap-1.5">
              <span className="text-saju-gold flex-shrink-0">›</span>{tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// 오행 균형 막대 그래프 (SVG)
function OhaengChart({ saju, t, pdf }: { saju: SajuResult; t: LocaleData; pdf?: boolean }) {
  const counts = saju.ohaengCounts;
  const max = Math.max(...counts.map((o) => o.count), 1);
  // TOP 여백을 충분히 확보해 막대가 최대치여도 숫자·별이 잘리지 않음
  const W = 320, H = 200, padL = 30, padB = 24, barGap = 14, TOP = 36;
  const barW = (W - padL - 10 - barGap * (counts.length - 1)) / counts.length;
  const chartH = H - padB - TOP;

  return (
    <div className="rounded-xl border border-saju-border bg-saju-card p-4">
      {!pdf && <h3 className="text-saju-gold font-bold text-base mb-3">📊 {t.result.ohaeng}</h3>}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" style={{ maxWidth: 420 }}>
        {/* 가로 기준선 */}
        {[0, 0.5, 1].map((r, i) => (
          <line key={i} x1={padL} y1={TOP + chartH * (1 - r)} x2={W - 10} y2={TOP + chartH * (1 - r)} stroke="#2A2A3E" strokeWidth="1" />
        ))}
        {counts.map((o, i) => {
          const h = (o.count / max) * chartH;
          const x = padL + i * (barW + barGap);
          const y = TOP + chartH - h;
          const color = OHAENG_COLORS_MAP[o.name] || '#888';
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={h} rx="3" fill={color} opacity={o.isDayElement ? 1 : 0.75} />
              {o.isDayElement && <text x={x + barW / 2} y={y - 6} textAnchor="middle" fill="#C9A84C" fontSize="11">★</text>}
              <text x={x + barW / 2} y={H - 8} textAnchor="middle" fill="#cbd5e1" fontSize="12">{o.hanja}</text>
              <text x={x + barW / 2} y={y - (o.isDayElement ? 19 : 6)} textAnchor="middle" fill={color} fontSize="11">{o.count}</text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
        {counts.map((o, i) => (
          <span key={i} className="text-xs" style={{ color: OHAENG_COLORS_MAP[o.name] }}>
            {o.hanja}{t.locale === 'ko' ? o.name : t.locale === 'en' ? ` ${o.nameEn}` : ''} {o.count}{t.result.labels.unit}({o.percentage}%){o.isDayElement ? ' ★' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

// 10년 대운 타임라인 + 전환기 전략
function DaewunAnalysis({ phases, t, pdf }: { phases: DaewunPhase[]; t: LocaleData; pdf?: boolean }) {
  return (
    <div className="rounded-xl border border-saju-border bg-saju-card p-4">
      {!pdf && <h3 className="text-saju-gold font-bold text-base mb-3">🔄 {t.result.daewunAnalysis}</h3>}
      {/* 타임라인 그래프 */}
      <div data-pdf-block className="flex gap-1 overflow-x-auto pb-2 mb-3">
        {phases.map((p, i) => {
          const color = OHAENG_COLORS_MAP[p.element] || '#888';
          return (
            <div key={i} className="flex-shrink-0 text-center min-w-[58px]">
              <div className="text-[10px] text-gray-500">{p.age}{t.result.labels.ageSuffix}</div>
              <div className="rounded-lg py-2 my-1" style={{ background: `${color}22`, border: `1px solid ${color}66` }}>
                <div className="text-base font-serif" style={{ color }}>{p.ganzhi}</div>
                <div className="text-[10px]" style={{ color }}>{p.elementHanja}</div>
              </div>
              <div className="text-[9px] text-gray-600">{p.startYear}</div>
            </div>
          );
        })}
      </div>
      {/* 각 대운 전환기 전략 */}
      <div className="space-y-2">
        {phases.map((p, i) => {
          const color = OHAENG_COLORS_MAP[p.element] || '#888';
          return (
            <div data-pdf-block key={i} className="rounded-lg bg-saju-deep/50 border border-saju-border p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-serif font-bold" style={{ color }}>{p.ganzhi}</span>
                <span className="text-xs text-gray-400">{p.age}–{p.age + 9}{t.result.labels.ageSuffix.replace('~', '')} ({p.startYear}~)</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>{p.tenGod}</span>
              </div>
              <div className="text-[13px] text-saju-gold/80 mb-1.5">{p.theme}</div>
              <p className="text-[13px] text-gray-200 leading-6">💡 {p.strategy}</p>
            </div>
          );
        })}
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
