/**
 * 真太阳时校正模块
 * 
 * 八字命理中，时柱应以真太阳时（地方视太阳时）为准，而非标准时间。
 * 真太阳时 = 平太阳时 + 时差
 * 
 * 时差来源：
 * 1. 经度差：每度4分钟，东经为正，西经为负
 * 2. 均时差：地球公转轨道椭圆性和黄赤交角引起的时差
 */

// 中国主要城市经纬度（用于简化计算）
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  '北京': { lat: 39.9042, lng: 116.4074 },
  '上海': { lat: 31.2304, lng: 121.4737 },
  '广州': { lat: 23.1291, lng: 113.2644 },
  '深圳': { lat: 22.5431, lng: 114.0579 },
  '成都': { lat: 30.5728, lng: 104.0668 },
  '武汉': { lat: 30.5928, lng: 114.3055 },
  '西安': { lat: 34.3416, lng: 108.9398 },
  '南京': { lat: 32.0603, lng: 118.7969 },
  '杭州': { lat: 30.2741, lng: 120.1551 },
  '重庆': { lat: 29.5630, lng: 106.5516 },
  '香港': { lat: 22.3193, lng: 114.1694 },
  '台北': { lat: 25.0330, lng: 121.5654 },
  '哈尔滨': { lat: 45.8038, lng: 126.5349 },
  '乌鲁木齐': { lat: 43.8256, lng: 87.6168 },
  '拉萨': { lat: 29.6548, lng: 91.1406 },
};

// 标准时区中心经度（中国使用东八区，中心经度120°E）
const STANDARD_TIMEZONE_LONGITUDE = 120; // 东八区中心经度

/**
 * 计算经度时差
 * @param longitude 经度（东经为正，西经为负）
 * @returns 时差（分钟）
 */
export function calculateLongitudeTimeDifference(longitude: number): number {
  // 每度经度对应4分钟时差
  const diffDegrees = longitude - STANDARD_TIMEZONE_LONGITUDE;
  return diffDegrees * 4; // 分钟
}

/**
 * 计算均时差（Equation of Time）
 * 简化公式：E = 9.87 * sin(2B) - 7.53 * cos(B) - 1.5 * sin(B)
 * 其中 B = (360/365) * (N - 81)
 * N = 一年中的第几天
 * 
 * @param date 日期
 * @returns 均时差（分钟）
 */
export function calculateEquationOfTime(date: Date): number {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const N = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const B = (360 / 365) * (N - 81) * (Math.PI / 180); // 转换为弧度
  const E = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  return E; // 分钟
}

/**
 * 计算真太阳时
 * @param standardTime 标准时间
 * @param longitude 经度（东经为正，西经为负）
 * @returns 真太阳时（Date对象）
 */
export function calculateTrueSolarTime(standardTime: Date, longitude: number): Date {
  // 1. 计算经度时差
  const longitudeDiff = calculateLongitudeTimeDifference(longitude);
  
  // 2. 计算均时差
  const equationOfTime = calculateEquationOfTime(standardTime);
  
  // 3. 总时差 = 经度时差 + 均时差
  const totalDiffMinutes = longitudeDiff + equationOfTime;
  
  // 4. 应用时差
  const trueSolarTime = new Date(standardTime.getTime() + totalDiffMinutes * 60 * 1000);
  
  return trueSolarTime;
}

/**
 * 获取指定城市的真太阳时
 * @param standardTime 标准时间
 * @param cityName 城市名称
 * @returns 真太阳时和时差信息
 */
export function getTrueSolarTimeForCity(
  standardTime: Date, 
  cityName: string
): { trueSolarTime: Date; longitudeDiff: number; equationOfTime: number; totalDiff: number; cityCoords?: { lat: number; lng: number } } {
  
  const cityCoords = CITY_COORDINATES[cityName];
  if (!cityCoords) {
    // 如果城市不在列表中，使用默认值（无校正）
    return {
      trueSolarTime: standardTime,
      longitudeDiff: 0,
      equationOfTime: 0,
      totalDiff: 0
    };
  }
  
  const longitudeDiff = calculateLongitudeTimeDifference(cityCoords.lng);
  const equationOfTime = calculateEquationOfTime(standardTime);
  const totalDiff = longitudeDiff + equationOfTime;
  const trueSolarTime = calculateTrueSolarTime(standardTime, cityCoords.lng);
  
  return {
    trueSolarTime,
    longitudeDiff,
    equationOfTime,
    totalDiff,
    cityCoords
  };
}

/**
 * 根据真太阳时调整小时柱
 * @param hour 标准时间的小时数
 * @param longitude 经度
 * @returns 调整后的小时（用于时柱计算）
 */
export function adjustHourForTrueSolarTime(hour: number, longitude: number): number {
  const longitudeDiff = calculateLongitudeTimeDifference(longitude);
  const equationOfTime = calculateEquationOfTime(new Date());
  const totalDiffHours = (longitudeDiff + equationOfTime) / 60;
  
  return hour + totalDiffHours;
}

/**
 * 获取时柱地支对应的时辰范围
 * @param hour 小时（0-23）
 * @returns 时辰地支和范围
 */
export function getHourBranchInfo(hour: number): { branch: string; hourRange: string; isBoundary: boolean } {
  // 时辰地支对应表
  const hourBranches = [
    { hourStart: 23, hourEnd: 1, branch: '子', range: '23:00-01:00' },
    { hourStart: 1, hourEnd: 3, branch: '丑', range: '01:00-03:00' },
    { hourStart: 3, hourEnd: 5, branch: '寅', range: '03:00-05:00' },
    { hourStart: 5, hourEnd: 7, branch: '卯', range: '05:00-07:00' },
    { hourStart: 7, hourEnd: 9, branch: '辰', range: '07:00-09:00' },
    { hourStart: 9, hourEnd: 11, branch: '巳', range: '09:00-11:00' },
    { hourStart: 11, hourEnd: 13, branch: '午', range: '11:00-13:00' },
    { hourStart: 13, hourEnd: 15, branch: '未', range: '13:00-15:00' },
    { hourStart: 15, hourEnd: 17, branch: '申', range: '15:00-17:00' },
    { hourStart: 17, hourEnd: 19, branch: '酉', range: '17:00-19:00' },
    { hourStart: 19, hourEnd: 21, branch: '戌', range: '19:00-21:00' },
    { hourStart: 21, hourEnd: 23, branch: '亥', range: '21:00-23:00' },
  ];
  
  // 处理跨日情况
  const adjustedHour = hour >= 23 ? hour - 24 : hour;
  
  for (const info of hourBranches) {
    if (adjustedHour >= info.hourStart && adjustedHour < info.hourEnd) {
      const isBoundary = Math.abs(adjustedHour - info.hourStart) < 0.5 || Math.abs(adjustedHour - info.hourEnd) < 0.5;
      return { branch: info.branch, hourRange: info.range, isBoundary };
    }
  }
  
  // 默认返回子时
  return { branch: '子', hourRange: '23:00-01:00', isBoundary: false };
}

/**
 * 检查是否需要真太阳时校正
 * @param longitude 经度
 * @returns 是否需要校正
 */
export function needsTrueSolarTimeCorrection(longitude: number): boolean {
  const diff = calculateLongitudeTimeDifference(longitude);
  return Math.abs(diff) > 5; // 时差超过5分钟需要校正
}

/**
 * 获取真太阳时校正建议
 * @param cityName 城市名称
 * @param birthTime 出生时间
 * @returns 校正建议文本
 */
export function getCorrectionAdvice(cityName: string, birthTime: Date): string {
  const cityCoords = CITY_COORDINATES[cityName];
  if (!cityCoords) {
    return `城市"${cityName}"不在数据库中，无法进行真太阳时校正。`;
  }
  
  const { longitudeDiff, equationOfTime, totalDiff } = getTrueSolarTimeForCity(birthTime, cityName);
  
  if (Math.abs(totalDiff) < 1) {
    return `真太阳时校正量小于1分钟，可忽略不计。`;
  }
  
  const sign = totalDiff > 0 ? '晚' : '早';
  const absDiff = Math.abs(totalDiff);
  
  return `根据${cityName}的经度(${cityCoords.lng}°E)，真太阳时比标准时间${sign}${absDiff.toFixed(1)}分钟。`;
}