import {
  STEMS, STEMS_HANJA, BRANCHES, BRANCHES_HANJA,
  BRANCH_ANIMALS, BRANCH_ANIMALS_EN, OHAENG, OHAENG_EN, OHAENG_HANJA, OHAENG_COLORS,
  STEM_OHAENG, BRANCH_OHAENG, STEM_YINYANG,
  SIPSIN, SIPSIN_EN,
} from './constants';
// lunar-javascript: 검증된 만세력(萬歲曆) 라이브러리. 절기 기반 정확 계산.
// @ts-ignore - 타입 선언이 번들되어 있지 않을 수 있음
import { Solar, Lunar } from 'lunar-javascript';

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
  isDayElement: boolean; // 일간(대표 오행) 여부
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
  dayMasterOhaeng: string;       // 대표 오행 한글 (예: 금)
  dayMasterOhaengHanja: string;  // 대표 오행 한자 (예: 金)
  dayMasterOhaengEn: string;     // 대표 오행 영문 (예: Metal)
  dayMasterOhaengIndex: number;  // 0-4
  dayMasterYinYang: string;      // 음/양
  animal: string;
  animalEn: string;
  timeUnknown: boolean;
  daewun: Daewun[];
  gender: 'male' | 'female';
  birthDate: string;
  birthHour?: number;
  calendarType: 'solar' | 'lunar';
  lunarDateText?: string;  // 음력 날짜 표기
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

// 천간 한자 → 인덱스
function ganIndex(hanja: string): number {
  const i = STEMS_HANJA.indexOf(hanja as any);
  return i < 0 ? 0 : i;
}
// 지지 한자 → 인덱스
function zhiIndex(hanja: string): number {
  const i = BRANCHES_HANJA.indexOf(hanja as any);
  return i < 0 ? 0 : i;
}

// 십신 계산 (일간 기준)
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
  calendarType?: 'solar' | 'lunar';
  isLeapMonth?: boolean; // 음력 윤달 여부
}): SajuResult {
  const {
    year, month, day, hour, gender,
    timeUnknown = false, calendarType = 'solar', isLeapMonth = false,
  } = params;

  const h = timeUnknown || hour === undefined ? 12 : hour;

  // 양력/음력 → Solar 객체로 통일
  let solar: any;
  let lunarDateText: string | undefined;
  if (calendarType === 'lunar') {
    // 음력 입력 → Lunar 생성 후 Solar 변환
    const lunarMonth = isLeapMonth ? -month : month; // 윤달은 음수
    const lunarObj = Lunar.fromYmdHms(year, lunarMonth, day, h, 0, 0);
    solar = lunarObj.getSolar();
    lunarDateText = `음력 ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}${isLeapMonth ? ' (윤달)' : ''}`;
  } else {
    solar = Solar.fromYmdHms(year, month, day, h, 0, 0);
    const lunarObj = solar.getLunar();
    lunarDateText = `음력 ${lunarObj.getYear()}-${String(Math.abs(lunarObj.getMonth())).padStart(2, '0')}-${String(lunarObj.getDay()).padStart(2, '0')}`;
  }

  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();

  // 사주팔자 (정확한 절기 기반)
  const yStem = ganIndex(ec.getYearGan());
  const yBranch = zhiIndex(ec.getYearZhi());
  const mStem = ganIndex(ec.getMonthGan());
  const mBranch = zhiIndex(ec.getMonthZhi());
  const dStem = ganIndex(ec.getDayGan());
  const dBranch = zhiIndex(ec.getDayZhi());
  const tStem = ganIndex(ec.getTimeGan());
  const tBranch = zhiIndex(ec.getTimeZhi());

  const yearPillar = buildPillar(yStem, yBranch, dStem);
  const monthPillar = buildPillar(mStem, mBranch, dStem);
  const dayPillar = buildPillar(dStem, dBranch); // 일주는 일간 자신(비견)
  let hourPillar: Pillar | null = null;
  if (!timeUnknown && hour !== undefined) {
    hourPillar = buildPillar(tStem, tBranch, dStem);
  }

  // 오행 집계 (시간 모르면 6글자, 알면 8글자)
  const counts = [0, 0, 0, 0, 0];
  const pillarsToCount = [yearPillar, monthPillar, dayPillar];
  if (hourPillar) pillarsToCount.push(hourPillar);
  for (const p of pillarsToCount) {
    counts[p.stemOhaeng]++;
    counts[p.branchOhaeng]++;
  }
  const total = pillarsToCount.length * 2;
  const dayElementIndex = STEM_OHAENG[dStem];

  const ohaengCounts: OhaengCount[] = OHAENG.map((name, i) => ({
    name,
    nameEn: OHAENG_EN[i],
    hanja: OHAENG_HANJA[i],
    count: counts[i],
    color: OHAENG_COLORS[i],
    percentage: Math.round((counts[i] / total) * 100),
    isDayElement: i === dayElementIndex,
  }));

  // 대운 (lunar-javascript: 1=남, 0=여)
  const daewun: Daewun[] = [];
  try {
    const yun = ec.getYun(gender === 'male' ? 1 : 0);
    const daYunList = yun.getDaYun();
    for (let i = 1; i < Math.min(daYunList.length, 9); i++) {
      const dy = daYunList[i];
      const gz: string = dy.getGanZhi();
      if (!gz || gz.length < 2) continue;
      const s = ganIndex(gz.charAt(0));
      const b = zhiIndex(gz.charAt(1));
      daewun.push({
        age: dy.getStartAge(),
        startYear: dy.getStartYear(),
        stem: s,
        branch: b,
        stemKor: STEMS[s],
        branchKor: BRANCHES[b],
        stemHanja: STEMS_HANJA[s],
        branchHanja: BRANCHES_HANJA[b],
      });
    }
  } catch {
    // 대운 계산 실패 시 빈 배열
  }

  const solarYear = solar.getYear();
  const solarMonth = solar.getMonth();
  const solarDay = solar.getDay();

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    ohaengCounts,
    dayMaster: dStem,
    dayMasterKor: STEMS[dStem],
    dayMasterHanja: STEMS_HANJA[dStem],
    dayMasterOhaeng: OHAENG[dayElementIndex],
    dayMasterOhaengHanja: OHAENG_HANJA[dayElementIndex],
    dayMasterOhaengEn: OHAENG_EN[dayElementIndex],
    dayMasterOhaengIndex: dayElementIndex,
    dayMasterYinYang: STEM_YINYANG[dStem] === 0 ? '양(陽)' : '음(陰)',
    animal: BRANCH_ANIMALS[yBranch],
    animalEn: BRANCH_ANIMALS_EN[yBranch],
    timeUnknown,
    daewun,
    gender,
    birthDate: `${solarYear}-${String(solarMonth).padStart(2, '0')}-${String(solarDay).padStart(2, '0')}`,
    birthHour: hour,
    calendarType,
    lunarDateText,
  };
}
