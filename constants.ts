
export type ElementType = '木' | '火' | '土' | '金' | '水';
export type Polarity = '阴' | '阳';
export type TenGod = '比肩' | '劫财' | '食神' | '伤官' | '偏财' | '正财' | '七杀' | '正官' | '偏印' | '正印';

export interface Stem {
  char: string;
  element: ElementType;
  polarity: Polarity;
}

export interface Branch {
  char: string;
  element: ElementType;
  polarity: Polarity;
  hiddenStems: string[];
  zodiac: string;
}

export interface Pillar {
  stem: Stem;
  branch: Branch;
  tenGod: TenGod;
  hiddenGods: TenGod[];
  lifeStage: string;
}

export interface Deity {
  type: string;
  description: string;
  influence: '吉' | '凶' | '平';
  position: '年' | '月' | '日' | '时' | '全局';
}

export interface BaziChart {
  id: string;
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;
  dayMaster: Stem;
  elementCounts: Record<ElementType, number>;
  strength: {
    score: number;
    verdict: '身强' | '身弱' | '从格' | '中和';
    favorable: ElementType[];
    unfavorable: ElementType[];
  };
  luckCycles: LuckCycle[];
  warnings?: string[]; // 警告信息，如节气交接期
  deities?: Deity[]; // 神煞信息
}

export interface LuckCycle {
  startAge: number;
  stem: Stem;
  branch: Branch;
  tenGod: TenGod;
}

export const HEAVENLY_STEMS: Record<string, Stem> = {
  '甲': { char: '甲', element: '木', polarity: '阳' },
  '乙': { char: '乙', element: '木', polarity: '阴' },
  '丙': { char: '丙', element: '火', polarity: '阳' },
  '丁': { char: '丁', element: '火', polarity: '阴' },
  '戊': { char: '戊', element: '土', polarity: '阳' },
  '己': { char: '己', element: '土', polarity: '阴' },
  '庚': { char: '庚', element: '金', polarity: '阳' },
  '辛': { char: '辛', element: '金', polarity: '阴' },
  '壬': { char: '壬', element: '水', polarity: '阳' },
  '癸': { char: '癸', element: '水', polarity: '阴' },
};

export const EARTHLY_BRANCHES: Record<string, Branch> = {
  '子': { char: '子', element: '水', polarity: '阳', hiddenStems: ['癸'], zodiac: '鼠' },
  '丑': { char: '丑', element: '土', polarity: '阴', hiddenStems: ['己', '癸', '辛'], zodiac: '牛' },
  '寅': { char: '寅', element: '木', polarity: '阳', hiddenStems: ['甲', '丙', '戊'], zodiac: '虎' },
  '卯': { char: '卯', element: '木', polarity: '阴', hiddenStems: ['乙'], zodiac: '兔' },
  '辰': { char: '辰', element: '土', polarity: '阳', hiddenStems: ['戊', '乙', '癸'], zodiac: '龙' },
  '巳': { char: '巳', element: '火', polarity: '阴', hiddenStems: ['丙', '庚', '戊'], zodiac: '蛇' },
  '午': { char: '午', element: '火', polarity: '阳', hiddenStems: ['丁', '己'], zodiac: '马' },
  '未': { char: '未', element: '土', polarity: '阴', hiddenStems: ['己', '丁', '乙'], zodiac: '羊' },
  '申': { char: '申', element: '金', polarity: '阳', hiddenStems: ['庚', '壬', '戊'], zodiac: '猴' },
  '酉': { char: '酉', element: '金', polarity: '阴', hiddenStems: ['辛'], zodiac: '鸡' },
  '戌': { char: '戌', element: '土', polarity: '阳', hiddenStems: ['戊', '辛', '丁'], zodiac: '狗' },
  '亥': { char: '亥', element: '水', polarity: '阴', hiddenStems: ['壬', '甲'], zodiac: '猪' },
};

export const STEM_ORDER = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const BRANCH_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export const ELEMENT_COLORS: Record<ElementType, string> = {
  '木': 'text-emerald-600',
  '火': 'text-rose-600',
  '土': 'text-amber-700',
  '金': 'text-slate-500',
  '水': 'text-sky-600',
};

export const ELEMENT_BG: Record<ElementType, string> = {
  '木': 'bg-emerald-600',
  '火': 'bg-rose-600',
  '土': 'bg-amber-700',
  '金': 'bg-slate-500',
  '水': 'bg-sky-600',
};

export const GOD_RELATIONSHIP: Record<string, [TenGod, TenGod]> = {
  'Same': ['比肩', '劫财'],
  'BirthsMe': ['偏印', '正印'],
  'IBirth': ['食神', '伤官'],
  'IControl': ['偏财', '正财'],
  'ControlsMe': ['七杀', '正官'],
};

export const ELEMENT_RELATIONS = {
  '木': { '木': 'Same', '火': 'IBirth', '土': 'IControl', '金': 'ControlsMe', '水': 'BirthsMe' },
  '火': { '火': 'Same', '土': 'IBirth', '金': 'IControl', '水': 'ControlsMe', '木': 'BirthsMe' },
  '土': { '土': 'Same', '金': 'IBirth', '水': 'IControl', '木': 'ControlsMe', '火': 'BirthsMe' },
  '金': { '金': 'Same', '水': 'IBirth', '木': 'IControl', '火': 'ControlsMe', '土': 'BirthsMe' },
  '水': { '水': 'Same', '木': 'IBirth', '火': 'IControl', '土': 'ControlsMe', '金': 'BirthsMe' },
};

export const LIFE_STAGES = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];

// 十二长生推算表
// 阳干顺行，阴干逆行
// 格式: { 天干: { 地支: 长生阶段索引 } }
export const LIFE_STAGES_TABLE: Record<string, Record<string, number>> = {
  // 阳干 (顺行)
  '甲': { '亥': 0, '子': 1, '丑': 2, '寅': 3, '卯': 4, '辰': 5, '巳': 6, '午': 7, '未': 8, '申': 9, '酉': 10, '戌': 11 }, // 阳木
  '丙': { '寅': 0, '卯': 1, '辰': 2, '巳': 3, '午': 4, '未': 5, '申': 6, '酉': 7, '戌': 8, '亥': 9, '子': 10, '丑': 11 }, // 阳火 (戊土同)
  '戊': { '寅': 0, '卯': 1, '辰': 2, '巳': 3, '午': 4, '未': 5, '申': 6, '酉': 7, '戌': 8, '亥': 9, '子': 10, '丑': 11 }, // 阳土 (随火)
  '庚': { '巳': 0, '午': 1, '未': 2, '申': 3, '酉': 4, '戌': 5, '亥': 6, '子': 7, '丑': 8, '寅': 9, '卯': 10, '辰': 11 }, // 阳金
  '壬': { '申': 0, '酉': 1, '戌': 2, '亥': 3, '子': 4, '丑': 5, '寅': 6, '卯': 7, '辰': 8, '巳': 9, '午': 10, '未': 11 }, // 阳水
  
  // 阴干 (逆行)
  '乙': { '午': 0, '巳': 1, '辰': 2, '卯': 3, '寅': 4, '丑': 5, '子': 6, '亥': 7, '戌': 8, '酉': 9, '申': 10, '未': 11 }, // 阴木
  '丁': { '酉': 0, '申': 1, '未': 2, '午': 3, '巳': 4, '辰': 5, '卯': 6, '寅': 7, '丑': 8, '子': 9, '亥': 10, '戌': 11 }, // 阴火 (己土同)
  '己': { '酉': 0, '申': 1, '未': 2, '午': 3, '巳': 4, '辰': 5, '卯': 6, '寅': 7, '丑': 8, '子': 9, '亥': 10, '戌': 11 }, // 阴土 (随火)
  '辛': { '子': 0, '亥': 1, '戌': 2, '酉': 3, '申': 4, '未': 5, '午': 6, '巳': 7, '辰': 8, '卯': 9, '寅': 10, '丑': 11 }, // 阴金
  '癸': { '卯': 0, '寅': 1, '丑': 2, '子': 3, '亥': 4, '戌': 5, '酉': 6, '申': 7, '未': 8, '午': 9, '巳': 10, '辰': 11 }, // 阴水
};
