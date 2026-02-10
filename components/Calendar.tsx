import React, { useState } from 'react';
import { HEAVENLY_STEMS, EARTHLY_BRANCHES, STEM_ORDER, BRANCH_ORDER, ELEMENT_COLORS } from '../constants.ts';
import { getYearPillarBySolarTerm, getMonthBranchBySolarTerm, getMonthStemIndex, getSolarTermForDate } from '../utils/solarTerms.ts';
import { solarToLunar } from '../utils/lunarCalendar.ts';
import { 
  getDayStar, 
  getTwelveGod, 
  getTwelveGodAdvice, 
  getNayin, 
  getPengzuTaboo, 
  getConflict, 
  getFetalGod,
  getAuspiciousGods,
  getInauspiciousGods,
  getHourFortune,
  getHourDetails
} from '../utils/huangli.ts';

const Calendar: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHourIndex, setSelectedHourIndex] = useState<number | null>(null);

  // 获取某个日期的干支
  const getGanZhiForDate = (date: Date) => {
    // 年柱
    const { stemIndex: yearStemIndex, branchIndex: yearBranchIndex } = getYearPillarBySolarTerm(date);
    
    // 月柱
    const monthBranch = getMonthBranchBySolarTerm(date);
    const monthBranchIndex = BRANCH_ORDER.indexOf(monthBranch);
    const monthStemIndex = getMonthStemIndex(yearStemIndex, monthBranchIndex);
    
    // 日柱
    const diffDays = Math.floor((date.getTime() - new Date(1900, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
    const dayOffset = (diffDays + 10) % 60;
    const dayStemIndex = dayOffset % 10;
    const dayBranchIndex = dayOffset % 12;

    return {
      year: { stem: STEM_ORDER[yearStemIndex], branch: BRANCH_ORDER[yearBranchIndex] },
      month: { stem: STEM_ORDER[monthStemIndex], branch: BRANCH_ORDER[monthBranchIndex] },
      day: { stem: STEM_ORDER[dayStemIndex], branch: BRANCH_ORDER[dayBranchIndex] }
    };
  };

  // 获取时辰信息
  const getHourPillars = (date: Date) => {
    const ganZhi = getGanZhiForDate(date);
    const dayStemIndex = STEM_ORDER.indexOf(ganZhi.day.stem);
    const hourBaseOffset = (dayStemIndex % 5) * 2;
    
    const hours = [
      { time: '23-01', name: '子时', branch: '子' },
      { time: '01-03', name: '丑时', branch: '丑' },
      { time: '03-05', name: '寅时', branch: '寅' },
      { time: '05-07', name: '卯时', branch: '卯' },
      { time: '07-09', name: '辰时', branch: '辰' },
      { time: '09-11', name: '巳时', branch: '巳' },
      { time: '11-13', name: '午时', branch: '午' },
      { time: '13-15', name: '未时', branch: '未' },
      { time: '15-17', name: '申时', branch: '申' },
      { time: '17-19', name: '酉时', branch: '酉' },
      { time: '19-21', name: '戌时', branch: '戌' },
      { time: '21-23', name: '亥时', branch: '亥' }
    ];

    return hours.map((hour, idx) => {
      const hourStemIndex = (hourBaseOffset + idx) % 10;
      return {
        ...hour,
        stem: STEM_ORDER[hourStemIndex]
      };
    });
  };

  // 获取日期宜忌（基于建除十二神）
  const getDayAdvice = (date: Date) => {
    const ganZhi = getGanZhiForDate(date);
    const twelveGod = getTwelveGod(ganZhi.month.branch, ganZhi.day.branch);
    return getTwelveGodAdvice(twelveGod);
  };

  // 获取月份的所有日期
  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // 填充月初空白
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // 填充实际日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentYear, currentMonth);
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(now);
    setSelectedHourIndex(null);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const now = new Date();
    return date.getDate() === now.getDate() &&
           date.getMonth() === now.getMonth() &&
           date.getFullYear() === now.getFullYear();
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const selectedGanZhi = selectedDate ? getGanZhiForDate(selectedDate) : null;
  const selectedHours = selectedDate ? getHourPillars(selectedDate) : null;
  const selectedAdvice = selectedDate ? getDayAdvice(selectedDate) : null;
  const selectedSolarTerm = selectedDate ? getSolarTermForDate(selectedDate) : null;
  const selectedLunar = selectedDate ? solarToLunar(selectedDate) : null;

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-stone-200 p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-stone-800">万年历</h3>
          <p className="text-sm text-stone-600 mt-1">查询黄历吉日、节气、宜忌、八字排盘</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded text-stone-700 transition-colors text-lg shadow-sm"
          >
            ‹
          </button>
          <span className="text-lg font-medium text-stone-700 min-w-[140px] text-center bg-white px-4 py-2 rounded border border-stone-200">
            {currentYear}年 {monthNames[currentMonth]}
          </span>
          <button
            onClick={handleNextMonth}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded text-stone-700 transition-colors text-lg shadow-sm"
          >
            ›
          </button>
          <button
            onClick={handleToday}
            className="ml-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-base transition-colors shadow-sm font-medium"
          >
            今天
          </button>
        </div>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            className={`text-center text-base font-bold py-3 rounded ${
              idx === 0 ? 'bg-red-50 text-red-700' : 
              idx === 6 ? 'bg-blue-50 text-blue-700' : 
              'bg-stone-50 text-stone-700'
            } border border-stone-200`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, idx) => {
          if (!date) {
            return <div key={idx} className="aspect-square" />;
          }

          const ganZhi = getGanZhiForDate(date);
          const stemElement = HEAVENLY_STEMS[ganZhi.day.stem].element;
          const branchElement = EARTHLY_BRANCHES[ganZhi.day.branch].element;
          const solarTerm = getSolarTermForDate(date);
          const advice = getDayAdvice(date);
          const lunar = solarToLunar(date);

          return (
            <button
              key={idx}
              onClick={() => {
                setSelectedDate(date);
                setSelectedHourIndex(null); // 切换日期时重置时辰选择
              }}
              className={`aspect-square p-2 rounded-lg border-2 transition-all hover:shadow-lg relative overflow-hidden ${
                isToday(date)
                  ? 'bg-amber-50 border-amber-600 shadow-md'
                  : isSelected(date)
                  ? 'bg-purple-50 border-purple-600 shadow-md'
                  : 'bg-white border-stone-200 hover:border-stone-400'
              }`}
            >
              {/* 节气标签 */}
              {solarTerm && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] px-1 rounded-bl font-bold">
                  {solarTerm.name}
                </div>
              )}

              <div className="flex flex-col items-center justify-between h-full py-1">
                {/* 公历日期 */}
                <span className={`text-lg font-bold ${
                  isToday(date) ? 'text-amber-900' : 'text-stone-700'
                }`}>
                  {date.getDate()}
                </span>

                {/* 农历日期 */}
                <div className="text-[10px] text-stone-500 font-medium">
                  {lunar.day === 1 ? lunar.monthCn : lunar.dayCn}
                </div>

                {/* 日柱干支 */}
                <div className="flex gap-0.5 my-0.5">
                  <span className={`text-sm font-bold ${ELEMENT_COLORS[stemElement]}`}>
                    {ganZhi.day.stem}
                  </span>
                  <span className={`text-sm font-bold ${ELEMENT_COLORS[branchElement]}`}>
                    {ganZhi.day.branch}
                  </span>
                </div>


              </div>
            </button>
          );
        })}
      </div>

      {/* 选中日期详情 */}
      {selectedGanZhi && selectedDate && selectedLunar && (
        <div className="mt-6 space-y-4">
          {/* 日期信息 */}
          <div className="p-5 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-purple-900">
                  {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
                </h4>
                <p className="text-sm text-purple-700 mt-1">
                  农历 {selectedLunar.ganzhi}年（{selectedLunar.zodiac}年）{selectedLunar.monthCn}{selectedLunar.dayCn}
                </p>
              </div>
              {selectedSolarTerm && (
                <div className="flex flex-col items-end">
                  <span className="text-sm bg-red-600 text-white px-3 py-1 rounded-full font-bold">
                    {selectedSolarTerm.name}
                  </span>
                  {selectedSolarTerm.exactTimeStr && (
                    <span className="text-xs text-red-700 mt-1">
                      {selectedSolarTerm.exactTimeStr}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white/80 backdrop-blur rounded-lg border border-stone-200">
                <div className="text-xs text-stone-500 mb-2 font-medium">年柱</div>
                <div className="flex justify-center gap-1.5">
                  <span className={`text-3xl font-bold ${ELEMENT_COLORS[HEAVENLY_STEMS[selectedGanZhi.year.stem].element]}`}>
                    {selectedGanZhi.year.stem}
                  </span>
                  <span className={`text-3xl font-bold ${ELEMENT_COLORS[EARTHLY_BRANCHES[selectedGanZhi.year.branch].element]}`}>
                    {selectedGanZhi.year.branch}
                  </span>
                </div>
                <div className="text-xs text-stone-500 mt-2">
                  {getNayin(selectedGanZhi.year.stem, selectedGanZhi.year.branch)}
                </div>
              </div>

              <div className="p-4 bg-white/80 backdrop-blur rounded-lg border border-stone-200">
                <div className="text-xs text-stone-500 mb-2 font-medium">月柱</div>
                <div className="flex justify-center gap-1.5">
                  <span className={`text-3xl font-bold ${ELEMENT_COLORS[HEAVENLY_STEMS[selectedGanZhi.month.stem].element]}`}>
                    {selectedGanZhi.month.stem}
                  </span>
                  <span className={`text-3xl font-bold ${ELEMENT_COLORS[EARTHLY_BRANCHES[selectedGanZhi.month.branch].element]}`}>
                    {selectedGanZhi.month.branch}
                  </span>
                </div>
                <div className="text-xs text-stone-500 mt-2">
                  {getNayin(selectedGanZhi.month.stem, selectedGanZhi.month.branch)}
                </div>
              </div>

              <div className="p-4 bg-amber-100 rounded-lg border-2 border-amber-400 shadow-sm">
                <div className="text-xs text-amber-700 mb-2 font-bold">日柱</div>
                <div className="flex justify-center gap-1.5">
                  <span className={`text-3xl font-bold ${ELEMENT_COLORS[HEAVENLY_STEMS[selectedGanZhi.day.stem].element]}`}>
                    {selectedGanZhi.day.stem}
                  </span>
                  <span className={`text-3xl font-bold ${ELEMENT_COLORS[EARTHLY_BRANCHES[selectedGanZhi.day.branch].element]}`}>
                    {selectedGanZhi.day.branch}
                  </span>
                </div>
                <div className="text-xs text-stone-500 mt-2">
                  {getNayin(selectedGanZhi.day.stem, selectedGanZhi.day.branch)}
                </div>
              </div>
            </div>
          </div>

          {/* 黄历信息 */}
          {(() => {
            const star = getDayStar(selectedDate);
            const twelveGod = getTwelveGod(selectedGanZhi.month.branch, selectedGanZhi.day.branch);
            const conflict = getConflict(selectedGanZhi.day.branch);
            const fetalGod = getFetalGod(selectedGanZhi.day.stem, selectedGanZhi.day.branch);
            const pengzu = getPengzuTaboo(selectedGanZhi.day.stem, selectedGanZhi.day.branch);
            const auspiciousGods = getAuspiciousGods(selectedDate);
            const inauspiciousGods = getInauspiciousGods(selectedDate);

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 黄历详情 */}
                <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                  <h4 className="text-base font-bold text-amber-900 mb-3">黄历详情</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-stone-600 min-w-[70px]">值日星宿：</span>
                      <span className={`font-medium ${star.fortune === '吉' ? 'text-green-700' : 'text-red-700'}`}>
                        {star.name}宿（{star.fortune}）
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-stone-600 min-w-[70px]">值日神煞：</span>
                      <span className="text-stone-700 font-medium">{twelveGod}日</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-stone-600 min-w-[70px]">冲煞：</span>
                      <span className="text-red-700 font-medium">{conflict.conflict} {conflict.sha}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-stone-600 min-w-[70px]">胎神占方：</span>
                      <span className="text-stone-700">{fetalGod}</span>
                    </div>
                  </div>
                </div>

                {/* 彭祖百忌 */}
                <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                  <h4 className="text-base font-bold text-red-900 mb-3">彭祖百忌</h4>
                  <div className="space-y-2 text-sm text-stone-700">
                    <p>{pengzu.stem}</p>
                    <p>{pengzu.branch}</p>
                  </div>
                </div>

                {/* 吉神宜趋 */}
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <h4 className="text-base font-bold text-green-900 mb-3">吉神宜趋</h4>
                  <div className="flex flex-wrap gap-2">
                    {auspiciousGods.map((god, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-600 text-white rounded text-xs font-medium">
                        {god}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 凶神宜忌 */}
                <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <h4 className="text-base font-bold text-orange-900 mb-3">凶神宜忌</h4>
                  <div className="flex flex-wrap gap-2">
                    {inauspiciousGods.map((god, idx) => (
                      <span key={idx} className="px-2 py-1 bg-orange-600 text-white rounded text-xs font-medium">
                        {god}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 黄历解释说明 */}
          <div className="p-4 bg-gradient-to-br from-stone-50 to-amber-50 rounded-lg border-2 border-stone-200">
            <h4 className="text-base font-bold text-stone-900 mb-3">黄历详解</h4>
            <div className="space-y-3 text-sm text-stone-700">
              <p>
                <span className="font-bold">今日值神是{getDayStar(selectedDate).name}</span>，
                {getDayStar(selectedDate).fortune === '吉' ? '是吉神，主吉庆祥和' : '是凶神，主凶险灾祸'}。
                {getTwelveGod(selectedGanZhi.month.branch, selectedGanZhi.day.branch) === '建' || 
                 getTwelveGod(selectedGanZhi.month.branch, selectedGanZhi.day.branch) === '除' ||
                 getTwelveGod(selectedGanZhi.month.branch, selectedGanZhi.day.branch) === '满' ||
                 getTwelveGod(selectedGanZhi.month.branch, selectedGanZhi.day.branch) === '平' ||
                 getTwelveGod(selectedGanZhi.month.branch, selectedGanZhi.day.branch) === '定' ||
                 getTwelveGod(selectedGanZhi.month.branch, selectedGanZhi.day.branch) === '执' ? 
                 '今日是黄道吉日，' : '今日是黑道日，'}因此在黄历上{getDayStar(selectedDate).fortune === '吉' ? '是好日子' : '不是好日子'}。
              </p>
              <p>
                <span className="font-bold">冲煞：{getConflict(selectedGanZhi.day.branch).conflict}</span>，
                表示今日与生肖{getConflict(selectedGanZhi.day.branch).conflict.replace('冲', '')}相冲，
                属{getConflict(selectedGanZhi.day.branch).conflict.replace('冲', '')}的人今日宜静不宜动。
              </p>
              <p>
                <span className="font-bold">胎神占方：{getFetalGod(selectedGanZhi.day.stem, selectedGanZhi.day.branch)}</span>，
                孕妇今日需注意避开此方位，以免惊动胎神。
              </p>
              <p>
                <span className="font-bold">彭祖百忌：</span>
                {getPengzuTaboo(selectedGanZhi.day.stem, selectedGanZhi.day.branch).stem}，
                {getPengzuTaboo(selectedGanZhi.day.stem, selectedGanZhi.day.branch).branch}。
                遵循古训可避凶趋吉。
              </p>
            </div>
          </div>

          {/* 宜忌和时辰 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 宜忌 */}
            {(() => {
              const twelveGod = getTwelveGod(selectedGanZhi.month.branch, selectedGanZhi.day.branch);
              const godAdvice = getTwelveGodAdvice(twelveGod);
              
              return (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <h4 className="text-base font-bold text-green-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">✓</span> 宜（{twelveGod}日）
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {godAdvice.suitable.map((item, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-green-600 text-white rounded-full text-sm font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                    <h4 className="text-base font-bold text-red-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">✗</span> 忌
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {godAdvice.avoid.length > 0 && godAdvice.avoid[0] !== '诸事不宜' ? (
                        godAdvice.avoid.map((item, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-red-600 text-white rounded-full text-sm font-medium">
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-stone-500">{godAdvice.avoid[0] || '无特别禁忌'}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 十二时辰 */}
            {selectedHours && (
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h4 className="text-base font-bold text-blue-900 mb-3">
                  选择出生时辰
                  {selectedHourIndex !== null && (
                    <span className="ml-2 text-sm font-normal text-blue-700">
                      （已选：{selectedHours[selectedHourIndex].name}）
                    </span>
                  )}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {selectedHours.map((hour, idx) => {
                    const isSelected = selectedHourIndex === idx;
                    const fortune = getHourFortune(hour.branch, selectedGanZhi.day.branch);
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedHourIndex(isSelected ? null : idx)}
                        className={`p-2 rounded border-2 text-center transition-all relative ${
                          isSelected
                            ? 'bg-blue-600 border-blue-700 text-white shadow-lg scale-105'
                            : 'bg-white border-stone-200 hover:border-blue-400 hover:shadow-md'
                        }`}
                      >
                        {/* 时辰吉凶标签 */}
                        <div className={`absolute top-0 right-0 text-[8px] px-1 rounded-bl font-bold ${
                          fortune === '吉' ? 'bg-green-600 text-white' :
                          fortune === '凶' ? 'bg-red-600 text-white' :
                          'bg-stone-400 text-white'
                        }`}>
                          {fortune}
                        </div>
                        
                        <div className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-stone-500'}`}>
                          {hour.time}
                        </div>
                        <div className={`text-xs font-bold my-0.5 ${isSelected ? 'text-white' : 'text-stone-700'}`}>
                          {hour.name}
                        </div>
                        <div className="flex justify-center gap-0.5">
                          <span className={`text-sm font-bold ${
                            isSelected ? 'text-white' : ELEMENT_COLORS[HEAVENLY_STEMS[hour.stem].element]
                          }`}>
                            {hour.stem}
                          </span>
                          <span className={`text-sm font-bold ${
                            isSelected ? 'text-white' : ELEMENT_COLORS[EARTHLY_BRANCHES[hour.branch].element]
                          }`}>
                            {hour.branch}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* 时辰详细信息 */}
                {selectedHourIndex !== null && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                    <h5 className="text-sm font-bold text-blue-900 mb-3 text-center">
                      {selectedHours[selectedHourIndex].name}（{selectedHours[selectedHourIndex].time}）时辰详情
                    </h5>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-white/80 rounded-lg border border-blue-100">
                        <div className="text-xs text-blue-700 mb-2 font-bold">星神</div>
                        <div className="text-base font-bold text-blue-900">
                          {getHourDetails(selectedHours[selectedHourIndex].branch).star}
                        </div>
                      </div>
                      <div className="p-3 bg-white/80 rounded-lg border border-blue-100">
                        <div className="text-xs text-blue-700 mb-2 font-bold">冲煞</div>
                        <div className="text-sm font-bold text-red-700">
                          {getHourDetails(selectedHours[selectedHourIndex].branch).conflict} {getHourDetails(selectedHours[selectedHourIndex].branch).sha}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                        <h6 className="text-xs font-bold text-green-800 mb-2">时宜</h6>
                        <div className="flex flex-wrap gap-1">
                          {getHourDetails(selectedHours[selectedHourIndex].branch).suitable.map((item, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg border-2 border-red-200">
                        <h6 className="text-xs font-bold text-red-800 mb-2">时忌</h6>
                        <div className="flex flex-wrap gap-1">
                          {getHourDetails(selectedHours[selectedHourIndex].branch).avoid.map((item, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-600 text-white rounded text-xs">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 显示完整四柱 */}
                {selectedHourIndex !== null && (
                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-300">
                    <h5 className="text-sm font-bold text-blue-900 mb-3 text-center">
                      完整四柱八字
                    </h5>
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                        <div className="text-xs text-stone-500 mb-1">年柱</div>
                        <div className="flex justify-center gap-1">
                          <span className={`text-2xl font-bold ${ELEMENT_COLORS[HEAVENLY_STEMS[selectedGanZhi.year.stem].element]}`}>
                            {selectedGanZhi.year.stem}
                          </span>
                          <span className={`text-2xl font-bold ${ELEMENT_COLORS[EARTHLY_BRANCHES[selectedGanZhi.year.branch].element]}`}>
                            {selectedGanZhi.year.branch}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                        <div className="text-xs text-stone-500 mb-1">月柱</div>
                        <div className="flex justify-center gap-1">
                          <span className={`text-2xl font-bold ${ELEMENT_COLORS[HEAVENLY_STEMS[selectedGanZhi.month.stem].element]}`}>
                            {selectedGanZhi.month.stem}
                          </span>
                          <span className={`text-2xl font-bold ${ELEMENT_COLORS[EARTHLY_BRANCHES[selectedGanZhi.month.branch].element]}`}>
                            {selectedGanZhi.month.branch}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-50 rounded-lg border-2 border-amber-300">
                        <div className="text-xs text-amber-700 mb-1 font-bold">日柱</div>
                        <div className="flex justify-center gap-1">
                          <span className={`text-2xl font-bold ${ELEMENT_COLORS[HEAVENLY_STEMS[selectedGanZhi.day.stem].element]}`}>
                            {selectedGanZhi.day.stem}
                          </span>
                          <span className={`text-2xl font-bold ${ELEMENT_COLORS[EARTHLY_BRANCHES[selectedGanZhi.day.branch].element]}`}>
                            {selectedGanZhi.day.branch}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-100 rounded-lg border-2 border-blue-400 shadow-sm">
                        <div className="text-xs text-blue-700 mb-1 font-bold">时柱</div>
                        <div className="flex justify-center gap-1">
                          <span className={`text-2xl font-bold ${ELEMENT_COLORS[HEAVENLY_STEMS[selectedHours[selectedHourIndex].stem].element]}`}>
                            {selectedHours[selectedHourIndex].stem}
                          </span>
                          <span className={`text-2xl font-bold ${ELEMENT_COLORS[EARTHLY_BRANCHES[selectedHours[selectedHourIndex].branch].element]}`}>
                            {selectedHours[selectedHourIndex].branch}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-center">
                      <p className="text-xs text-stone-600 mb-2">
                        出生时间：{selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 {selectedHours[selectedHourIndex].name}（{selectedHours[selectedHourIndex].time}）
                      </p>
                      <button
                        onClick={() => {
                          // 这里可以添加复制或导出功能
                          const baziText = `${selectedGanZhi.year.stem}${selectedGanZhi.year.branch} ${selectedGanZhi.month.stem}${selectedGanZhi.month.branch} ${selectedGanZhi.day.stem}${selectedGanZhi.day.branch} ${selectedHours[selectedHourIndex].stem}${selectedHours[selectedHourIndex].branch}`;
                          navigator.clipboard.writeText(baziText);
                          alert('八字已复制到剪贴板：' + baziText);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                      >
                        复制八字
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-stone-200">
        <div className="text-sm text-stone-500 space-y-1.5">
          <p>• <span className="font-medium">日历格子</span>显示公历日期、农历日期、日柱干支、当日宜忌</p>
          <p>• <span className="font-medium">节气标注</span>用红色标签显示，农历初一显示月份</p>
          <p>• <span className="font-medium">点击日期</span>查看完整的年月日柱、农历信息、十二时辰和详细宜忌</p>
          <p>• <span className="font-medium">橙色边框</span>为今天，<span className="font-medium">紫色边框</span>为选中日期</p>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
