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
  timeOfDay: string;   // 유리한 시간대
  weekday: string;     // 유리한 요일
  vice: string;        // 이 기운 과다 시 주의할 습관(술·담배 등)
  drink: string;       // 음료/술 관련 조언
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
    timeOfDay: '오전 5~7시(인시)',
    weekday: '목요일',
    vice: '과음·무리한 야근과 분노 표출(간 손상 주의)',
    drink: '술은 간에 부담을 주니 절제하고, 신맛 차·매실차가 이롭습니다',
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
    timeOfDay: '오전 11시~오후 1시(오시)',
    weekday: '화요일·일요일',
    vice: '흡연·과도한 스트레스·맵고 자극적인 음식(심혈관 주의)',
    drink: '카페인·에너지음료 과다는 심장에 부담, 미지근한 물과 대추차가 이롭습니다',
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
    timeOfDay: '오후 1~3시(미시)',
    weekday: '토요일',
    vice: '폭식·야식·단 음식과 밀가루 과다(위장·비만 주의)',
    drink: '찬 음료보다 따뜻한 곡물차·생강차가 소화를 돕습니다',
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
    timeOfDay: '오후 5~7시(유시)',
    weekday: '금요일',
    vice: '흡연·미세먼지·찬 공기 노출(폐·기관지·피부 주의)',
    drink: '흡연은 폐 기운을 크게 해치니 금연이 최우선, 배·도라지차가 이롭습니다',
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
    timeOfDay: '오후 9~11시(해시)',
    weekday: '수요일·월요일',
    vice: '과음·과로·찬 음식과 수면 부족(신장·방광 주의)',
    drink: '과음은 신장에 직접 부담을 주니 절주가 중요, 따뜻한 보리차가 이롭습니다',
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

// 지지(地支)별 시기 특성 — 같은 십신 대운이라도 지지에 따라 전략이 달라짐
const BRANCH_FLAVOR: string[] = [
  '특히 子(자) 대운은 씨앗이 움트는 시작의 때입니다. 겉으로 드러나기 전의 물밑 준비와 인연 맺기가 이후 10년의 토대가 되니, 조용히 실력과 네트워크를 쌓으세요.',           // 0 자
  '특히 丑(축) 대운은 묵묵히 내실을 다지는 축적의 때입니다. 화려함보다 꾸준함이 통하는 시기이니, 서두르지 말고 기반을 단단히 굳히세요.',                                   // 1 축
  '특히 寅(인) 대운은 기지개를 켜듯 출발의 기운이 강한 때입니다. 새 프로젝트·이직·창업 등 첫 발을 내딛기에 유리하니, 망설이던 도전을 시작해 보세요.',                       // 2 인
  '특히 卯(묘) 대운은 성장과 확장이 빠른 때입니다. 배움과 인맥이 곧 자산이 되니, 교육·네트워킹에 적극 투자하면 성과가 배가됩니다.',                                        // 3 묘
  '특히 辰(진) 대운은 변화와 변동이 큰 용(龍)의 때입니다. 기회와 리스크가 함께 몰려오니, 큰 결단은 신중하되 잡은 기회는 과감히 밀어붙이세요.',                              // 4 진
  '특히 巳(사) 대운은 지혜와 전략이 빛나는 때입니다. 치밀한 계획과 정보력이 승부를 가르니, 움직이기 전에 판을 읽는 데 공을 들이세요.',                                      // 5 사
  '특히 午(오) 대운은 에너지가 정점에 달하는 때입니다. 활동량과 주목도가 함께 커지지만 과로·구설도 따르기 쉬우니, 절정일수록 겸손과 휴식을 챙기세요.',                       // 6 오
  '특히 未(미) 대운은 수확을 준비하며 조율하는 때입니다. 사람 사이의 관계와 협상이 운을 좌우하니, 부드러운 중재자 역할이 큰 이득으로 돌아옵니다.',                          // 7 미
  '특히 申(신) 대운은 결실을 거두고 정리하는 때입니다. 실리를 확실히 챙기되 군더더기를 덜어내는 구조조정이 다음 도약의 발판이 됩니다.',                                     // 8 신
  '특히 酉(유) 대운은 완성도와 전문성이 인정받는 때입니다. 디테일이 승부를 가르니, 한 분야를 깊게 파고들어 전문가의 위치를 굳히세요.',                                      // 9 유
  '특히 戌(술) 대운은 마무리와 재정비의 때입니다. 지난 성과를 지키면서 다음 10년의 설계도를 그리는 데 집중하면, 전환기를 유리하게 맞이합니다.',                             // 10 술
  '특히 亥(해) 대운은 큰 물줄기가 모이는 포용의 때입니다. 베풀고 품을수록 더 큰 흐름이 되어 돌아오니, 나눔과 확장의 마인드가 행운을 부릅니다.',                             // 11 해
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
      // 십신 기본 전략 + 지지별 시기 특성 결합 → 대운마다 고유한 조언
      strategy: `${info.strategy} ${BRANCH_FLAVOR[d.branch] || ''}`,
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

// 길흉 가이드 (좋은 것 / 피할 것 + 액운 방지·행운 강화 비결)
export interface LuckGuide {
  favorable: {
    foods: string[];
    colors: string[];
    direction: string;
    timeOfDay: string;
    weekday: string;
    activities: string[];
  };
  unfavorable: {
    foods: string[];
    colors: string[];
    direction: string;
    timeOfDay: string;
    weekday: string;
    habits: string[];
  };
  wardOffTips: string[];  // 액운을 막는 비결
  boostTips: string[];    // 행운을 부르는 비결
}

export function buildLuckGuide(saju: SajuResult): LuckGuide {
  const sorted = [...saju.ohaengCounts].sort((a, b) => a.count - b.count);
  const weakestIdx = saju.ohaengCounts.findIndex(o => o.name === sorted[0].name);
  const strongestIdx = saju.ohaengCounts.findIndex(o => o.name === sorted[sorted.length - 1].name);
  const good = ELEMENT_ATTRS[weakestIdx];     // 보완(용신) — 좋은 것
  const bad = ELEMENT_ATTRS[strongestIdx];    // 과다(기신) — 피할 것
  const day = ELEMENT_ATTRS[saju.dayMasterOhaengIndex];

  return {
    favorable: {
      foods: good.foods,
      colors: good.colors,
      direction: good.direction,
      timeOfDay: good.timeOfDay,
      weekday: good.weekday,
      activities: [
        `${good.season}철에 시작하는 일이 잘 풀립니다`,
        `${good.direction} 방향으로 책상·침대 머리를 두면 길합니다`,
        `${good.gemstone} 등 ${good.name} 기운의 액세서리가 운을 북돋웁니다`,
      ],
    },
    unfavorable: {
      foods: bad.foods.map(f => `${f} 과다 섭취`),
      colors: bad.colors,
      direction: bad.direction,
      timeOfDay: bad.timeOfDay,
      weekday: bad.weekday,
      habits: [
        bad.vice,
        `${bad.name} 기운이 이미 강하니 ${bad.colors.join('·')} 계열을 과하게 쓰면 기운이 치우칩니다`,
      ],
    },
    wardOffTips: [
      `${bad.drink}`,
      `과다한 ${bad.hanja}(${bad.name}) 기운이 ${bad.body}에 부담을 주니, 이 부위 건강검진을 정기적으로 받으세요.`,
      `중요한 결정·계약은 ${bad.weekday}보다 ${good.weekday}에 하는 것이 유리합니다.`,
      `${bad.direction} 방향으로의 무리한 이동·투자는 신중히 하고, 급하게 서두를수록 ${good.name} 기운으로 마음을 가다듬으세요.`,
    ],
    boostTips: [
      `부족한 ${good.hanja}(${good.name}) 기운을 채우는 것이 행운의 핵심입니다. ${good.colors.join('·')} 색 소지품과 ${good.foods.slice(0, 2).join('·')} 같은 음식을 가까이하세요.`,
      `${good.timeOfDay}에 중요한 일을 처리하면 능률과 운이 함께 오릅니다.`,
      `행운의 방향은 ${good.direction}, 행운의 요일은 ${good.weekday}입니다. 새 출발은 이때를 활용하세요.`,
      `당신의 본질인 ${day.hanja}(${day.name}) 기운을 건강하게 유지하는 것도 중요합니다. 규칙적인 생활과 ${day.body} 관리에 신경 쓰세요.`,
    ],
  };
}
