// 천간 (Heavenly Stems)
export const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
export const STEMS_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const STEMS_EN = ['Gab', 'Eul', 'Byeong', 'Jeong', 'Mu', 'Gi', 'Gyeong', 'Sin', 'Im', 'Gye'] as const;

// 지지 (Earthly Branches)
export const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;
export const BRANCHES_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export const BRANCH_ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'] as const;
export const BRANCH_ANIMALS_EN = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'] as const;

// 오행 (Five Elements)
export const OHAENG = ['목', '화', '토', '금', '수'] as const;
export const OHAENG_EN = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const;
export const OHAENG_HANJA = ['木', '火', '土', '金', '水'] as const;
export const OHAENG_COLORS = ['#2D6A4F', '#C0392B', '#D4A017', '#A0A0B0', '#1A3A5C'] as const;

// 천간 → 오행 매핑
export const STEM_OHAENG: Record<number, number> = {
  0: 0, 1: 0,  // 갑을 → 목
  2: 1, 3: 1,  // 병정 → 화
  4: 2, 5: 2,  // 무기 → 토
  6: 3, 7: 3,  // 경신 → 금
  8: 4, 9: 4,  // 임계 → 수
};

// 지지 → 오행 매핑
export const BRANCH_OHAENG: Record<number, number> = {
  0: 4, 1: 2, 2: 0, 3: 0,   // 자축인묘 → 수토목목
  4: 2, 5: 1, 6: 1, 7: 2,   // 진사오미 → 토화화토
  8: 3, 9: 3, 10: 2, 11: 4, // 신유술해 → 금금토수
};

// 천간 음양 (0=양, 1=음)
export const STEM_YINYANG: Record<number, number> = {
  0: 0, 1: 1, 2: 0, 3: 1, 4: 0,
  5: 1, 6: 0, 7: 1, 8: 0, 9: 1,
};

// 지지 음양
export const BRANCH_YINYANG: Record<number, number> = {
  0: 0, 1: 1, 2: 0, 3: 1, 4: 0, 5: 1,
  6: 0, 7: 1, 8: 0, 9: 1, 10: 0, 11: 1,
};

// 십신 (Ten Gods) - 일간 기준
export const SIPSIN = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'] as const;
export const SIPSIN_EN = ['Companion', 'Rob Wealth', 'Eating God', 'Hurt Officer', 'Indirect Wealth', 'Direct Wealth', 'Indirect Officer', 'Direct Officer', 'Indirect Resource', 'Direct Resource'] as const;

// 시간별 시주 (지지)
export const HOUR_TO_BRANCH: [number, number, number][] = [
  [23, 1, 0],  [1, 3, 1],  [3, 5, 2],  [5, 7, 3],
  [7, 9, 4],   [9, 11, 5], [11, 13, 6],[13, 15, 7],
  [15, 17, 8], [17, 19, 9],[19, 21, 10],[21, 23, 11],
];

// 절기 데이터 (월주 계산용) - 1900~2100년 절기 근사값
// 각 달의 절입일 (solar term start day, approximate)
export const SOLAR_TERMS_MONTH: number[] = [6, 4, 6, 5, 6, 6, 7, 7, 8, 8, 7, 7];
