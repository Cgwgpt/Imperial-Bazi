/**
 * 神煞系统
 * 
 * 八字命理中的神煞系统包括：
 * 1. 天乙贵人 - 贵人星
 * 2. 文昌贵人 - 文星
 * 3. 桃花 - 异性缘
 * 4. 驿马 - 变动星
 * 5. 华盖 - 艺术宗教星
 * 6. 将星 - 领导力星
 * 7. 羊刃 - 强势星
 * 8. 亡神 - 灾星
 * 9. 劫煞 - 破财星
 * 10. 灾煞 - 灾祸星
 */

import { HEAVENLY_STEMS, EARTHLY_BRANCHES, STEM_ORDER, BRANCH_ORDER } from '../constants.ts';
import type { Stem, Branch } from '../constants.ts';

export type DeityType = 
  | '天乙贵人' | '文昌贵人' | '桃花' | '驿马' | '华盖' 
  | '将星' | '羊刃' | '亡神' | '劫煞' | '灾煞'
  | '天德贵人' | '月德贵人' | '福星贵人' | '太极贵人'
  | '红鸾' | '天喜' | '孤辰' | '寡宿';

export interface Deity {
  type: DeityType;
  description: string;
  influence: '吉' | '凶' | '平';
  position: '年' | '月' | '日' | '时' | '全局';
}

/**
 * 天乙贵人查找表
 * 口诀：甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，六辛逢马虎
 */
const TIANYI_GUI_REN_TABLE: Record<string, string[]> = {
  '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
  '乙': ['子', '申'], '己': ['子', '申'],
  '丙': ['亥', '酉'], '丁': ['亥', '酉'],
  '壬': ['卯', '巳'], '癸': ['卯', '巳'],
  '辛': ['午', '寅']
};

/**
 * 文昌贵人查找表
 * 口诀：甲乙巳午报君知，丙戊申宫丁己鸡，庚猪辛鼠壬逢虎，癸人见卯入云梯
 */
const WENCHANG_GUI_REN_TABLE: Record<string, string[]> = {
  '甲': ['巳'], '乙': ['午'],
  '丙': ['申'], '戊': ['申'],
  '丁': ['酉'], '己': ['酉'],
  '庚': ['亥'], '辛': ['子'],
  '壬': ['寅'], '癸': ['卯']
};

/**
 * 桃花查找表
 * 口诀：申子辰在酉，寅午戌在卯，巳酉丑在午，亥卯未在子
 */
const TAOHUA_TABLE: Record<string, string[]> = {
  '申': ['酉'], '子': ['酉'], '辰': ['酉'],
  '寅': ['卯'], '午': ['卯'], '戌': ['卯'],
  '巳': ['午'], '酉': ['午'], '丑': ['午'],
  '亥': ['子'], '卯': ['子'], '未': ['子']
};

/**
 * 驿马查找表
 * 口诀：申子辰马在寅，寅午戌马在申，巳酉丑马在亥，亥卯未马在巳
 */
const YIMA_TABLE: Record<string, string[]> = {
  '申': ['寅'], '子': ['寅'], '辰': ['寅'],
  '寅': ['申'], '午': ['申'], '戌': ['申'],
  '巳': ['亥'], '酉': ['亥'], '丑': ['亥'],
  '亥': ['巳'], '卯': ['巳'], '未': ['巳']
};

/**
 * 华盖查找表
 * 口诀：寅午戌见戌，亥卯未见未，申子辰见辰，巳酉丑见丑
 */
const HUAGAI_TABLE: Record<string, string[]> = {
  '寅': ['戌'], '午': ['戌'], '戌': ['戌'],
  '亥': ['未'], '卯': ['未'], '未': ['未'],
  '申': ['辰'], '子': ['辰'], '辰': ['辰'],
  '巳': ['丑'], '酉': ['丑'], '丑': ['丑']
};

/**
 * 将星查找表
 * 口诀：寅午戌见午，申子辰见子，巳酉丑见酉，亥卯未见卯
 */
const JIANGXING_TABLE: Record<string, string[]> = {
  '寅': ['午'], '午': ['午'], '戌': ['午'],
  '申': ['子'], '子': ['子'], '辰': ['子'],
  '巳': ['酉'], '酉': ['酉'], '丑': ['酉'],
  '亥': ['卯'], '卯': ['卯'], '未': ['卯']
};

/**
 * 羊刃查找表
 * 阳干：甲见卯，丙戊见午，庚见酉，壬见子
 * 阴干：乙见寅，丁己见巳，辛见申，癸见亥
 */
const YANGREN_TABLE: Record<string, string[]> = {
  '甲': ['卯'], '丙': ['午'], '戊': ['午'], '庚': ['酉'], '壬': ['子'],
  '乙': ['寅'], '丁': ['巳'], '己': ['巳'], '辛': ['申'], '癸': ['亥']
};

/**
 * 检查天乙贵人
 */
export function checkTianYiGuiRen(dayMaster: Stem, pillars: { stem: string; branch: string }[]): Deity[] {
  const deities: Deity[] = [];
  const guiRenBranches = TIANYI_GUI_REN_TABLE[dayMaster.char] || [];
  
  pillars.forEach((pillar, index) => {
    const position = ['年', '月', '日', '时'][index] as '年' | '月' | '日' | '时';
    if (guiRenBranches.includes(pillar.branch)) {
      deities.push({
        type: '天乙贵人',
        description: `天乙贵人出现在${position}柱，主贵人相助，逢凶化吉`,
        influence: '吉',
        position
      });
    }
  });
  
  return deities;
}

/**
 * 检查文昌贵人
 */
export function checkWenChangGuiRen(dayMaster: Stem, pillars: { stem: string; branch: string }[]): Deity[] {
  const deities: Deity[] = [];
  const wenChangBranches = WENCHANG_GUI_REN_TABLE[dayMaster.char] || [];
  
  pillars.forEach((pillar, index) => {
    const position = ['年', '月', '日', '时'][index] as '年' | '月' | '日' | '时';
    if (wenChangBranches.includes(pillar.branch)) {
      deities.push({
        type: '文昌贵人',
        description: `文昌贵人出现在${position}柱，主聪明好学，文采出众`,
        influence: '吉',
        position
      });
    }
  });
  
  return deities;
}

/**
 * 检查桃花
 */
export function checkTaoHua(yearBranch: string, pillars: { stem: string; branch: string }[]): Deity[] {
  const deities: Deity[] = [];
  const taoHuaBranches = TAOHUA_TABLE[yearBranch] || [];
  
  pillars.forEach((pillar, index) => {
    const position = ['年', '月', '日', '时'][index] as '年' | '月' | '日' | '时';
    if (taoHuaBranches.includes(pillar.branch)) {
      deities.push({
        type: '桃花',
        description: `桃花出现在${position}柱，主人缘佳，异性缘好`,
        influence: taoHuaBranches.includes(pillar.stem) ? '吉' : '平',
        position
      });
    }
  });
  
  return deities;
}

/**
 * 检查驿马
 */
export function checkYiMa(yearBranch: string, pillars: { stem: string; branch: string }[]): Deity[] {
  const deities: Deity[] = [];
  const yiMaBranches = YIMA_TABLE[yearBranch] || [];
  
  pillars.forEach((pillar, index) => {
    const position = ['年', '月', '日', '时'][index] as '年' | '月' | '日' | '时';
    if (yiMaBranches.includes(pillar.branch)) {
      deities.push({
        type: '驿马',
        description: `驿马出现在${position}柱，主变动、旅行、搬迁`,
        influence: '平',
        position
      });
    }
  });
  
  return deities;
}

/**
 * 检查华盖
 */
export function checkHuaGai(yearBranch: string, pillars: { stem: string; branch: string }[]): Deity[] {
  const deities: Deity[] = [];
  const huaGaiBranches = HUAGAI_TABLE[yearBranch] || [];
  
  pillars.forEach((pillar, index) => {
    const position = ['年', '月', '日', '时'][index] as '年' | '月' | '日' | '时';
    if (huaGaiBranches.includes(pillar.branch)) {
      deities.push({
        type: '华盖',
        description: `华盖出现在${position}柱，主艺术天赋、宗教缘分、孤独`,
        influence: '平',
        position
      });
    }
  });
  
  return deities;
}

/**
 * 检查将星
 */
export function checkJiangXing(yearBranch: string, pillars: { stem: string; branch: string }[]): Deity[] {
  const deities: Deity[] = [];
  const jiangXingBranches = JIANGXING_TABLE[yearBranch] || [];
  
  pillars.forEach((pillar, index) => {
    const position = ['年', '月', '日', '时'][index] as '年' | '月' | '日' | '时';
    if (jiangXingBranches.includes(pillar.branch)) {
      deities.push({
        type: '将星',
        description: `将星出现在${position}柱，主领导才能、权威`,
        influence: '吉',
        position
      });
    }
  });
  
  return deities;
}

/**
 * 检查羊刃
 */
export function checkYangRen(dayMaster: Stem, pillars: { stem: string; branch: string }[]): Deity[] {
  const deities: Deity[] = [];
  const yangRenBranches = YANGREN_TABLE[dayMaster.char] || [];
  
  pillars.forEach((pillar, index) => {
    const position = ['年', '月', '日', '时'][index] as '年' | '月' | '日' | '时';
    if (yangRenBranches.includes(pillar.branch)) {
      deities.push({
        type: '羊刃',
        description: `羊刃出现在${position}柱，主强势、暴躁、易受伤`,
        influence: '凶',
        position
      });
    }
  });
  
  return deities;
}

/**
 * 检查亡神（根据年支）
 * 口诀：申子辰见亥，寅午戌见巳，巳酉丑见申，亥卯未见寅
 */
export function checkWangShen(yearBranch: string, pillars: { stem: string; branch: string }[]): Deity[] {
  const wangShenMap: Record<string, string[]> = {
    '申': ['亥'], '子': ['亥'], '辰': ['亥'],
    '寅': ['巳'], '午': ['巳'], '戌': ['巳'],
    '巳': ['申'], '酉': ['申'], '丑': ['申'],
    '亥': ['寅'], '卯': ['寅'], '未': ['寅']
  };
  
  const deities: Deity[] = [];
  const wangShenBranches = wangShenMap[yearBranch] || [];
  
  pillars.forEach((pillar, index) => {
    const position = ['年', '月', '日', '时'][index] as '年' | '月' | '日' | '时';
    if (wangShenBranches.includes(pillar.branch)) {
      deities.push({
        type: '亡神',
        description: `亡神出现在${position}柱，主灾祸、官非、破财`,
        influence: '凶',
        position
      });
    }
  });
  
  return deities;
}

/**
 * 检查劫煞（根据年支）
 * 口诀：申子辰见巳，寅午戌见亥，巳酉丑见寅，亥卯未见申
 */
export function checkJieSha(yearBranch: string, pillars: { stem: string; branch: string }[]): Deity[] {
  const jieShaMap: Record<string, string[]> = {
    '申': ['巳'], '子': ['巳'], '辰': ['巳'],
    '寅': ['亥'], '午': ['亥'], '戌': ['亥'],
    '巳': ['寅'], '酉': ['寅'], '丑': ['寅'],
    '亥': ['申'], '卯': ['申'], '未': ['申']
  };
  
  const deities: Deity[] = [];
  const jieShaBranches = jieShaMap[yearBranch] || [];
  
  pillars.forEach((pillar, index) => {
    const position = ['年', '月', '日', '时'][index] as '年' | '月' | '日' | '时';
    if (jieShaBranches.includes(pillar.branch)) {
      deities.push({
        type: '劫煞',
        description: `劫煞出现在${position}柱，主破财、小人、意外`,
        influence: '凶',
        position
      });
    }
  });
  
  return deities;
}

/**
 * 检查灾煞（根据年支）
 * 口诀：申子辰见午，寅午戌见子，巳酉丑见卯，亥卯未见酉
 */
export function checkZaiSha(yearBranch: string, pillars: { stem: string; branch: string }[]): Deity[] {
  const zaiShaMap: Record<string, string[]> = {
    '申': ['午'], '子': ['午'], '辰': ['午'],
    '寅': ['子'], '午': ['子'], '戌': ['子'],
    '巳': ['卯'], '酉': ['卯'], '丑': ['卯'],
    '亥': ['酉'], '卯': ['酉'], '未': ['酉']
  };
  
  const deities: Deity[] = [];
  const zaiShaBranches = zaiShaMap[yearBranch] || [];
  
  pillars.forEach((pillar, index) => {
    const position = ['年', '月', '日', '时'][index] as '年' | '月' | '日' | '时';
    if (zaiShaBranches.includes(pillar.branch)) {
      deities.push({
        type: '灾煞',
        description: `灾煞出现在${position}柱，主疾病、意外、灾祸`,
        influence: '凶',
        position
      });
    }
  });
  
  return deities;
}

/**
 * 综合检查所有神煞
 */
export function getAllDeities(
  dayMaster: Stem,
  yearBranch: string,
  pillars: { stem: string; branch: string }[]
): Deity[] {
  const deities: Deity[] = [];
  
  deities.push(...checkTianYiGuiRen(dayMaster, pillars));
  deities.push(...checkWenChangGuiRen(dayMaster, pillars));
  deities.push(...checkTaoHua(yearBranch, pillars));
  deities.push(...checkYiMa(yearBranch, pillars));
  deities.push(...checkHuaGai(yearBranch, pillars));
  deities.push(...checkJiangXing(yearBranch, pillars));
  deities.push(...checkYangRen(dayMaster, pillars));
  deities.push(...checkWangShen(yearBranch, pillars));
  deities.push(...checkJieSha(yearBranch, pillars));
  deities.push(...checkZaiSha(yearBranch, pillars));
  
  return deities;
}

/**
 * 统计神煞吉凶数量
 */
export function countDeityInfluences(deities: Deity[]): { auspicious: number; inauspicious: number; neutral: number } {
  return {
    auspicious: deities.filter(d => d.influence === '吉').length,
    inauspicious: deities.filter(d => d.influence === '凶').length,
    neutral: deities.filter(d => d.influence === '平').length
  };
}

/**
 * 获取神煞分析总结
 */
export function getDeitySummary(deities: Deity[]): string {
  const counts = countDeityInfluences(deities);
  const auspiciousNames = deities.filter(d => d.influence === '吉').map(d => d.type).join('、');
  const inauspiciousNames = deities.filter(d => d.influence === '凶').map(d => d.type).join('、');
  
  let summary = `命带${deities.length}个神煞：`;
  
  if (counts.auspicious > 0) {
    summary += `吉神${counts.auspicious}个（${auspiciousNames}）`;
  }
  
  if (counts.inauspicious > 0) {
    if (counts.auspicious > 0) summary += '，';
    summary += `凶煞${counts.inauspicious}个（${inauspiciousNames}）`;
  }
  
  if (counts.neutral > 0) {
    if (counts.auspicious > 0 || counts.inauspicious > 0) summary += '，';
    summary += `中性神煞${counts.neutral}个`;
  }
  
  return summary;
}