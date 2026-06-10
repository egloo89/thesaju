'use client';

import { SajuResult } from '@/lib/saju/engine';
import { OHAENG_COLORS } from '@/lib/saju/constants';
import { LocaleData } from '@/lib/i18n';

interface Props {
  saju: SajuResult;
  t: LocaleData;
}

const ohaengBg: Record<number, string> = {
  0: 'bg-green-900/30 border-green-700/40',
  1: 'bg-red-900/30 border-red-700/40',
  2: 'bg-yellow-900/30 border-yellow-700/40',
  3: 'bg-gray-700/30 border-gray-500/40',
  4: 'bg-blue-900/30 border-blue-700/40',
};

const ohaengText: Record<number, string> = {
  0: 'text-green-400',
  1: 'text-red-400',
  2: 'text-yellow-400',
  3: 'text-gray-300',
  4: 'text-blue-400',
};

interface PillarCardProps {
  label: string;
  stemHanja: string;
  branchHanja: string;
  stemKor: string;
  branchKor: string;
  stemOhaeng: number;
  branchOhaeng: number;
  sipsin?: string;
  isDay?: boolean;
}

function PillarCard({ label, stemHanja, branchHanja, stemKor, branchKor, stemOhaeng, branchOhaeng, sipsin, isDay }: PillarCardProps) {
  return (
    <div className={`flex flex-col items-center rounded-xl border p-3 gap-1 ${isDay ? 'border-saju-gold/50 bg-saju-gold/5' : 'border-saju-border bg-saju-card'}`}>
      <span className="text-xs text-gray-500 mb-1">{label}</span>
      {sipsin && <span className="text-xs text-saju-gold/60 bg-saju-gold/10 px-2 py-0.5 rounded-full">{sipsin}</span>}

      {/* Stem (천간) */}
      <div className={`w-full flex flex-col items-center py-2 rounded-lg border ${ohaengBg[stemOhaeng]}`}>
        <span className={`text-2xl font-serif font-bold ${ohaengText[stemOhaeng]}`}>{stemHanja}</span>
        <span className="text-xs text-gray-500 mt-0.5">{stemKor}</span>
      </div>

      {/* Branch (지지) */}
      <div className={`w-full flex flex-col items-center py-2 rounded-lg border ${ohaengBg[branchOhaeng]}`}>
        <span className={`text-2xl font-serif font-bold ${ohaengText[branchOhaeng]}`}>{branchHanja}</span>
        <span className="text-xs text-gray-500 mt-0.5">{branchKor}</span>
      </div>
    </div>
  );
}

export default function SajuPillars({ saju, t }: Props) {
  const pillars = [
    { label: t.result.yearPillar, ...saju.yearPillar },
    { label: t.result.monthPillar, ...saju.monthPillar, sipsin: saju.monthPillar.sipsin },
    { label: t.result.dayPillar, ...saju.dayPillar, isDay: true },
    ...(saju.hourPillar ? [{ label: t.result.hourPillar, ...saju.hourPillar, sipsin: saju.hourPillar.sipsin }] : []),
  ];

  return (
    <div className="space-y-4">
      {/* Day Master */}
      <div data-pdf-block className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-saju-gold/10 to-saju-purple/10 border border-saju-gold/30">
        <div className="text-center">
          <div className="text-4xl font-serif font-bold text-saju-gold">{saju.dayMasterHanja}</div>
          <div className="text-sm text-saju-gold/60">{saju.dayMasterKor}일간</div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-white">{t.result.dayMaster}</div>
          <div className="text-xs text-gray-400 mt-1">
            {saju.dayMasterOhaeng}의 기운 · {saju.animal}띠 ({saju.animalEn})
          </div>
          {saju.timeUnknown && (
            <div className="text-xs text-yellow-500/80 mt-1">⚠ 시주 미포함</div>
          )}
        </div>
      </div>

      {/* Four Pillars */}
      <div data-pdf-block>
        <h4 className="text-sm text-gray-500 mb-3 font-medium">사주팔자 (四柱八字)</h4>
        <div className={`grid gap-2 ${saju.hourPillar ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {pillars.map((p, i) => (
            <PillarCard key={i} {...p} />
          ))}
        </div>
      </div>

      {/* Five Elements */}
      <div data-pdf-block>
        <h4 className="text-sm text-gray-500 mb-3 font-medium">{t.result.ohaeng}</h4>
        <div className="space-y-2">
          {saju.ohaengCounts.map((o, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg px-2 py-1 -mx-2 ${
                o.isDayElement ? 'bg-saju-gold/10 ring-1 ring-saju-gold/40' : ''
              }`}
            >
              <div className="w-14 text-right flex items-center justify-end gap-1">
                <span className="text-sm font-medium" style={{ color: o.color }}>{o.hanja}</span>
                <span className="text-xs text-gray-500">{o.name}</span>
                {o.isDayElement && <span className="text-saju-gold text-[10px]">★</span>}
              </div>
              <div className="flex-1 score-bar">
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${o.percentage}%`,
                    background: `linear-gradient(90deg, ${o.color}80, ${o.color})`,
                  }}
                />
              </div>
              <div className="w-12 text-left">
                <span className="text-sm" style={{ color: o.color }}>{o.count}개</span>
                <span className="text-xs text-gray-500 ml-1">({o.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-saju-gold/60 mt-2">
          ★ 나의 대표 오행: <span className="text-saju-gold font-medium">{saju.dayMasterHanja}{saju.dayMasterKor}일간 — {saju.dayMasterOhaengHanja}({saju.dayMasterOhaeng}) {saju.dayMasterYinYang}</span>
        </p>
      </div>

      {/* Daewun */}
      <div data-pdf-block>
        <h4 className="text-sm text-gray-500 mb-3 font-medium">{t.result.daewun}</h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {saju.daewun.map((d, i) => (
            <div key={i} className="flex-shrink-0 text-center p-2 rounded-lg border border-saju-border bg-saju-card min-w-[64px]">
              <div className="text-xs text-gray-500">{d.age}세~</div>
              <div className="text-sm font-serif text-saju-gold/80">{d.stemHanja}</div>
              <div className="text-sm font-serif text-saju-gold/60">{d.branchHanja}</div>
              <div className="text-xs text-gray-600">{d.startYear}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
