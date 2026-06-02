import {
  STEMS, STEMS_HANJA, BRANCHES, BRANCHES_HANJA,
  BRANCH_ANIMALS, BRANCH_ANIMALS_EN, OHAENG, OHAENG_EN, OHAENG_HANJA, OHAENG_COLORS,
  STEM_OHAENG, BRANCH_OHAENG, STEM_YINYANG, BRANCH_YINYANG,
  SIPSIN, SIPSIN_EN,
} from './constants';

export interface Pillar {
  stem: number;      // 천간 인덱스 0-9
  branch: number;    // 지지 인덱스 0-11
  stemKor: string;
  branchKor: string;
  stemHanja: string;
  branchHanja: string;
  stemOhaeng: number;
  branchOhaeng: number;
  sipsin?: string;
  sipsinEn?: string;
}

export interface OhaengCount {
  name: string;
  nameEn: string;
  hanja: string;
  count: number;
  color: string;
  percentage: number;
}

export interface SajuResult {
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar | null;
  ohaengCounts: OhaengCount[];
  dayMaster: number;       // 일간 인덱스
  dayMasterKor: string;
  dayMasterHanja: string;
  dayMasterOhaeng: string;
  animal: string;
  animalEn: string;
  timeUnknown: boolean;
  daewun: Daewun[];
  gender: 'male' | 'female';
  birthDate: string;
  birthHour?: number;
}

export interface Daewun {
  age: number;
  stem: number;
  branch: number;
  stemKor: string;
  branchKor: string;
  stemHanja: string;
  branchHanja: string;
  startYear: number;
}

// 연주 계산 (Year Pillar)
function calcYearPillar(year: number): { stem: number; branch: number } {
  const stem = ((year - 4) % 10 + 10) % 10;
  const branch = ((year - 4) % 12 + 12) % 12;
  return { stem, branch };
}

// 월주 계산 (Month Pillar) - 절기 기반 근사
function calcMonthPillar(year: number, month: number, day: number): { stem: number; branch: number } {
  // 절기 기준 월 (양력 기준 대략적 절입일)
  const solarTermDays = [6, 4, 6, 5, 6, 6, 7, 7, 8, 8, 7, 7];
  let sajuMonth = month - 1; // 0-indexed
  if (day < solarTermDays[sajuMonth]) {
    sajuMonth = (sajuMonth - 1 + 12) % 12;
  }

  // 월간 계산: 연간에 따라 결정
  const yearStemBase = [2, 4, 6, 8, 0]; // 갑기→병, 을경→무, 병신→경, 정임→임, 무계→갑
  const yearStemGroup = Math.floor(((year - 4) % 10 + 10) % 10 / 2);
  const monthStemStart = [2, 4, 6, 8, 0][yearStemGroup];
  const stem = (monthStemStart + sajuMonth) % 10;
  const branch = (sajuMonth + 2) % 12; // 인월부터 시작

  return { stem, branch };
}

// 일주 계산 (Day Pillar) - Julian Day Number 기반
function calcDayPillar(year: number, month: number, day: number): { stem: number; branch: number } {
  // Zeller's formula 변형으로 줄리안 일수 계산
  let y = year;
  let m = month;
  if (m <= 2) { y--; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

  // 기준: 1900년 1월 1일 = 갑자일(甲子) → JD = 2415021
  // 갑자 기준 (stem=0, branch=0)
  const base = 2415021;
  const diff = jd - base;
  const stem = ((diff % 10) + 10) % 10;
  const branch = ((diff % 12) + 12) % 12;
  return { stem, branch };
}

// 시주 계산 (Hour Pillar)
function calcHourPillar(dayMasterStem: number, hour: number): { stem: number; branch: number } {
  // 시지 결정
  let branch = 0;
  if (hour >= 23 || hour < 1) branch = 0;
  else if (hour < 3) branch = 1;
  else if (hour < 5) branch = 2;
  else if (hour < 7) branch = 3;
  else if (hour < 9) branch = 4;
  else if (hour < 11) branch = 5;
  else if (hour < 13) branch = 6;
  else if (hour < 15) branch = 7;
  else if (hour < 17) branch = 8;
  else if (hour < 19) branch = 9;
  else if (hour < 21) branch = 10;
  else branch = 11;

  // 시간 계산: 일간에 따라 결정
  const stemBase = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  const stem = (stemBase[dayMasterStem] + branch) % 10;
  return { stem, branch };
}

// 십신 계산
function calcSipsin(dayStem: number, targetStem: number): { kor: string; en: string } {
  const dayOhaeng = STEM_OHAENG[dayStem];
  const targetOhaeng = STEM_OHAENG[targetStem];
  const dayYinYang = STEM_YINYANG[dayStem];
  const targetYinYang = STEM_YINYANG[targetStem];

  const ohaengDiff = ((targetOhaeng - dayOhaeng) + 5) % 5;
  const sameYinYang = dayYinYang === targetYinYang ? 0 : 1;

  const sipsinIndex = ohaengDiff * 2 + sameYinYang;
  return {
    kor: SIPSIN[sipsinIndex] || '',
    en: SIPSIN_EN[sipsinIndex] || '',
  };
}

// 대운 계산
function calcDaewun(
  yearPillar: { stem: number; branch: number },
  monthPillar: { stem: number; branch: number },
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  gender: 'male' | 'female'
): Daewun[] {
  const yearStemYinYang = STEM_YINYANG[yearPillar.stem];
  const isForward = (gender === 'male' && yearStemYinYang === 0) ||
                    (gender === 'female' && yearStemYinYang === 1);

  const daewuns: Daewun[] = [];
  let stem = monthPillar.stem;
  let branch = monthPillar.branch;

  // 대운수 계산 (절기까지 날수 / 3)
  const startAge = 3; // 근사값

  for (let i = 0; i < 8; i++) {
    if (isForward) {
      stem = (stem + 1) % 10;
      branch = (branch + 1) % 12;
    } else {
      stem = (stem - 1 + 10) % 10;
      branch = (branch - 1 + 12) % 12;
    }

    daewuns.push({
      age: startAge + i * 10,
      stem,
      branch,
      stemKor: STEMS[stem],
      branchKor: BRANCHES[branch],
      stemHanja: STEMS_HANJA[stem],
      branchHanja: BRANCHES_HANJA[branch],
      startYear: birthYear + startAge + i * 10,
    });
  }
  return daewuns;
}

function buildPillar(stem: number, branch: number, dayStem?: number): Pillar {
  const pillar: Pillar = {
    stem,
    branch,
    stemKor: STEMS[stem],
    branchKor: BRANCHES[branch],
    stemHanja: STEMS_HANJA[stem],
    branchHanja: BRANCHES_HANJA[branch],
    stemOhaeng: STEM_OHAENG[stem],
    branchOhaeng: BRANCH_OHAENG[branch],
  };
  if (dayStem !== undefined) {
    const ss = calcSipsin(dayStem, stem);
    pillar.sipsin = ss.kor;
    pillar.sipsinEn = ss.en;
  }
  return pillar;
}

export function calculateSaju(params: {
  year: number;
  month: number;
  day: number;
  hour?: number;
  gender: 'male' | 'female';
  timeUnknown?: boolean;
}): SajuResult {
  const { year, month, day, hour, gender, timeUnknown = false } = params;

  const yp = calcYearPillar(year);
  const mp = calcMonthPillar(year, month, day);
  const dp = calcDayPillar(year, month, day);

  const yearPillar = buildPillar(yp.stem, yp.branch);
  const monthPillar = buildPillar(mp.stem, mp.branch, dp.stem);
  const dayPillar = buildPillar(dp.stem, dp.branch);

  let hourPillar: Pillar | null = null;
  if (!timeUnknown && hour !== undefined) {
    const hp = calcHourPillar(dp.stem, hour);
    hourPillar = buildPillar(hp.stem, hp.branch, dp.stem);
  }

  // 오행 집계
  const counts = [0, 0, 0, 0, 0];
  const pillarsToCount = [yearPillar, monthPillar, dayPillar];
  if (hourPillar) pillarsToCount.push(hourPillar);

  for (const p of pillarsToCount) {
    counts[p.stemOhaeng]++;
    counts[p.branchOhaeng]++;
  }

  const total = pillarsToCount.length * 2;
  const ohaengCounts: OhaengCount[] = OHAENG.map((name, i) => ({
    name,
    nameEn: OHAENG_EN[i],
    hanja: OHAENG_HANJA[i],
    count: counts[i],
    color: OHAENG_COLORS[i],
    percentage: Math.round((counts[i] / total) * 100),
  }));

  const daewun = calcDaewun(yp, mp, year, month, day, gender);

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    ohaengCounts,
    dayMaster: dp.stem,
    dayMasterKor: STEMS[dp.stem],
    dayMasterHanja: STEMS_HANJA[dp.stem],
    dayMasterOhaeng: OHAENG[STEM_OHAENG[dp.stem]],
    animal: BRANCH_ANIMALS[yp.branch],
    animalEn: BRANCH_ANIMALS_EN[yp.branch],
    timeUnknown,
    daewun,
    gender,
    birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    birthHour: hour,
  };
}
