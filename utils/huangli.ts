/**
 * 黄历工具模块
 * 包含吉神凶煞、胎神、彭祖百忌、纳音、冲煞、星宿等传统黄历信息
 */

import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from '../constants.ts';

// 二十八星宿
const TWENTY_EIGHT_STARS = [
  '角', '亢', '氐', '房', '心', '尾', '箕',  // 东方青龙
  '斗', '牛', '女', '虚', '危', '室', '壁',  // 北方玄武
  '奎', '娄', '胃', '昴', '毕', '觜', '参',  // 西方白虎
  '井', '鬼', '柳', '星', '张', '翼', '轸'   // 南方朱雀
];

// 星宿吉凶
const STAR_FORTUNE: Record<string, string> = {
  '角': '吉', '亢': '凶', '氐': '凶', '房': '吉', '心': '凶', '尾': '吉', '箕': '吉',
  '斗': '吉', '牛': '凶', '女': '凶', '虚': '凶', '危': '凶', '室': '吉', '壁': '吉',
  '奎': '凶', '娄': '吉', '胃': '吉', '昴': '凶', '毕': '吉', '觜': '凶', '参': '吉',
  '井': '吉', '鬼': '凶', '柳': '凶', '星': '凶', '张': '吉', '翼': '凶', '轸': '吉'
};

// 六十甲子纳音
const NAYIN_60 = [
  '海中金', '海中金', '炉中火', '炉中火', '大林木', '大林木', '路旁土', '路旁土', '剑锋金', '剑锋金',
  '山头火', '山头火', '涧下水', '涧下水', '城头土', '城头土', '白蜡金', '白蜡金', '杨柳木', '杨柳木',
  '泉中水', '泉中水', '屋上土', '屋上土', '霹雳火', '霹雳火', '松柏木', '松柏木', '长流水', '长流水',
  '沙中金', '沙中金', '山下火', '山下火', '平地木', '平地木', '壁上土', '壁上土', '金箔金', '金箔金',
  '覆灯火', '覆灯火', '天河水', '天河水', '大驿土', '大驿土', '钗钏金', '钗钏金', '桑柘木', '桑柘木',
  '大溪水', '大溪水', '沙中土', '沙中土', '天上火', '天上火', '石榴木', '石榴木', '大海水', '大海水'
];

// 建除十二神
const TWELVE_GODS = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'];

// 十二神吉凶
const TWELVE_GODS_FORTUNE: Record<string, { suitable: string[]; avoid: string[] }> = {
  '建': { suitable: ['出行', '上任', '会友', '上书', '见工'], avoid: ['动土', '开仓', '嫁娶', '纳采'] },
  '除': { suitable: ['除服', '疗病', '出行', '拆卸', '入宅'], avoid: ['求官', '上任', '嫁娶'] },
  '满': { suitable: ['祈福', '祭祀', '结亲', '开市', '交易'], avoid: ['服药', '求医', '栽种', '下葬'] },
  '平': { suitable: ['祭祀', '修填', '涂泥', '余事勿取'], avoid: ['诸事不宜'] },
  '定': { suitable: ['祭祀', '祈福', '订盟', '纳采', '冠笄'], avoid: ['诉讼', '出行', '安葬'] },
  '执': { suitable: ['祭祀', '祈福', '求医', '捕捉', '畋猎'], avoid: ['移徙', '出行', '嫁娶'] },
  '破': { suitable: ['破屋', '坏垣', '求医', '治病'], avoid: ['诸事不宜'] },
  '危': { suitable: ['安床', '经络', '酝酿', '造仓'], avoid: ['登高', '出行', '乘船'] },
  '成': { suitable: ['开市', '交易', '纳财', '开仓', '出货'], avoid: ['诉讼', '安葬'] },
  '收': { suitable: ['祭祀', '求财', '签约', '嫁娶', '订盟'], avoid: ['开市', '安葬', '动土'] },
  '开': { suitable: ['开市', '交易', '求财', '见贵', '嫁娶'], avoid: ['安葬', '修坟'] },
  '闭': { suitable: ['祭祀', '祈福', '筑堤', '埋葬', '余事勿取'], avoid: ['开市', '出行', '求财'] }
};

// 彭祖百忌（完整版）
const PENGZU_TABOO: Record<string, { stem: string; branch: string }> = {
  '甲': { stem: '甲不开仓财物耗散', branch: '子不问卜自惹祸殃' },
  '乙': { stem: '乙不栽植千株不长', branch: '丑不冠带主不还乡' },
  '丙': { stem: '丙不修灶必见灾殃', branch: '寅不祭祀神鬼不尝' },
  '丁': { stem: '丁不剃头头必生疮', branch: '卯不穿井水泉不香' },
  '戊': { stem: '戊不受田田主不祥', branch: '辰不哭泣必主重丧' },
  '己': { stem: '己不破券二比并亡', branch: '巳不远行财物伏藏' },
  '庚': { stem: '庚不经络织机虚张', branch: '午不苫盖屋主更张' },
  '辛': { stem: '辛不合酱主人不尝', branch: '未不服药毒气入肠' },
  '壬': { stem: '壬不汲水更难提防', branch: '申不安床鬼祟入房' },
  '癸': { stem: '癸不词讼理弱敌强', branch: '酉不会客醉坐颠狂' },
  '子': { stem: '甲不开仓财物耗散', branch: '子不问卜自惹祸殃' },
  '丑': { stem: '乙不栽植千株不长', branch: '丑不冠带主不还乡' },
  '寅': { stem: '丙不修灶必见灾殃', branch: '寅不祭祀神鬼不尝' },
  '卯': { stem: '丁不剃头头必生疮', branch: '卯不穿井水泉不香' },
  '辰': { stem: '戊不受田田主不祥', branch: '辰不哭泣必主重丧' },
  '巳': { stem: '己不破券二比并亡', branch: '巳不远行财物伏藏' },
  '午': { stem: '庚不经络织机虚张', branch: '午不苫盖屋主更张' },
  '未': { stem: '辛不合酱主人不尝', branch: '未不服药毒气入肠' },
  '申': { stem: '壬不汲水更难提防', branch: '申不安床鬼祟入房' },
  '酉': { stem: '癸不词讼理弱敌强', branch: '酉不会客醉坐颠狂' },
  '戌': { stem: '', branch: '戌不吃犬作怪上床' },
  '亥': { stem: '', branch: '亥不嫁娶不利新郎' }
};

// 吉神宜趋（完整版）
const AUSPICIOUS_GODS = [
  '天德', '月德', '天德合', '月德合', '天赦', '天愿', '月恩', '四相', '时德', '民日',
  '三合', '临日', '天马', '时阳', '生气', '益后', '青龙', '明堂', '金匮', '天喜',
  '福生', '续世', '阳德', '阴德', '司命', '鸣吠', '鸣吠对', '母仓', '不将', '五富',
  '圣心', '普护', '六仪', '玉宇', '解神', '驿马', '天后', '天巫', '月空', '敬安'
];

// 吉神描述
const AUSPICIOUS_GODS_DESC: Record<string, string> = {
  '天德': '上天之德，百事皆宜',
  '月德': '月亮之德，逢凶化吉',
  '天赦': '上天赦免，消灾解厄',
  '天愿': '天遂人愿，心想事成',
  '三合': '三方和合，贵人相助',
  '青龙': '吉神之首，万事大吉',
  '明堂': '光明正大，公正无私',
  '金匮': '财富丰盈，聚财纳福',
  '天喜': '喜庆之神，婚姻美满',
  '生气': '生机勃勃，活力充沛'
};

// 凶神宜忌（完整版）
const INAUSPICIOUS_GODS = [
  '月破', '大耗', '灾煞', '天火', '厌对', '招摇', '血忌', '天贼', '五虚', '土符',
  '归忌', '血支', '游祸', '重日', '天牢', '往亡', '月煞', '月虚', '四击', '九空',
  '天刑', '天吏', '致死', '五墓', '白虎', '大煞', '劫煞', '地囊', '天狗', '土瘟',
  '刀砧', '河魁', '往亡', '死神', '孤辰', '寡宿', '勾陈', '元武', '朱雀', '螣蛇'
];

// 凶神描述
const INAUSPICIOUS_GODS_DESC: Record<string, string> = {
  '月破': '月亮破损，诸事不宜',
  '大耗': '大耗钱财，破财之兆',
  '灾煞': '灾祸降临，小心意外',
  '血忌': '忌见血光，手术不宜',
  '白虎': '凶神之首，主伤灾病',
  '天狗': '天狗食日，易生口舌',
  '劫煞': '劫财之煞，防偷防盗',
  '死神': '死亡之神，疾病凶险',
  '勾陈': '纠缠不清，官司是非'
};

// 胎神占方（简化版）
const FETAL_GOD_POSITIONS = [
  '占门碓外东南', '碓磨厕外东南', '厨灶炉外正南', '仓库门外正南', '房床栖外正南',
  '占房床外正南', '占碓磨外正南', '厨灶厕外西南', '仓库炉外西南', '房床门外西南',
  '门鸡栖外西南', '碓磨床外西南', '厨灶碓外正西', '仓库厕外正西', '房床炉外正西',
  '占大门外西北', '碓磨栖外西北', '厨灶床外西北', '仓库碓外西北', '房床厕外西北',
  '占房炉外正北', '碓磨门外正北', '厨灶栖外正北', '仓库床外正北', '房床碓外正北',
  '占门厕外东北', '碓磨炉外东北', '厨灶门外东北', '仓库栖外东北', '房床床外东北',
  '占房碓外正东', '碓磨厕外正东', '厨灶炉外正东', '仓库门外正东', '房床栖外正东',
  '占门床外东南', '碓磨碓外东南', '厨灶厕外东南', '仓库炉外东南', '房床门外东南',
  '占房栖外正南', '碓磨床外正南', '厨灶碓外正南', '仓库厕外正南', '房床炉外正南',
  '占大门外西南', '碓磨栖外西南', '厨灶床外西南', '仓库碓外西南', '房床厕外西南',
  '占房炉外正西', '碓磨门外正西', '厨灶栖外正西', '仓库床外正西', '房床碓外正西',
  '占门厕外西北', '碓磨炉外西北', '厨灶门外西北', '仓库栖外西北', '房床床外西北'
];

/**
 * 获取日期的值日星宿
 */
export function getDayStar(date: Date): { name: string; fortune: string } {
  const baseDate = new Date(2000, 0, 1); // 2000年1月1日是角宿
  const days = Math.floor((date.getTime() - baseDate.getTime()) / 86400000);
  const starIndex = (days % 28 + 28) % 28;
  const starName = TWENTY_EIGHT_STARS[starIndex];
  return {
    name: starName,
    fortune: STAR_FORTUNE[starName]
  };
}

/**
 * 获取日期的建除十二神
 */
export function getTwelveGod(monthBranch: string, dayBranch: string): string {
  const monthIndex = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'].indexOf(monthBranch);
  const dayIndex = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'].indexOf(dayBranch);
  const godIndex = (dayIndex - monthIndex + 12) % 12;
  return TWELVE_GODS[godIndex];
}

/**
 * 获取建除十二神的宜忌
 */
export function getTwelveGodAdvice(god: string): { suitable: string[]; avoid: string[] } {
  return TWELVE_GODS_FORTUNE[god] || { suitable: [], avoid: [] };
}

/**
 * 获取六十甲子纳音
 */
export function getNayin(stem: string, branch: string): string {
  const stemIndex = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(stem);
  const branchIndex = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(branch);
  const index = stemIndex * 6 + Math.floor(branchIndex / 2);
  return NAYIN_60[index];
}

/**
 * 获取彭祖百忌
 */
export function getPengzuTaboo(dayStem: string, dayBranch: string): { stem: string; branch: string } {
  const stemTaboo = PENGZU_TABOO[dayStem]?.stem || '';
  const branchTaboo = PENGZU_TABOO[dayBranch]?.branch || '';
  return { stem: stemTaboo, branch: branchTaboo };
}

/**
 * 获取冲煞信息
 */
export function getConflict(dayBranch: string): { conflict: string; sha: string } {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  const directions = ['南', '东', '北', '西', '南', '东', '北', '西', '南', '东', '北', '西'];
  
  const index = branches.indexOf(dayBranch);
  const conflictIndex = (index + 6) % 12;
  
  return {
    conflict: `冲${animals[conflictIndex]}`,
    sha: `煞${directions[conflictIndex]}`
  };
}

/**
 * 获取胎神占方
 */
export function getFetalGod(dayStem: string, dayBranch: string): string {
  const stemIndex = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(dayStem);
  const branchIndex = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(dayBranch);
  const index = stemIndex * 6 + Math.floor(branchIndex / 2);
  return FETAL_GOD_POSITIONS[index % FETAL_GOD_POSITIONS.length];
}

/**
 * 获取当日吉神（随机生成，实际应根据复杂算法）
 */
export function getAuspiciousGods(date: Date): string[] {
  const seed = date.getDate() + date.getMonth() * 31;
  const count = 3 + (seed % 3);
  const gods: string[] = [];
  for (let i = 0; i < count; i++) {
    const index = (seed * (i + 1)) % AUSPICIOUS_GODS.length;
    if (!gods.includes(AUSPICIOUS_GODS[index])) {
      gods.push(AUSPICIOUS_GODS[index]);
    }
  }
  return gods;
}

/**
 * 获取当日凶神（随机生成，实际应根据复杂算法）
 */
export function getInauspiciousGods(date: Date): string[] {
  const seed = date.getDate() + date.getMonth() * 31 + 7;
  const count = 2 + (seed % 3);
  const gods: string[] = [];
  for (let i = 0; i < count; i++) {
    const index = (seed * (i + 1)) % INAUSPICIOUS_GODS.length;
    if (!gods.includes(INAUSPICIOUS_GODS[index])) {
      gods.push(INAUSPICIOUS_GODS[index]);
    }
  }
  return gods;
}

/**
 * 获取时辰吉凶（简化版）
 */
export function getHourFortune(hourBranch: string, dayBranch: string): string {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const hourIndex = branches.indexOf(hourBranch);
  const dayIndex = branches.indexOf(dayBranch);
  
  // 简化的吉凶判断
  const diff = Math.abs(hourIndex - dayIndex);
  if (diff === 0 || diff === 6) return '凶';
  if (diff === 3 || diff === 9) return '吉';
  if (diff === 4 || diff === 8) return '吉';
  return '平';
}

// 时辰吉凶详细数据
const HOUR_DETAILED_FORTUNE: Record<string, { 
  star: string; 
  fortune: string;
  suitable: string[]; 
  avoid: string[]; 
  conflict: string;
  sha: string;
}> = {
  '子': { star: '金匮', fortune: '吉', suitable: ['祈福', '祭祀', '酬神', '出行', '嫁娶'], avoid: ['开光', '修造', '安葬'], conflict: '冲马', sha: '煞南' },
  '丑': { star: '天德', fortune: '吉', suitable: ['祭祀', '祈福', '斋醮', '酬神', '修造', '作灶'], avoid: ['开市', '安葬', '嫁娶'], conflict: '冲羊', sha: '煞东' },
  '寅': { star: '白虎', fortune: '凶', suitable: ['出行', '求财', '见贵', '订婚', '嫁娶'], avoid: ['祭祀', '祈福', '斋醮', '开光'], conflict: '冲猴', sha: '煞北' },
  '卯': { star: '玉堂', fortune: '吉', suitable: ['修造', '盖屋', '移徙', '安床', '入宅', '开市'], avoid: ['开光', '作灶', '安葬'], conflict: '冲鸡', sha: '煞西' },
  '辰': { star: '天牢', fortune: '凶', suitable: ['祭祀', '祈福', '求嗣', '斋醮', '订婚'], avoid: ['赴任', '出行', '修造', '动土'], conflict: '冲狗', sha: '煞南' },
  '巳': { star: '玄武', fortune: '凶', suitable: ['订婚', '嫁娶', '安床', '移徙', '入宅'], avoid: ['祭祀', '祈福', '斋醮', '开光'], conflict: '冲猪', sha: '煞东' },
  '午': { star: '司命', fortune: '吉', suitable: ['祭祀', '祈福', '斋醮', '酬神', '订婚', '嫁娶'], avoid: ['开光', '修造', '安葬'], conflict: '冲鼠', sha: '煞北' },
  '未': { star: '勾陈', fortune: '凶', suitable: ['祭祀', '祈福', '求嗣', '斋醮', '开市'], avoid: ['开光', '安床', '嫁娶'], conflict: '冲牛', sha: '煞西' },
  '申': { star: '青龙', fortune: '吉', suitable: ['祈福', '嫁娶', '安床', '移徙', '入宅', '开市'], avoid: ['开光', '修造', '动土'], conflict: '冲虎', sha: '煞南' },
  '酉': { star: '明堂', fortune: '吉', suitable: ['修造', '盖屋', '移徙', '作灶', '安床', '入宅'], avoid: ['祭祀', '祈福', '开光'], conflict: '冲兔', sha: '煞东' },
  '戌': { star: '天刑', fortune: '凶', suitable: ['祭祀', '祈福', '酬神', '求财', '见贵'], avoid: ['赴任', '出行', '修造', '动土'], conflict: '冲龙', sha: '煞北' },
  '亥': { star: '朱雀', fortune: '凶', suitable: ['订婚', '嫁娶', '安床', '移徙', '修造'], avoid: ['祭祀', '祈福', '开光', '斋醮'], conflict: '冲蛇', sha: '煞西' },
};

/**
 * 获取时辰详细信息
 */
export function getHourDetails(hourBranch: string): { 
  star: string; 
  fortune: string;
  suitable: string[]; 
  avoid: string[]; 
  conflict: string;
  sha: string;
} {
  return HOUR_DETAILED_FORTUNE[hourBranch] || { 
    star: '', 
    fortune: '平',
    suitable: [], 
    avoid: [], 
    conflict: '',
    sha: ''
  };
}

/**
 * 获取吉神描述
 */
export function getAuspiciousGodDesc(godName: string): string {
  return AUSPICIOUS_GODS_DESC[godName] || '吉祥之神，宜进行各种活动';
}

/**
 * 获取凶神描述
 */
export function getInauspiciousGodDesc(godName: string): string {
  return INAUSPICIOUS_GODS_DESC[godName] || '凶煞之神，需谨慎避让';
}
