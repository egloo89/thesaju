import { NextRequest, NextResponse } from 'next/server';
import { SajuResult } from '@/lib/saju/engine';

export const dynamic = 'force-dynamic';

export interface DailyFortune {
  day: number;
  health: number;   // 1-5 score
  love: number;
  business: number;
  wealth: number;
  healthText: string;
  loveText: string;
  businessText: string;
  wealthText: string;
  overall: number;
  isLucky: boolean;
  isCaution: boolean;
}

const monthlyCache = new Map<string, { data: DailyFortune[]; ts: number }>();

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function generateDemoFortune(day: number, seed: number): DailyFortune {
  const h = Math.sin(seed * 7 + day * 3) * 0.5 + 0.5;
  const l = Math.sin(seed * 5 + day * 7) * 0.5 + 0.5;
  const b = Math.sin(seed * 3 + day * 11) * 0.5 + 0.5;
  const w = Math.sin(seed * 11 + day * 5) * 0.5 + 0.5;

  const toScore = (v: number) => Math.max(1, Math.min(5, Math.round(v * 4 + 1)));
  const health = toScore(h);
  const love = toScore(l);
  const business = toScore(b);
  const wealth = toScore(w);
  const overall = Math.round((health + love + business + wealth) / 4);

  const healthTexts = ['건강에 주의하세요.', '무리하지 마세요.', '컨디션이 보통입니다.', '활력이 넘칩니다.', '최상의 컨디션입니다!'];
  const loveTexts = ['오해가 생길 수 있습니다.', '솔직한 대화가 필요합니다.', '평온한 하루입니다.', '달콤한 시간이 기다립니다.', '로맨틱한 기운이 가득합니다!'];
  const bizTexts = ['결정은 미루세요.', '신중하게 접근하세요.', '계획대로 진행하세요.', '좋은 기회가 옵니다.', '대박의 기운이 흐릅니다!'];
  const wealthTexts = ['지출을 조심하세요.', '불필요한 소비 자제.', '수지가 맞는 하루.', '뜻밖의 수입이 있습니다.', '재물이 들어오는 날!'];

  return {
    day,
    health, love, business, wealth,
    healthText: healthTexts[health - 1],
    loveText: loveTexts[love - 1],
    businessText: bizTexts[business - 1],
    wealthText: wealthTexts[wealth - 1],
    overall,
    isLucky: overall >= 4,
    isCaution: overall <= 2,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { saju, year, month, locale = 'ko' } = body as {
      saju: SajuResult;
      year: number;
      month: number;
      locale: string;
    };

    const cacheKey = `${saju.birthDate}-${saju.gender}-${year}-${month}-${locale}`;
    const cached = monthlyCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < 86400000) {
      return NextResponse.json({ fortunes: cached.data });
    }

    const days = getDaysInMonth(year, month);
    const seed = saju.dayMaster + saju.yearPillar.stem * 10 + saju.monthPillar.branch;
    const fortunes: DailyFortune[] = [];

    for (let d = 1; d <= days; d++) {
      fortunes.push(generateDemoFortune(d, seed));
    }

    monthlyCache.set(cacheKey, { data: fortunes, ts: Date.now() });
    return NextResponse.json({ fortunes });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Monthly fortune failed' }, { status: 500 });
  }
}
