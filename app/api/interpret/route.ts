import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SajuResult } from '@/lib/saju/engine';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const fortuneTypePrompts: Record<string, string> = {
  total: '총운 (전반적인 인생운)',
  health: '건강운',
  love: '연애운',
  marriage: '결혼운',
  business: '사업운',
  career: '취업·커리어운',
  work: '직장운',
  wealth: '재물·금전운',
};

function buildSajuSummary(saju: SajuResult): string {
  const pillars = [
    `연주: ${saju.yearPillar.stemHanja}${saju.yearPillar.branchHanja}(${saju.yearPillar.stemKor}${saju.yearPillar.branchKor})`,
    `월주: ${saju.monthPillar.stemHanja}${saju.monthPillar.branchHanja}(${saju.monthPillar.stemKor}${saju.monthPillar.branchKor})`,
    `일주: ${saju.dayPillar.stemHanja}${saju.dayPillar.branchHanja}(${saju.dayPillar.stemKor}${saju.dayPillar.branchKor})`,
  ];
  if (saju.hourPillar) {
    pillars.push(`시주: ${saju.hourPillar.stemHanja}${saju.hourPillar.branchHanja}(${saju.hourPillar.stemKor}${saju.hourPillar.branchKor})`);
  }
  const ohaengStr = saju.ohaengCounts.map(o => `${o.name}(${o.hanja})${o.count}개`).join(', ');
  return `
사주팔자: ${pillars.join(' / ')}
일간(日干): ${saju.dayMasterHanja}(${saju.dayMasterKor}) - ${saju.dayMasterOhaeng}의 기운
띠: ${saju.animal}
오행 분포: ${ohaengStr}
성별: ${saju.gender === 'male' ? '남성' : '여성'}
시간모름: ${saju.timeUnknown ? '예' : '아니오'}
  `.trim();
}

const interpretCache = new Map<string, { data: Record<string, string>; ts: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { saju, locale = 'ko', serviceType = 'full' } = body as {
      saju: SajuResult;
      locale: string;
      serviceType: 'full' | 'monthly';
      year?: number;
      month?: number;
    };

    const cacheKey = `${saju.birthDate}-${saju.birthHour ?? 'x'}-${saju.gender}-${locale}-${serviceType}`;
    const cached = interpretCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < 86400000) {
      return NextResponse.json({ interpretations: cached.data });
    }

    const sajuSummary = buildSajuSummary(saju);
    const langInstruction: Record<string, string> = {
      ko: '한국어로 답변하세요.',
      en: 'Answer in English.',
      ja: '日本語で答えてください。',
      zh: '请用简体中文回答。',
      tw: '請用繁體中文回答。',
    };

    const interpretations: Record<string, string> = {};

    if (!process.env.OPENAI_API_KEY) {
      // Demo mode without API key
      const demoTexts: Record<string, string> = {
        total: '당신의 사주는 강한 의지력과 추진력을 나타냅니다. 일간이 나타내는 기운이 오행 전체와 조화롭게 어우러져 있어, 인생 전반에 걸쳐 꾸준한 성장과 발전이 기대됩니다. 특히 30대 후반부터 대운이 상승하면서 사회적 지위와 재물이 함께 성장할 것으로 보입니다.',
        health: '전반적으로 건강한 체력을 타고났습니다. 다만 오행 중 특정 기운이 과하거나 부족한 부분이 있어 해당 장기에 주의가 필요합니다. 규칙적인 운동과 충분한 수면이 건강 유지의 핵심이 될 것입니다.',
        love: '감성이 풍부하고 매력적인 기운을 가지고 있어 이성에게 인기가 있습니다. 다만 이상이 높아 완벽한 상대를 찾는 경향이 있습니다. 진실된 마음으로 다가오는 인연을 소중히 여기세요.',
        marriage: '결혼운은 안정적이며 가정적인 배우자를 만날 가능성이 높습니다. 적절한 시기에 인연이 맺어질 것이며, 결혼 후 가정이 삶의 든든한 기반이 될 것입니다.',
        business: '창의적인 아이디어와 실행력을 겸비하여 사업 운이 좋은 편입니다. 독립적인 사업보다는 파트너십이나 합작 형태에서 더 큰 성과를 낼 수 있습니다.',
        career: '전문성을 살릴 수 있는 분야에서 두각을 나타낼 것입니다. 취업 시기는 준비가 충분히 된 상태에서 도전해야 성공 확률이 높으며, 첫 직장보다는 이직 후에 더 좋은 기회가 찾아올 수 있습니다.',
        work: '협력과 조화를 중시하는 성격으로 팀 내에서 인정받는 편입니다. 상사와의 관계에서는 직접적인 충돌보다는 유연한 태도가 도움이 됩니다.',
        wealth: '재물복은 타고났으나 관리 능력이 중요합니다. 큰 수입보다는 꾸준한 저축과 안정적인 투자가 재물 축적의 핵심입니다. 40대 이후 재물운이 상승할 것으로 보입니다.',
      };
      Object.assign(interpretations, demoTexts);
    } else {
      const prompt = `당신은 5,000년 전통의 사주명리학 전문가입니다.
다음 사주를 분석하고 각 운세 항목에 대해 깊이 있고 친근하게 해석해 주세요.
${langInstruction[locale] || langInstruction.ko}

${sajuSummary}

다음 8가지 운세를 각각 200자 내외로 따뜻하고 통찰력 있게 해석해 주세요:
${Object.entries(fortuneTypePrompts).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

JSON 형식으로 답변하세요:
{"total": "...", "health": "...", "love": "...", "marriage": "...", "business": "...", "career": "...", "work": "...", "wealth": "..."}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
      });

      const parsed = JSON.parse(completion.choices[0].message.content || '{}');
      Object.assign(interpretations, parsed);
    }

    interpretCache.set(cacheKey, { data: interpretations, ts: Date.now() });
    return NextResponse.json({ interpretations });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Interpretation failed' }, { status: 500 });
  }
}
