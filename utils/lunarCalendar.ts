/**
 * 农历转换模块
 * 用于公历与农历之间的转换
 */

// 农历数据表（1900-2100年）
// 每个数字的后12位表示12个月，1为大月30天，0为小月29天
// 前4位表示闰月月份，0表示无闰月
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252
];

// 天干
const HEAVENLY_STEMS_LUNAR = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const EARTHLY_BRANCHES_LUNAR = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 生肖
const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 农历月份
const LUNAR_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];

// 农历日期
const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

/**
 * 获取农历年份的闰月
 * @param year 农历年份
 * @returns 闰月月份，0表示无闰月
 */
function getLeapMonth(year: number): number {
  return LUNAR_INFO[year - 1900] & 0xf;
}

/**
 * 获取农历年份的闰月天数
 * @param year 农历年份
 * @returns 闰月天数
 */
function getLeapMonthDays(year: number): number {
  if (getLeapMonth(year)) {
    return (LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29;
  }
  return 0;
}

/**
 * 获取农历年份某月的天数
 * @param year 农历年份
 * @param month 农历月份
 * @returns 该月天数
 */
function getMonthDays(year: number, month: number): number {
  return (LUNAR_INFO[year - 1900] & (0x10000 >> month)) ? 30 : 29;
}

/**
 * 获取农历年份的总天数
 * @param year 农历年份
 * @returns 该年总天数
 */
function getYearDays(year: number): number {
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (LUNAR_INFO[year - 1900] & i) ? 1 : 0;
  }
  return sum + getLeapMonthDays(year);
}

/**
 * 公历转农历
 * @param date 公历日期
 * @returns 农历信息
 */
export function solarToLunar(date: Date): {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
  yearCn: string;
  monthCn: string;
  dayCn: string;
  zodiac: string;
  ganzhi: string;
} {
  const baseDate = new Date(1900, 0, 31); // 1900年1月31日是农历1900年正月初一
  let offset = Math.floor((date.getTime() - baseDate.getTime()) / 86400000);

  let year = 1900;
  let daysInYear = 0;

  // 计算农历年份
  while (year < 2100 && offset > 0) {
    daysInYear = getYearDays(year);
    if (offset < daysInYear) {
      break;
    }
    offset -= daysInYear;
    year++;
  }

  // 计算农历月份
  let month = 1;
  let isLeap = false;
  const leapMonth = getLeapMonth(year);

  for (let i = 1; i <= 12 && offset > 0; i++) {
    let daysInMonth = 0;

    // 闰月
    if (leapMonth > 0 && i === (leapMonth + 1) && !isLeap) {
      i--;
      isLeap = true;
      daysInMonth = getLeapMonthDays(year);
    } else {
      daysInMonth = getMonthDays(year, i);
    }

    if (offset < daysInMonth) {
      month = i;
      break;
    }

    offset -= daysInMonth;

    if (isLeap && i === (leapMonth + 1)) {
      isLeap = false;
    }
  }

  const day = offset + 1;

  // 生成中文表示
  const yearCn = getYearCn(year);
  const monthCn = (isLeap ? '闰' : '') + LUNAR_MONTHS[month - 1] + '月';
  const dayCn = LUNAR_DAYS[day - 1];
  const zodiac = ZODIAC_ANIMALS[(year - 4) % 12];
  const ganzhi = getGanZhi(year);

  return {
    year,
    month,
    day,
    isLeap,
    yearCn,
    monthCn,
    dayCn,
    zodiac,
    ganzhi
  };
}

/**
 * 获取农历年份的干支表示
 * @param year 农历年份
 * @returns 干支年
 */
function getGanZhi(year: number): string {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  return HEAVENLY_STEMS_LUNAR[ganIndex] + EARTHLY_BRANCHES_LUNAR[zhiIndex];
}

/**
 * 获取农历年份的中文表示
 * @param year 农历年份
 * @returns 中文年份
 */
function getYearCn(year: number): string {
  const digits = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const yearStr = year.toString();
  let result = '';
  for (let i = 0; i < yearStr.length; i++) {
    result += digits[parseInt(yearStr[i])];
  }
  return result;
}
