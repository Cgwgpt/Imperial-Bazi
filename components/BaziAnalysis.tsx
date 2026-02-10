import React, { useState } from 'react';
import type { BaziChart, Pillar, ElementType } from '../constants.ts';
import { ELEMENT_COLORS, ELEMENT_RELATIONS } from '../constants.ts';

interface Props {
  chart: BaziChart;
  exportMode?: boolean;
}

const BaziAnalysis: React.FC<Props> = ({ chart, exportMode = false }) => {
  const [activeSection, setActiveSection] = useState<'pattern' | 'structure' | 'relationship' | 'hidden'>('pattern');

  // 分析格局
  const analyzePattern = () => {
    const { dayMaster, strength, monthPillar } = chart;
    const monthElement = monthPillar.branch.element;
    
    // 判断是否得令（月令）
    const isInSeason = ELEMENT_RELATIONS[dayMaster.element][monthElement] === 'BirthsMe' || 
                       dayMaster.element === monthElement;
    
    // 判断是否得地（地支多助）
    const earthlySupport = [chart.yearPillar, chart.monthPillar, chart.dayPillar, chart.hourPillar]
      .filter(p => p.branch.element === dayMaster.element || 
                   ELEMENT_RELATIONS[dayMaster.element][p.branch.element] === 'BirthsMe')
      .length;
    
    // 判断是否得势（天干多助）
    const heavenlySupport = [chart.yearPillar, chart.monthPillar, chart.hourPillar]
      .filter(p => p.stem.element === dayMaster.element || 
                   ELEMENT_RELATIONS[dayMaster.element][p.stem.element] === 'BirthsMe')
      .length;

    return {
      isInSeason,
      earthlySupport,
      heavenlySupport,
      verdict: strength.verdict,
      score: strength.score
    };
  };

  // 分析十神结构
  const analyzeTenGods = () => {
    const gods = [
      chart.yearPillar.tenGod,
      chart.monthPillar.tenGod,
      chart.hourPillar.tenGod
    ];
    
    const godCount: Record<string, number> = {};
    gods.forEach(god => {
      godCount[god] = (godCount[god] || 0) + 1;
    });

    // 加上藏干中的十神
    [chart.yearPillar, chart.monthPillar, chart.dayPillar, chart.hourPillar].forEach(pillar => {
      pillar.hiddenGods.forEach(god => {
        godCount[god] = (godCount[god] || 0) + 0.5; // 藏干权重减半
      });
    });

    return Object.entries(godCount)
      .sort((a, b) => b[1] - a[1])
      .map(([god, count]) => ({ god, count }));
  };

  // 分析干支关系
  const analyzeRelationships = () => {
    const relationships = [];
    
    // 天干合化
    const stemCombos: Record<string, { partner: string; result: string }> = {
      '甲': { partner: '己', result: '土' },
      '己': { partner: '甲', result: '土' },
      '乙': { partner: '庚', result: '金' },
      '庚': { partner: '乙', result: '金' },
      '丙': { partner: '辛', result: '水' },
      '辛': { partner: '丙', result: '水' },
      '丁': { partner: '壬', result: '木' },
      '壬': { partner: '丁', result: '木' },
      '戊': { partner: '癸', result: '火' },
      '癸': { partner: '戊', result: '火' }
    };

    const stems = [
      { char: chart.yearPillar.stem.char, pos: '年干' },
      { char: chart.monthPillar.stem.char, pos: '月干' },
      { char: chart.dayPillar.stem.char, pos: '日干' },
      { char: chart.hourPillar.stem.char, pos: '时干' }
    ];

    for (let i = 0; i < stems.length; i++) {
      for (let j = i + 1; j < stems.length; j++) {
        const combo = stemCombos[stems[i].char];
        if (combo && stems[j].char === combo.partner) {
          relationships.push({
            type: '天干合',
            desc: `${stems[i].pos}${stems[i].char}与${stems[j].pos}${stems[j].char}相合，化${combo.result}`,
            impact: '增强合化五行力量，改变命局结构'
          });
        }
      }
    }

    // 地支三合局
    const triads: Record<string, { members: string[]; result: string }> = {
      '木局': { members: ['亥', '卯', '未'], result: '木' },
      '火局': { members: ['寅', '午', '戌'], result: '火' },
      '金局': { members: ['巳', '酉', '丑'], result: '金' },
      '水局': { members: ['申', '子', '辰'], result: '水' }
    };

    const branches = [
      { char: chart.yearPillar.branch.char, pos: '年支' },
      { char: chart.monthPillar.branch.char, pos: '月支' },
      { char: chart.dayPillar.branch.char, pos: '日支' },
      { char: chart.hourPillar.branch.char, pos: '时支' }
    ];

    Object.entries(triads).forEach(([name, triad]) => {
      const found = branches.filter(b => triad.members.includes(b.char));
      if (found.length === 3) {
        relationships.push({
          type: '三合局',
          desc: `${found.map(f => f.pos + f.char).join('、')}构成${name}`,
          impact: `强化${triad.result}行力量，影响命局走向`
        });
      } else if (found.length === 2) {
        relationships.push({
          type: '半合',
          desc: `${found.map(f => f.pos + f.char).join('、')}半合${name}`,
          impact: `部分增强${triad.result}行力量`
        });
      }
    });

    // 地支六合
    const pairCombos: Record<string, string> = {
      '子': '丑', '丑': '子',
      '寅': '亥', '亥': '寅',
      '卯': '戌', '戌': '卯',
      '辰': '酉', '酉': '辰',
      '巳': '申', '申': '巳',
      '午': '未', '未': '午'
    };

    for (let i = 0; i < branches.length; i++) {
      for (let j = i + 1; j < branches.length; j++) {
        if (pairCombos[branches[i].char] === branches[j].char) {
          relationships.push({
            type: '地支六合',
            desc: `${branches[i].pos}${branches[i].char}与${branches[j].pos}${branches[j].char}相合`,
            impact: '增进和谐，利于人际关系'
          });
        }
      }
    }

    // 地支相冲
    const clashes: Record<string, string> = {
      '子': '午', '午': '子',
      '丑': '未', '未': '丑',
      '寅': '申', '申': '寅',
      '卯': '酉', '酉': '卯',
      '辰': '戌', '戌': '辰',
      '巳': '亥', '亥': '巳'
    };

    for (let i = 0; i < branches.length; i++) {
      for (let j = i + 1; j < branches.length; j++) {
        if (clashes[branches[i].char] === branches[j].char) {
          relationships.push({
            type: '地支相冲',
            desc: `${branches[i].pos}${branches[i].char}与${branches[j].pos}${branches[j].char}相冲`,
            impact: '产生动荡，需注意变动和冲突'
          });
        }
      }
    }

    // 地支相刑
    const punishments = [
      { members: ['寅', '巳', '申'], name: '无恩之刑' },
      { members: ['丑', '戌', '未'], name: '持势之刑' },
      { members: ['子', '卯'], name: '无礼之刑' }
    ];

    punishments.forEach(({ members, name }) => {
      const found = branches.filter(b => members.includes(b.char));
      if (found.length >= 2) {
        relationships.push({
          type: '地支相刑',
          desc: `${found.map(f => f.pos + f.char).join('、')}构成${name}`,
          impact: '带来压力和挑战，需谨慎应对'
        });
      }
    });

    return relationships;
  };

  // 分析藏干影响
  const analyzeHiddenStems = () => {
    const analysis = [
      {
        pillar: '年支',
        branch: chart.yearPillar.branch.char,
        hidden: chart.yearPillar.branch.hiddenStems,
        gods: chart.yearPillar.hiddenGods,
        impact: '影响祖辈、早年运势、社会背景'
      },
      {
        pillar: '月支',
        branch: chart.monthPillar.branch.char,
        hidden: chart.monthPillar.branch.hiddenStems,
        gods: chart.monthPillar.hiddenGods,
        impact: '影响父母、青年运势、事业发展（最重要）'
      },
      {
        pillar: '日支',
        branch: chart.dayPillar.branch.char,
        hidden: chart.dayPillar.branch.hiddenStems,
        gods: chart.dayPillar.hiddenGods,
        impact: '影响配偶、婚姻、中年运势'
      },
      {
        pillar: '时支',
        branch: chart.hourPillar.branch.char,
        hidden: chart.hourPillar.branch.hiddenStems,
        gods: chart.hourPillar.hiddenGods,
        impact: '影响子女、晚年运势、事业结果'
      }
    ];

    return analysis;
  };

  const pattern = analyzePattern();
  const tenGods = analyzeTenGods();
  const relationships = analyzeRelationships();
  const hiddenStems = analyzeHiddenStems();

  if (exportMode) {
    // Render all sections sequentially for export
    return (
      <div className="space-y-8">
        {/* 格局分析 */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-purple-900 mb-2">格局分析</h3>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="text-sm font-bold text-purple-900 mb-3">命局强弱评估</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-stone-600 min-w-[80px]">日元：</span>
                <span className={`font-bold text-lg ${ELEMENT_COLORS[chart.dayMaster.element]}`}>
                  {chart.dayMaster.char}{chart.dayMaster.element}
                </span>
                <span className="text-stone-500">（{chart.dayMaster.polarity}）</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-stone-600 min-w-[80px]">格局判断：</span>
                <span className={`font-bold ${
                  pattern.verdict === '身强' ? 'text-blue-600' : 
                  pattern.verdict === '身弱' ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {pattern.verdict}
                </span>
                <span className="text-stone-500">（强度评分：{pattern.score}分）</span>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-stone-600 min-w-[80px]">得令：</span>
                <div className="flex-1">
                  <span className={pattern.isInSeason ? 'text-green-600' : 'text-red-600'}>
                    {pattern.isInSeason ? '✓ 是' : '✗ 否'}
                  </span>
                  <p className="text-xs text-stone-500 mt-1">
                    {pattern.isInSeason 
                      ? '日元在月令得生或同类，有利于命局强旺'
                      : '日元在月令失令，需要其他方面的支持'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-stone-600 min-w-[80px]">得地：</span>
                <div className="flex-1">
                  <span className={pattern.earthlySupport >= 2 ? 'text-green-600' : 'text-orange-600'}>
                    {pattern.earthlySupport}个地支支持
                  </span>
                  <p className="text-xs text-stone-500 mt-1">
                    地支中有{pattern.earthlySupport}个五行生助日元，
                    {pattern.earthlySupport >= 2 ? '根基稳固' : '根基较弱'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-stone-600 min-w-[80px]">得势：</span>
                <div className="flex-1">
                  <span className={pattern.heavenlySupport >= 1 ? 'text-green-600' : 'text-orange-600'}>
                    {pattern.heavenlySupport}个天干支持
                  </span>
                  <p className="text-xs text-stone-500 mt-1">
                    天干中有{pattern.heavenlySupport}个五行生助日元，
                    {pattern.heavenlySupport >= 1 ? '得到外部助力' : '缺乏外部支持'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-stone-600 min-w-[80px]">用神建议：</span>
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    {chart.strength.favorable.map(el => (
                      <span key={el} className={`px-2 py-1 rounded text-xs font-medium ${ELEMENT_COLORS[el]} bg-green-50 border border-green-200`}>
                        {el}（喜用神）
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-stone-500">
                    宜补充喜用神五行，通过颜色、方位、职业等方式增强有利能量
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-stone-600 min-w-[80px]">忌神提示：</span>
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    {chart.strength.unfavorable.map(el => (
                      <span key={el} className={`px-2 py-1 rounded text-xs font-medium ${ELEMENT_COLORS[el]} bg-red-50 border border-red-200`}>
                        {el}（忌神）
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-stone-500">
                    宜避免或克制忌神五行，减少不利影响
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 十神结构 */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-blue-900 mb-2">十神结构</h3>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-bold text-blue-900 mb-3">十神分布统计</h4>
            <div className="space-y-2">
              {tenGods.map(({ god, count }) => (
                <div key={god} className="flex items-center gap-3">
                  <span className="text-stone-700 font-medium min-w-[60px]">{god}：</span>
                  <div className="flex-1 bg-stone-200 rounded-full h-6 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all"
                      style={{ width: `${(count / 8) * 100}%` }}
                    >
                      {count >= 1 && count.toFixed(1)}
                    </div>
                  </div>
                  <span className="text-stone-500 text-xs min-w-[40px]">{count.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
            <h4 className="text-sm font-bold text-stone-700 mb-3">十神含义解读</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-2 bg-white rounded border border-stone-200">
                <span className="font-bold text-stone-700">比肩/劫财：</span>
                <span className="text-stone-600">兄弟朋友、竞争、独立</span>
              </div>
              <div className="p-2 bg-white rounded border border-stone-200">
                <span className="font-bold text-stone-700">食神/伤官：</span>
                <span className="text-stone-600">才华、表达、创造力</span>
              </div>
              <div className="p-2 bg-white rounded border border-stone-200">
                <span className="font-bold text-stone-700">正财/偏财：</span>
                <span className="text-stone-600">财富、物质、配偶</span>
              </div>
              <div className="p-2 bg-white rounded border border-stone-200">
                <span className="font-bold text-stone-700">正官/七杀：</span>
                <span className="text-stone-600">事业、权力、压力</span>
              </div>
              <div className="p-2 bg-white rounded border border-stone-200">
                <span className="font-bold text-stone-700">正印/偏印：</span>
                <span className="text-stone-600">学识、贵人、母亲</span>
              </div>
            </div>
          </div>
        </div>

        {/* 干支关系 */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-amber-900 mb-2">干支关系</h3>
          {relationships.length > 0 ? (
            relationships.map((rel, idx) => (
              <div key={idx} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <span className="px-2 py-1 bg-amber-600 text-white text-xs font-bold rounded">
                    {rel.type}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-stone-700 font-medium mb-1">{rel.desc}</p>
                    <p className="text-xs text-stone-600">{rel.impact}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-center text-stone-500 text-sm">
              命盘中未发现明显的干支合冲刑害关系
            </div>
          )}

          <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <h4 className="text-xs font-bold text-stone-700 mb-2">干支关系说明</h4>
            <div className="text-xs text-stone-600 space-y-1">
              <p>• <span className="font-medium">合</span>：增强和谐，利于合作，但可能失去独立性</p>
              <p>• <span className="font-medium">冲</span>：带来变动，利于突破，但可能产生动荡</p>
              <p>• <span className="font-medium">刑</span>：带来压力，需要克服困难，磨练意志</p>
              <p>• <span className="font-medium">害</span>：暗中阻碍，需要警惕小人，谨慎行事</p>
            </div>
          </div>
        </div>

        {/* 藏干分析 */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-green-900 mb-2">藏干分析</h3>
          {hiddenStems.map((item, idx) => (
            <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3 mb-2">
                <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded min-w-[50px] text-center">
                  {item.pillar}
                </span>
                <span className="text-lg font-bold text-stone-700">{item.branch}</span>
              </div>
              <div className="ml-[62px] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-600">藏干：</span>
                  {item.hidden.map((stem, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-white rounded border border-stone-300 font-medium">
                      {stem}（{item.gods[i]}）
                    </span>
                  ))}
                </div>
                <p className="text-xs text-stone-600">
                  <span className="font-medium">影响：</span>{item.impact}
                </p>
              </div>
            </div>
          ))}

          <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <h4 className="text-xs font-bold text-stone-700 mb-2">藏干作用说明</h4>
            <div className="text-xs text-stone-600 space-y-1">
              <p>• 藏干是地支中隐藏的天干，代表潜在的能量和影响</p>
              <p>• 月支藏干最为重要，直接影响格局和用神</p>
              <p>• 日支藏干影响婚姻和配偶关系</p>
              <p>• 藏干在大运流年透出时，会产生重要影响</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal tabbed view
  return (
    <div className="space-y-4">
      {/* 标签页 */}
      <div className="flex gap-2 mb-4 border-b border-stone-200">
        <button
          onClick={() => setActiveSection('pattern')}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            activeSection === 'pattern'
              ? 'text-purple-700 border-b-2 border-purple-700'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          格局分析
        </button>
        <button
          onClick={() => setActiveSection('structure')}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            activeSection === 'structure'
              ? 'text-purple-700 border-b-2 border-purple-700'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          十神结构
        </button>
        <button
          onClick={() => setActiveSection('relationship')}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            activeSection === 'relationship'
              ? 'text-purple-700 border-b-2 border-purple-700'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          干支关系
        </button>
        <button
          onClick={() => setActiveSection('hidden')}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            activeSection === 'hidden'
              ? 'text-purple-700 border-b-2 border-purple-700'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          藏干分析
        </button>
      </div>

      {/* 格局分析 */}
      {activeSection === 'pattern' && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="text-sm font-bold text-purple-900 mb-3">命局强弱评估</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-stone-600 min-w-[80px]">日元：</span>
                <span className={`font-bold text-lg ${ELEMENT_COLORS[chart.dayMaster.element]}`}>
                  {chart.dayMaster.char}{chart.dayMaster.element}
                </span>
                <span className="text-stone-500">（{chart.dayMaster.polarity}）</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-stone-600 min-w-[80px]">格局判断：</span>
                <span className={`font-bold ${
                  pattern.verdict === '身强' ? 'text-blue-600' : 
                  pattern.verdict === '身弱' ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {pattern.verdict}
                </span>
                <span className="text-stone-500">（强度评分：{pattern.score}分）</span>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-stone-600 min-w-[80px]">得令：</span>
                <div className="flex-1">
                  <span className={pattern.isInSeason ? 'text-green-600' : 'text-red-600'}>
                    {pattern.isInSeason ? '✓ 是' : '✗ 否'}
                  </span>
                  <p className="text-xs text-stone-500 mt-1">
                    {pattern.isInSeason 
                      ? '日元在月令得生或同类，有利于命局强旺'
                      : '日元在月令失令，需要其他方面的支持'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-stone-600 min-w-[80px]">得地：</span>
                <div className="flex-1">
                  <span className={pattern.earthlySupport >= 2 ? 'text-green-600' : 'text-orange-600'}>
                    {pattern.earthlySupport}个地支支持
                  </span>
                  <p className="text-xs text-stone-500 mt-1">
                    地支中有{pattern.earthlySupport}个五行生助日元，
                    {pattern.earthlySupport >= 2 ? '根基稳固' : '根基较弱'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-stone-600 min-w-[80px]">得势：</span>
                <div className="flex-1">
                  <span className={pattern.heavenlySupport >= 1 ? 'text-green-600' : 'text-orange-600'}>
                    {pattern.heavenlySupport}个天干支持
                  </span>
                  <p className="text-xs text-stone-500 mt-1">
                    天干中有{pattern.heavenlySupport}个五行生助日元，
                    {pattern.heavenlySupport >= 1 ? '得到外部助力' : '缺乏外部支持'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-stone-600 min-w-[80px]">用神建议：</span>
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    {chart.strength.favorable.map(el => (
                      <span key={el} className={`px-2 py-1 rounded text-xs font-medium ${ELEMENT_COLORS[el]} bg-green-50 border border-green-200`}>
                        {el}（喜用神）
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-stone-500">
                    宜补充喜用神五行，通过颜色、方位、职业等方式增强有利能量
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-stone-600 min-w-[80px]">忌神提示：</span>
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    {chart.strength.unfavorable.map(el => (
                      <span key={el} className={`px-2 py-1 rounded text-xs font-medium ${ELEMENT_COLORS[el]} bg-red-50 border border-red-200`}>
                        {el}（忌神）
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-stone-500">
                    宜避免或克制忌神五行，减少不利影响
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 十神结构 */}
      {activeSection === 'structure' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-bold text-blue-900 mb-3">十神分布统计</h4>
            <div className="space-y-2">
              {tenGods.map(({ god, count }) => (
                <div key={god} className="flex items-center gap-3">
                  <span className="text-stone-700 font-medium min-w-[60px]">{god}：</span>
                  <div className="flex-1 bg-stone-200 rounded-full h-6 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all"
                      style={{ width: `${(count / 8) * 100}%` }}
                    >
                      {count >= 1 && count.toFixed(1)}
                    </div>
                  </div>
                  <span className="text-stone-500 text-xs min-w-[40px]">{count.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
            <h4 className="text-sm font-bold text-stone-700 mb-3">十神含义解读</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-2 bg-white rounded border border-stone-200">
                <span className="font-bold text-stone-700">比肩/劫财：</span>
                <span className="text-stone-600">兄弟朋友、竞争、独立</span>
              </div>
              <div className="p-2 bg-white rounded border border-stone-200">
                <span className="font-bold text-stone-700">食神/伤官：</span>
                <span className="text-stone-600">才华、表达、创造力</span>
              </div>
              <div className="p-2 bg-white rounded border border-stone-200">
                <span className="font-bold text-stone-700">正财/偏财：</span>
                <span className="text-stone-600">财富、物质、配偶</span>
              </div>
              <div className="p-2 bg-white rounded border border-stone-200">
                <span className="font-bold text-stone-700">正官/七杀：</span>
                <span className="text-stone-600">事业、权力、压力</span>
              </div>
              <div className="p-2 bg-white rounded border border-stone-200">
                <span className="font-bold text-stone-700">正印/偏印：</span>
                <span className="text-stone-600">学识、贵人、母亲</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 干支关系 */}
      {activeSection === 'relationship' && (
        <div className="space-y-3">
          {relationships.length > 0 ? (
            relationships.map((rel, idx) => (
              <div key={idx} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <span className="px-2 py-1 bg-amber-600 text-white text-xs font-bold rounded">
                    {rel.type}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-stone-700 font-medium mb-1">{rel.desc}</p>
                    <p className="text-xs text-stone-600">{rel.impact}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-center text-stone-500 text-sm">
              命盘中未发现明显的干支合冲刑害关系
            </div>
          )}

          <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <h4 className="text-xs font-bold text-stone-700 mb-2">干支关系说明</h4>
            <div className="text-xs text-stone-600 space-y-1">
              <p>• <span className="font-medium">合</span>：增强和谐，利于合作，但可能失去独立性</p>
              <p>• <span className="font-medium">冲</span>：带来变动，利于突破，但可能产生动荡</p>
              <p>• <span className="font-medium">刑</span>：带来压力，需要克服困难，磨练意志</p>
              <p>• <span className="font-medium">害</span>：暗中阻碍，需要警惕小人，谨慎行事</p>
            </div>
          </div>
        </div>
      )}

      {/* 藏干分析 */}
      {activeSection === 'hidden' && (
        <div className="space-y-3">
          {hiddenStems.map((item, idx) => (
            <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3 mb-2">
                <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded min-w-[50px] text-center">
                  {item.pillar}
                </span>
                <span className="text-lg font-bold text-stone-700">{item.branch}</span>
              </div>
              <div className="ml-[62px] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-600">藏干：</span>
                  {item.hidden.map((stem, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-white rounded border border-stone-300 font-medium">
                      {stem}（{item.gods[i]}）
                    </span>
                  ))}
                </div>
                <p className="text-xs text-stone-600">
                  <span className="font-medium">影响：</span>{item.impact}
                </p>
              </div>
            </div>
          ))}

          <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <h4 className="text-xs font-bold text-stone-700 mb-2">藏干作用说明</h4>
            <div className="text-xs text-stone-600 space-y-1">
              <p>• 藏干是地支中隐藏的天干，代表潜在的能量和影响</p>
              <p>• 月支藏干最为重要，直接影响格局和用神</p>
              <p>• 日支藏干影响婚姻和配偶关系</p>
              <p>• 藏干在大运流年透出时，会产生重要影响</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaziAnalysis;
