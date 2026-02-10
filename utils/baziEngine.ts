
import { 
  HEAVENLY_STEMS, 
  EARTHLY_BRANCHES, 
  ELEMENT_RELATIONS, 
  GOD_RELATIONSHIP, 
  LIFE_STAGES,
  LIFE_STAGES_TABLE,
  STEM_ORDER, 
  BRANCH_ORDER 
} from '../constants.ts';
import type { BaziChart, Pillar, Stem, Branch, ElementType, TenGod, LuckCycle } from '../constants.ts';
import { 
  getMonthBranchBySolarTerm, 
  getYearPillarBySolarTerm,
  getMonthStemIndex,
  getMonthPillarInfo,
  isNearSolarTerm
} from './solarTerms.ts';
import { 
  calculateTrueSolarTime,
  getTrueSolarTimeForCity,
  adjustHourForTrueSolarTime,
  getHourBranchInfo,
  getCorrectionAdvice,
  calculateEquationOfTime
} from './trueSolarTime.ts';
import { 
  getAllDeities,
  getDeitySummary,
  type Deity
} from './deitySystem.ts';

/**
 * 计算十二长生
 * @param dayMasterStem 日元天干字符
 * @param branch 地支字符
 * @returns 十二长生阶段名称
 */
function getLifeStage(dayMasterStem: string, branch: string): string {
  const stageTable = LIFE_STAGES_TABLE[dayMasterStem];
  if (!stageTable) {
    console.warn(`Unknown stem: ${dayMasterStem}`);
    return LIFE_STAGES[0]; // 默认返回长生
  }
  const stageIndex = stageTable[branch];
  if (stageIndex === undefined) {
    console.warn(`Unknown branch: ${branch}`);
    return LIFE_STAGES[0];
  }
  return LIFE_STAGES[stageIndex];
}

export function getTenGod(dayMaster: Stem, targetStemChar: string): TenGod {
  const targetStem = HEAVENLY_STEMS[targetStemChar];
  // @ts-ignore
  const relationType = ELEMENT_RELATIONS[dayMaster.element][targetStem.element];
  const polarityMatch = dayMaster.polarity === targetStem.polarity;
  // @ts-ignore
  const pair = GOD_RELATIONSHIP[relationType];
  return polarityMatch ? pair[0] : pair[1];
}

/**
 * 获取四柱干支（基于节气计算和真太阳时）
 */
function getGanZhi(date: Date, location?: { city?: string; longitude?: number; latitude?: number }) {
  const warnings: string[] = [];
  
  // 1. 计算真太阳时
  let trueSolarDate = date;
  let trueSolarHour = date.getHours();
  let solarTimeInfo = null;
  
  if (location?.city || location?.longitude !== undefined) {
    if (location.city) {
      const result = getTrueSolarTimeForCity(date, location.city);
      trueSolarDate = result.trueSolarTime;
      trueSolarHour = trueSolarDate.getHours();
      solarTimeInfo = result;
      
      if (Math.abs(result.totalDiff) > 5) {
        warnings.push(`真太阳时校正: ${result.totalDiff > 0 ? '晚' : '早'}${Math.abs(result.totalDiff).toFixed(1)}分钟`);
      }
    } else if (location.longitude !== undefined) {
      trueSolarDate = calculateTrueSolarTime(date, location.longitude);
      trueSolarHour = trueSolarDate.getHours();
      const longitudeDiff = (location.longitude - 120) * 4; // 东八区中心经度120°
      const equationOfTime = calculateEquationOfTime(date);
      const totalDiff = longitudeDiff + equationOfTime;
      
      if (Math.abs(totalDiff) > 5) {
        warnings.push(`真太阳时校正: ${totalDiff > 0 ? '晚' : '早'}${Math.abs(totalDiff).toFixed(1)}分钟`);
      }
    }
  }
  
  const year = trueSolarDate.getFullYear();
  const diffDays = Math.floor((trueSolarDate.getTime() - new Date(1900, 0, 1).getTime()) / (1000 * 60 * 60 * 24));

  // 2. 年柱 - 以立春为界
  const { stemIndex: yearStemIndex, branchIndex: yearBranchIndex } = getYearPillarBySolarTerm(trueSolarDate);

  // 3. 月柱 - 以节气为界
  const monthBranch = getMonthBranchBySolarTerm(trueSolarDate);
  const monthBranchIndex = BRANCH_ORDER.indexOf(monthBranch);
  if (monthBranchIndex === -1) {
    throw new Error(`Invalid month branch: ${monthBranch}`);
  }
  
  const monthStemIndex = getMonthStemIndex(yearStemIndex, monthBranchIndex);

  // 4. 日柱 - 按传统公式计算
  const dayOffset = (diffDays + 10) % 60;
  const dayStemIndex = dayOffset % 10;
  const dayBranchIndex = dayOffset % 12;

  // 5. 时柱 - 使用真太阳时计算
  const hourBaseOffset = (dayStemIndex % 5) * 2;
  const hourBranchIndex = Math.floor((trueSolarHour + 1) / 2) % 12;
  const hourStemIndex = (hourBaseOffset + hourBranchIndex) % 10;

  // 6. 检查是否在节气交接期
  const termCheck = isNearSolarTerm(trueSolarDate, 3);
  if (termCheck.isNear) {
    warnings.push(`节气交接期: 在${termCheck.term}节气${Math.abs(termCheck.daysToTerm!)}天内，月柱可能有误`);
  }

  // 7. 检查时辰边界
  const hourInfo = getHourBranchInfo(trueSolarHour);
  if (hourInfo.isBoundary) {
    warnings.push(`时辰边界: 当前时间在${hourInfo.hourRange}边界附近，时柱可能有误`);
  }

  return {
    year: { stem: STEM_ORDER[yearStemIndex], branch: BRANCH_ORDER[yearBranchIndex] },
    month: { stem: STEM_ORDER[monthStemIndex], branch: BRANCH_ORDER[monthBranchIndex] },
    day: { stem: STEM_ORDER[dayStemIndex], branch: BRANCH_ORDER[dayBranchIndex] },
    hour: { stem: STEM_ORDER[hourStemIndex], branch: BRANCH_ORDER[hourBranchIndex] },
    warnings: warnings.length > 0 ? warnings : null,
    solarTimeInfo
  };
}

function calculateElementCounts(pillars: Pillar[]): Record<ElementType, number> {
  const counts: Record<ElementType, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  pillars.forEach(p => {
    counts[p.stem.element]++;
    counts[p.branch.element]++;
  });
  return counts;
}

function determineStrength(counts: Record<ElementType, number>, dayMaster: Stem, monthBranch: Branch): { score: number; verdict: '身强' | '身弱' | '从格' | '中和'; favorable: ElementType[]; unfavorable: ElementType[] } {
  const same = counts[dayMaster.element];
  const resourceEl = Object.entries(ELEMENT_RELATIONS).find(([_, rels]) => rels[dayMaster.element] === 'BirthsMe')?.[0] as ElementType;
  const resource = counts[resourceEl] || 0;
  const score = (same * 10) + (resource * 8);
  
  let verdict: '身强' | '身弱' | '从格' | '中和' = '中和';
  let favorable: ElementType[] = [];
  let unfavorable: ElementType[] = [];

  if (score > 25) {
    verdict = '身强';
    const output = Object.entries(ELEMENT_RELATIONS).find(([key, _]) => ELEMENT_RELATIONS[dayMaster.element][key as ElementType] === 'IBirth')?.[0] as ElementType;
    const wealth = Object.entries(ELEMENT_RELATIONS).find(([key, _]) => ELEMENT_RELATIONS[dayMaster.element][key as ElementType] === 'IControl')?.[0] as ElementType;
    favorable = [output, wealth];
    unfavorable = [dayMaster.element, resourceEl];
  } else {
    verdict = '身弱';
    favorable = [dayMaster.element, resourceEl];
    unfavorable = [
        Object.entries(ELEMENT_RELATIONS).find(([key, _]) => ELEMENT_RELATIONS[dayMaster.element][key as ElementType] === 'IControl')?.[0] as ElementType,
        Object.entries(ELEMENT_RELATIONS).find(([key, _]) => ELEMENT_RELATIONS[dayMaster.element][key as ElementType] === 'ControlsMe')?.[0] as ElementType
    ];
  }
  return { score, verdict, favorable, unfavorable };
}

function generateLuckCycles(monthPillar: {stem: string, branch: string}, gender: 'male' | 'female', yearStemPolarity: '阴' | '阳'): LuckCycle[] {
  const isForward = (gender === 'male' && yearStemPolarity === '阳') || (gender === 'female' && yearStemPolarity === '阴');
  const cycles: LuckCycle[] = [];
  let currentStemIdx = STEM_ORDER.indexOf(monthPillar.stem);
  let currentBranchIdx = BRANCH_ORDER.indexOf(monthPillar.branch);

  for (let i = 1; i <= 8; i++) {
    if (isForward) {
      currentStemIdx = (currentStemIdx + 1) % 10;
      currentBranchIdx = (currentBranchIdx + 1) % 12;
    } else {
      currentStemIdx = (currentStemIdx - 1 + 10) % 10;
      currentBranchIdx = (currentBranchIdx - 1 + 12) % 12;
    }
    cycles.push({
      startAge: i * 10,
      stem: HEAVENLY_STEMS[STEM_ORDER[currentStemIdx]],
      branch: EARTHLY_BRANCHES[BRANCH_ORDER[currentBranchIdx]],
      tenGod: '比肩' 
    });
  }
  return cycles;
}

export function generateBaziChart(
  name: string,
  gender: 'male' | 'female',
  date: Date,
  location?: { city?: string; longitude?: number; latitude?: number }
): BaziChart {
  const gz = getGanZhi(date, location);
  const dayMaster = HEAVENLY_STEMS[gz.day.stem];
  const yearStemObj = HEAVENLY_STEMS[gz.year.stem];
  
  const createPillarStub = (s: string, b: string): Pillar => ({
    stem: HEAVENLY_STEMS[s],
    branch: EARTHLY_BRANCHES[b],
    tenGod: getTenGod(dayMaster, s),
    hiddenGods: EARTHLY_BRANCHES[b].hiddenStems.map(hs => getTenGod(dayMaster, hs)),
    lifeStage: getLifeStage(dayMaster.char, b)  // 使用正确的十二长生计算
  });

  const yearPillar = createPillarStub(gz.year.stem, gz.year.branch);
  const monthPillar = createPillarStub(gz.month.stem, gz.month.branch);
  const dayPillar = createPillarStub(gz.day.stem, gz.day.branch);
  const hourPillar = createPillarStub(gz.hour.stem, gz.hour.branch);

  const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];
  const counts = calculateElementCounts(pillars);
  const strength = determineStrength(counts, dayMaster, monthPillar.branch);
  const luckCycles = generateLuckCycles(gz.month, gender, yearStemObj.polarity);
  
  luckCycles.forEach(lc => {
    lc.tenGod = getTenGod(dayMaster, lc.stem.char);
  });

  const warnings: string[] = [];
  if (gz.warnings) {
    warnings.push(...gz.warnings);
  }

  // 计算神煞
  const pillarsForDeity = [
    { stem: gz.year.stem, branch: gz.year.branch },
    { stem: gz.month.stem, branch: gz.month.branch },
    { stem: gz.day.stem, branch: gz.day.branch },
    { stem: gz.hour.stem, branch: gz.hour.branch }
  ];
  const deities = getAllDeities(dayMaster, gz.year.branch, pillarsForDeity);

  return {
    id: Date.now().toString(),
    name,
    gender,
    birthDate: date.toISOString(),
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster,
    elementCounts: counts,
    strength,
    luckCycles,
    warnings: warnings.length > 0 ? warnings : undefined,
    deities: deities.length > 0 ? deities : undefined
  };
}
