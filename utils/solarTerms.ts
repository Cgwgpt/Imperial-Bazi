/**
 * 节气计算模块
 * 用于精确计算二十四节气时间，确定月柱边界
 * 
 * 节气是八字命理中确定月柱的关键：
 * - 月柱以节气划分，不以农历月份划分
 * - 立春为一年的开始（年柱也以此划分）
 * - 每个月柱对应两个节气：节（月初）和气（月中）
 */

// 二十四节气名称
export const SOLAR_TERMS = [
  '小寒', '大寒',  // 子月 (12月)
  '立春', '雨水',  // 寅月 (1月) - 立春为年首
  '惊蛰', '春分',  // 卯月 (2月)
  '清明', '谷雨',  // 辰月 (3月)
  '立夏', '小满',  // 巳月 (4月)
  '芒种', '夏至',  // 午月 (5月)
  '小暑', '大暑',  // 未月 (6月)
  '立秋', '处暑',  // 申月 (7月)
  '白露', '秋分',  // 酉月 (8月)
  '寒露', '霜降',  // 戌月 (9月)
  '立冬', '小雪',  // 亥月 (10月)
  '大雪', '冬至',  // 子月 (11月)
];

// 节气对应的月柱地支
export const TERM_TO_MONTH_BRANCH: Record<string, string> = {
  '立春': '寅', '惊蛰': '卯', '清明': '辰', '立夏': '巳',
  '芒种': '午', '小暑': '未', '立秋': '申', '白露': '酉',
  '寒露': '戌', '立冬': '亥', '大雪': '子', '小寒': '丑'
};

// 月柱地支顺序
const MONTH_BRANCHES = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

/**
 * 计算指定年份的节气时间
 * 使用寿星万年历算法
 * 
 * @param year 年份
 * @param termIndex 节气索引 (0-23)
 * @returns 节气的日期对象
 */
export function getSolarTermDate(year: number, termIndex: number): Date {
  // 节气基准点：1900年1月6日2时5分（小寒）
  const baseDate = new Date(1900, 0, 6, 2, 5, 0);
  
  // 每个节气之间的平均时间间隔（约15.2184天）
  const termInterval = 365.2422 / 24;
  
  // 计算从基准点到目标节气的天数
  // termIndex 0 = 小寒 (基准点)
  const daysFromBase = termIndex * termInterval;
  
  // 计算年份偏移
  const yearOffset = year - 1900;
  const totalDays = yearOffset * 365.2422 + daysFromBase;
  
  // 创建目标日期
  const targetDate = new Date(baseDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
  
  return targetDate;
}

/**
 * 获取指定年份所有节气的时间
 * @param year 年份
 * @returns 节气时间数组
 */
export function getAllSolarTermsForYear(year: number): Array<{ name: string; date: Date; termIndex: number }> {
  return SOLAR_TERMS.map((name, index) => ({
    name,
    date: getSolarTermDate(year, index),
    termIndex: index
  }));
}

/**
 * 根据日期确定月柱地支
 * 月柱以节气划分，而非公历月份
 * 
 * @param date 日期
 * @returns 月柱地支
 */
export function getMonthBranchBySolarTerm(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // 获取当年和前一年的节气
  const currentYearTerms = getAllSolarTermsForYear(year);
  const prevYearTerms = getAllSolarTermsForYear(year - 1);
  
  // 合并节气列表（从前一年小寒开始）
  const allTerms = [
    ...prevYearTerms.filter(t => t.name === '小寒' || t.name === '大寒'),
    ...currentYearTerms
  ];
  
  // 找到当前日期所在的月柱
  // 月柱边界由"节"决定（立春、惊蛰、清明...）
  const jieTerms = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];
  
  for (let i = jieTerms.length - 1; i >= 0; i--) {
    const termName = jieTerms[i];
    const term = allTerms.find(t => t.name === termName);
    
    if (term) {
      const termDate = term.date;
      // 检查当前日期是否在该节气之后
      if (date >= termDate) {
        return TERM_TO_MONTH_BRANCH[termName];
      }
    }
  }
  
  // 如果在立春之前，属于上一年的丑月
  return '丑';
}

/**
 * 获取指定日期所在的月柱信息
 * @param date 日期
 * @returns 月柱信息（地支、起始节气、结束节气）
 */
export function getMonthPillarInfo(date: Date): {
  branch: string;
  startTerm: string;
  endTerm: string;
  startDate: Date;
  endDate: Date;
} {
  const year = date.getFullYear();
  const branch = getMonthBranchBySolarTerm(date);
  
  // 找到对应的节气
  const jieTerms = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];
  const branchIndex = MONTH_BRANCHES.indexOf(branch);
  
  const startTermName = jieTerms[branchIndex];
  const endTermName = jieTerms[(branchIndex + 1) % 12];
  
  // 计算节气日期
  let startTermYear = year;
  let endTermYear = year;
  
  // 调整年份（如果当前月份在1-2月，立春可能在当年或前一年）
  if (branch === '丑') {
    startTermYear = year;
    endTermYear = year;
  } else if (branch === '子' && date.getMonth() === 11) {
    startTermYear = year;
    endTermYear = year + 1;
  }
  
  const startTermIndex = SOLAR_TERMS.indexOf(startTermName);
  const endTermIndex = SOLAR_TERMS.indexOf(endTermName);
  
  const startDate = getSolarTermDate(startTermYear, startTermIndex);
  const endDate = getSolarTermDate(endTermYear, endTermIndex);
  
  return {
    branch,
    startTerm: startTermName,
    endTerm: endTermName,
    startDate,
    endDate
  };
}

/**
 * 判断指定日期是否在节气交接日附近
 * @param date 日期
 * @param toleranceDays 容差天数
 * @returns 是否在节气交接期
 */
export function isNearSolarTerm(date: Date, toleranceDays: number = 3): { isNear: boolean; term?: string; daysToTerm?: number } {
  const year = date.getFullYear();
  const terms = getAllSolarTermsForYear(year);
  
  for (const term of terms) {
    const diffTime = term.date.getTime() - date.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (Math.abs(diffDays) <= toleranceDays) {
      return {
        isNear: true,
        term: term.name,
        daysToTerm: Math.round(diffDays)
      };
    }
  }
  
  return { isNear: false };
}

/**
 * 获取年柱（以立春为界）
 * @param date 日期
 * @returns 年柱干支索引
 */
export function getYearPillarBySolarTerm(date: Date): { stemIndex: number; branchIndex: number } {
  const year = date.getFullYear();
  
  // 立春时间
  const liChunDate = getSolarTermDate(year, 2); // 立春是索引2
  
  // 如果在立春之前，属于上一年
  if (date < liChunDate) {
    const prevYear = year - 1;
    const yearOffset = (prevYear - 4) % 60;
    return {
      stemIndex: (yearOffset % 10 + 10) % 10,
      branchIndex: (yearOffset % 12 + 12) % 12
    };
  }
  
  // 立春之后，属于当年
  const yearOffset = (year - 4) % 60;
  return {
    stemIndex: (yearOffset % 10 + 10) % 10,
    branchIndex: (yearOffset % 12 + 12) % 12
  };
}

/**
 * 获取月柱天干（根据年干推算）
 * 口诀：甲己之年丙作首，乙庚之岁戊为头，
 *       丙辛之岁庚寅上，丁壬壬寅顺行流，
 *       戊癸甲寅好追求
 * 
 * @param yearStemIndex 年干索引 (0-9)
 * @param monthBranchIndex 月支索引 (0-11, 寅=0)
 * @returns 月干索引 (0-9)
 */
export function getMonthStemIndex(yearStemIndex: number, monthBranchIndex: number): number {
  // 根据年干确定月干起始
  const baseMap: Record<number, number> = {
    0: 2,  // 甲年 -> 丙寅 (丙=2)
    1: 4,  // 乙年 -> 戊寅 (戊=4)
    2: 6,  // 丙年 -> 庚寅 (庚=6)
    3: 8,  // 丁年 -> 壬寅 (壬=8)
    4: 0,  // 戊年 -> 甲寅 (甲=0)
    5: 2,  // 己年 -> 丙寅 (丙=2)
    6: 4,  // 庚年 -> 戊寅 (戊=4)
    7: 6,  // 辛年 -> 庚寅 (庚=6)
    8: 8,  // 壬年 -> 壬寅 (壬=8)
    9: 0,  // 癸年 -> 甲寅 (甲=0)
  };
  
  const baseStemIndex = baseMap[yearStemIndex] || 0;
  return (baseStemIndex + monthBranchIndex) % 10;
}

/**
 * 获取指定日期所在的节气信息
 * @param date 日期
 * @returns 节气信息（如果当天是节气）或 null
 */
export function getSolarTermForDate(date: Date): { name: string; index: number; exactTime: Date; exactTimeStr: string } | null {
  const year = date.getFullYear();
  const targetTime = date.getTime();
  
  // 检查当年和前后一天的节气
  for (let termIndex = 0; termIndex < 24; termIndex++) {
    const termDate = getSolarTermDate(year, termIndex);
    const termTime = termDate.getTime();
    
    // 如果在节气当天（前后12小时内）
    const timeDiff = Math.abs(targetTime - termTime);
    if (timeDiff < 12 * 60 * 60 * 1000) {
      // 格式化节气时间
      const hours = termDate.getHours();
      const minutes = termDate.getMinutes();
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      return {
        name: SOLAR_TERMS[termIndex],
        index: termIndex,
        exactTime: termDate,
        exactTimeStr: timeStr
      };
    }
  }
  
  return null;
}
