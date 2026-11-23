'use client';

import { Locale } from '@/lib/i18n';
import ProductCatalog from './ProductCatalog';
import type { ProductId } from '@/lib/catalog';

export type GuideId = 'yoon' | 'seoha';

const words = {
  ko: { title: '당신의 이야기를,\n운명의 지도로.', greeting: '반가워요. 당신 안에 담긴 가능성을 함께 읽어볼까요?', choose: '나의 사주 상담가', yoon: '윤', seoha: '서하', role: 'AI 사주 가이드', start: '내 사주 만나보기', intro: '복잡한 사주, 쉽게 만나세요', note: '전통 명리학에 AI의 해석을 더한 자기 탐색', detail: '자세히 알아보기', overview: '한눈에 보는 나의 사주', full: '전체 풀이 읽기', report: '당신만을 위한 운명 리포트' },
  en: { title: 'Your story.\nA new perspective.', greeting: 'Welcome. Shall we explore the possibilities within your Four Pillars?', choose: 'Meet your reading guide', yoon: 'Yoon', seoha: 'Seoha', role: 'AI Saju guide', start: 'Discover my Saju', intro: 'Ancient wisdom. Made personal.', note: 'Self-discovery through Korean tradition and AI', detail: 'Explore the tradition', overview: 'Your Saju at a glance', full: 'Read the full interpretation', report: 'Your personal destiny report' },
  ja: { title: 'あなたの物語を、\n運命の地図に。', greeting: 'ようこそ。あなたに秘められた可能性を一緒に読み解きましょう。', choose: 'あなたの四柱ガイド', yoon: 'ユン', seoha: 'ソハ', role: 'AI四柱ガイド', start: '私の四柱を見る', intro: '伝統の知恵を、もっと身近に', note: '韓国の伝統とAIによる自己探求', detail: '詳しく知る', overview: 'ひと目でわかる私の四柱', full: '詳しい解説を読む', report: 'あなただけの運命レポート' },
  zh: { title: '你的故事，\n你的命运地图。', greeting: '欢迎。一起探索你四柱中蕴藏的可能性吧。', choose: '选择你的四柱向导', yoon: '允', seoha: '书夏', role: 'AI四柱向导', start: '探索我的四柱', intro: '古老智慧，轻松解读', note: '韩国传统与AI相结合的自我探索', detail: '了解更多', overview: '我的四柱一目了然', full: '阅读完整解读', report: '专属于你的命运报告' },
  tw: { title: '你的故事，\n你的命運地圖。', greeting: '歡迎。一起探索你四柱中蘊藏的可能性吧。', choose: '選擇你的四柱嚮導', yoon: '允', seoha: '書夏', role: 'AI四柱嚮導', start: '探索我的四柱', intro: '古老智慧，輕鬆解讀', note: '韓國傳統與AI相結合的自我探索', detail: '了解更多', overview: '我的四柱一目了然', full: '閱讀完整解讀', report: '專屬於你的命運報告' },
};

export function guideCopy(locale: Locale) { return words[locale]; }

export function GuidePortrait({ guide, small = false }: { guide: GuideId; small?: boolean }) {
  if (small) return <span className="guide-avatar" aria-hidden="true"><img src={`/images/guide-${guide}.webp`} alt="" width={80} height={88} /></span>;
  return <img src={`/images/guide-${guide}.webp`} alt="" className="guide-portrait" width={640} height={700} />;
}

export function GuideGreeting({ guide, locale, children }: { guide: GuideId; locale: Locale; children?: React.ReactNode }) {
  const c = words[locale];
  return <div className="guide-greeting"><GuidePortrait guide={guide} small /><div><span className="guide-byline">{c[guide]} <span>· {c.role}</span></span><p>{children || c.greeting}</p></div></div>;
}

export default function ConsultantHome({ locale, guide, onGuide, onStart, onMonthly, onLifetime, onProduct, t }: {
  locale: Locale; guide: GuideId; onGuide: (v: GuideId) => void; onStart: () => void; onMonthly: () => void; onLifetime: () => void;
  t: ReturnType<typeof import('@/lib/i18n').getLocaleData>;
  onProduct: (id:ProductId) => void;
}) {
  const c = words[locale];
  return <div className="home-editorial">
    <section className="consultant-hero">
      <div className="hero-copy"><span className="eyebrow">K-FORTUNE · THE SAJU</span><h1>{c.title}</h1><p className="hero-sub">{c.note}</p>
        <div className="guide-picker" role="group" aria-label={c.choose}>{(['yoon', 'seoha'] as const).map(id => <button key={id} onClick={() => onGuide(id)} aria-pressed={guide === id}><GuidePortrait guide={id} small /><span>{c[id]}</span><span aria-hidden="true">{guide === id ? '✓' : '+'}</span></button>)}</div>
        <button className="primary-action" onClick={onStart}>{c.start}<span aria-hidden="true">↗</span></button>
      </div>
      <div className="portrait-stage"><div className="portrait-halo" aria-hidden="true" /><span className="stage-star" aria-hidden="true">✦</span><GuidePortrait guide={guide} /><div className="portrait-caption"><span>{c[guide]}</span><span>{c.role}</span></div></div>
      <div className="hero-message"><span className="message-spark" aria-hidden="true">✦</span><p>{c.greeting}</p></div>
    </section>
    <section className="discovery-section"><div className="section-label"><span>01 / DISCOVER</span><span>✦</span></div><h2>{c.intro}</h2>
      <div className="discovery-grid">{[
        { n:'01', symbol:'命', data:t.pricing.service1, action:onStart, kind:'life' },
        { n:'02', symbol:'月', data:t.pricing.service2, action:onMonthly, kind:'month' },
        { n:'03', symbol:'∞', data:t.pricing.service3, action:onLifetime, kind:'forever' },
      ].map(item => <button className={`discovery-card ${item.kind}`} onClick={item.action} key={item.n}><div className="card-top"><span>{item.n}</span><span>↗</span></div><span className="card-symbol" aria-hidden="true">{item.symbol}</span><h3>{item.data.name}</h3><p>{item.data.features[0]}</p><strong>{item.data.price}</strong></button>)}</div>
    </section>
    <ProductCatalog locale={locale} t={t} onSelect={onProduct} />
    <section className="tradition-section"><div className="section-label"><span>THE FOUR PILLARS</span><span>☯</span></div><h2>{t.whatIsSaju.title}</h2><p className="tradition-sub">{t.whatIsSaju.subtitle}</p><div className="pillar-preview">{t.whatIsSaju.pillars.map((p,i)=><div key={p}><span>{['年','月','日','時'][i]}</span><strong>{p}</strong></div>)}</div><details className="quiet-details"><summary>{c.detail}<span>＋</span></summary><p>{t.whatIsSaju.desc}</p>{locale !== 'ko' && <p>{t.kfortune.desc}</p>}</details></section>
    <footer className="home-signoff"><span>THE SAJU</span><p>{c.note}</p><small>Traditional Korean Fortune Mapping</small></footer>
  </div>;
}
