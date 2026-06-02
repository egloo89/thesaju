import { SajuResult } from './engine';
import { STEM_OHAENG, OHAENG, OHAENG_HANJA } from './constants';

// 오행별 속성 (index: 0=목,1=화,2=토,3=금,4=수)
interface ElementAttr {
  name: string;
  hanja: string;
  colors: string[];
  colorHex: string[];
  direction: string;
  numbers: number[];
  season: string;
  gemstone: string;
  jobs: string[];
  foods: string[];
  trait: string;
  body: string;
}

const ELEMENT_ATTRS: ElementAttr[] = [
  {
    name: '목', hanja: '木',
    colors: ['초록', '청록'], colorHex: ['#2D6A4F', '#1E8449'],
    direction: '동쪽(東)', numbers: [3, 8], season: '봄',
    gemstone: '에메랄드 · 옥(玉)',
    jobs: ['교육·강의', '출판·언론', '의류·패션', '원예·환경', '기획·디자인'],
    foods: ['신맛 과일', '푸른 잎채소', '브로콜리', '키위'],
    trait: '인자하고 성장 지향적이며 추진력이 강함',
    body: '간·담·근육·신경계',
  },
  {
    name: '화', hanja: '火',
    colors: ['빨강', '분홍', '자주'], colorHex: ['#C0392B', '#E74C3C'],
    direction: '남쪽(南)', numbers: [2, 7], season: '여름',
    gemstone: '루비 · 산호',
    jobs: ['예술·공연', '방송·미디어', 'IT·전자', '요식·조명', '뷰티'],
    foods: ['쓴맛 채소', '토마토', '대추', '따뜻한 차'],
    trait: '열정적이고 표현력이 풍부하며 사교적',
    body: '심장·소장·혈관·순환계',
  },
  {
    name: '토', hanja: '土',
    colors: ['노랑', '베이지', '황토'], colorHex: ['#D4A017', '#CA9A2E'],
    direction: '중앙', numbers: [5, 10], season: '환절기',
    gemstone: '황옥(토파즈) · 호박',
    jobs: ['부동산·건축', '농업·식품', '중개·유통', '행정·공직', '컨설팅'],
    foods: ['단맛 곡물', '고구마', '단호박', '꿀'],
    trait: '신뢰감 있고 포용력이 크며 중심을 잡는 안정형',
    body: '비위·소화기·위장',
  },
  {
    name: '금', hanja: '金',
    colors: ['흰색', '은색', '금색'], colorHex: ['#BDC3C7', '#95A5A6'],
    direction: '서쪽(西)', numbers: [4, 9], season: '가을',
    gemstone: '다이아몬드 · 백금',
    jobs: ['금융·회계', '법률·의료', '기계·엔지니어링', '군·경찰', '귀금속'],
    foods: ['매운맛', '마늘·생강', '배', '무'],
    trait: '결단력 있고 의리가 깊으며 절제된 강인함',
    body: '폐·대장·호흡기·피부',
  },
  {
    name: '수', hanja: '水',
    colors: ['검정', '남색', '파랑'], colorHex: ['#1A3A5C', '#2C3E50'],
    direction: '북쪽(北)', numbers: [1, 6], season: '겨울',
    gemstone: '흑진주 · 사파이어',
    jobs: ['무역·물류', '수산·해운', '연구·학문', '관광·서비스', '주류·음료'],
    foods: ['짠맛 해산물', '검은콩', '미역', '두부'],
    trait: '지혜롭고 유연하며 깊은 통찰력을 지님',
    body: '신장·방광·생식기·수분대사',
  },
];

export interface SajuProfile {
  // 본명 오행 (일간)
  dayElement: ElementAttr;
  // 보완(용신 근사) 오행 — 가장 부족한 기운
  beneficialElement: ElementAttr;
  // 과다(기신 근사) 오행 — 가장 많은 기운
  excessiveElement: ElementAttr;
  // 행운 요소 (보완 오행 기준)
  luckyColors: string[];
  luckyColorHex: string[];
  luckyDirection: string;
  luckyNumbers: number[];
  luckySeason: string;
  luckyGemstone: string;
  recommendedJobs: string[];
  helpfulFoods: string[];
  cautionBody: string;
  personality: string;
  balanceComment: string;
}

// 10년 대운 분석 (각 대운의 십신 성격 + 전환기 전략)
export interface DaewunPhase {
  age: number;
  startYear: number;
  ganzhi: string;        // 한자 간지
  element: string;       // 천간 오행 한글
  elementHanja: string;
  tenGod: string;        // 십신 분류
  theme: string;         // 시기 테마
  strategy: string;      // 전환기 전략
}

const TEN_GOD_INFO: { name: string; theme: string; strategy: string }[] = [
  { // 0: 비겁
    name: '비겁운(比劫)',
    theme: '자아·독립·경쟁의 시기',
    strategy: '주체성이 강해지고 경쟁이 늘어납니다. 동업·협업에서는 지분과 역할을 명확히 하고, 자기 사업이나 독립을 준비하기 좋은 때입니다. 다만 고집과 충돌을 경계하세요.',
  },
  { // 1: 식상
    name: '식상운(食傷)',
    theme: '표현·재능·활동의 시기',
    strategy: '아이디어와 표현력이 살아납니다. 창작·강의·콘텐츠·기술 발휘에 유리하며, 새로운 일을 벌이기 좋습니다. 과한 확장과 구설은 주의하세요.',
  },
  { // 2: 재성
    name: '재성운(財星)',
    theme: '재물·결실·현실 성취의 시기',
    strategy: '재물과 실리의 기운이 들어옵니다. 투자·사업 확장·자산 형성에 적극적으로 나서되, 무리한 욕심과 빚은 경계하세요. 부동산·계약은 이 시기를 활용하면 좋습니다.',
  },
  { // 3: 관성
    name: '관성운(官星)',
    theme: '책임·명예·시험·도전의 시기',
    strategy: '승진·시험·공직·명예의 기회가 옵니다. 책임이 무거워지지만 사회적 지위를 높이기 좋은 때입니다. 압박감과 건강 관리에 유의하며 정도(正道)를 지키세요.',
  },
  { // 4: 인성
    name: '인성운(印星)',
    theme: '학습·성장·후원의 시기',
    strategy: '공부·자격·문서·후원의 기운입니다. 배움과 내실을 다지고, 어른·멘토의 도움을 받기 좋습니다. 결단을 미루는 우유부단함은 경계하세요.',
  },
];

export function buildDaewunAnalysis(saju: SajuResult): DaewunPhase[] {
  const dEl = STEM_OHAENG[saju.dayMaster]; // 일간 오행 index
  return saju.daewun.map((d) => {
    const stemEl = STEM_OHAENG[d.stem];
    const diff = ((stemEl - dEl) + 5) % 5; // 0비겁 1식상 2재성 3관성 4인성
    const info = TEN_GOD_INFO[diff];
    return {
      age: d.age,
      startYear: d.startYear,
      ganzhi: `${d.stemHanja}${d.branchHanja}`,
      element: OHAENG[stemEl],
      elementHanja: OHAENG_HANJA[stemEl],
      tenGod: info.name,
      theme: info.theme,
      strategy: info.strategy,
    };
  });
}

export function buildSajuProfile(saju: SajuResult): SajuProfile {
  const dayElement = ELEMENT_ATTRS[saju.dayMasterOhaengIndex];

  // 가장 부족한 오행(보완), 가장 많은 오행(과다)
  const sorted = [...saju.ohaengCounts].sort((a, b) => a.count - b.count);
  const weakestIdx = saju.ohaengCounts.findIndex(o => o.name === sorted[0].name);
  const strongestIdx = saju.ohaengCounts.findIndex(o => o.name === sorted[sorted.length - 1].name);

  const beneficialElement = ELEMENT_ATTRS[weakestIdx];
  const excessiveElement = ELEMENT_ATTRS[strongestIdx];

  const lacking = saju.ohaengCounts.filter(o => o.count === 0);
  const balanceComment = lacking.length > 0
    ? `사주 원국에 ${lacking.map(o => `${o.hanja}(${o.name})`).join(', ')} 기운이 비어 있어, ${beneficialElement.hanja}(${beneficialElement.name})의 색·방향·활동으로 보완하면 운의 균형이 살아납니다.`
    : `오행이 비교적 고르게 분포되어 있으나, 상대적으로 약한 ${beneficialElement.hanja}(${beneficialElement.name})를 보완하면 더욱 안정됩니다.`;

  return {
    dayElement,
    beneficialElement,
    excessiveElement,
    luckyColors: beneficialElement.colors,
    luckyColorHex: beneficialElement.colorHex,
    luckyDirection: beneficialElement.direction,
    luckyNumbers: beneficialElement.numbers,
    luckySeason: beneficialElement.season,
    luckyGemstone: beneficialElement.gemstone,
    recommendedJobs: dayElement.jobs,
    helpfulFoods: beneficialElement.foods,
    cautionBody: excessiveElement.body,
    personality: dayElement.trait,
    balanceComment,
  };
}
