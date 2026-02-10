
import React, { useState } from 'react';
import { ELEMENT_COLORS, ELEMENT_RELATIONS, EARTHLY_BRANCHES } from '../constants.ts';
import type { LuckCycle, Stem, ElementType } from '../constants.ts';

interface Props {
  cycles: LuckCycle[];
  birthYear: number;
  dayMaster: Stem;
  favorable: ElementType[];
  unfavorable: ElementType[];
}

const LuckCyclesDisplay: React.FC<Props> = ({ cycles, birthYear, dayMaster, favorable, unfavorable }) => {
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null);

  // 判断大运吉凶
  const evaluateCycle = (cycle: LuckCycle) => {
    const stemElement = cycle.stem.element;
    const branchElement = cycle.branch.element;

    let score = 0;
    if (favorable.includes(stemElement)) score += 2;
    if (favorable.includes(branchElement)) score += 2;
    if (unfavorable.includes(stemElement)) score -= 2;
    if (unfavorable.includes(branchElement)) score -= 2;

    if (score >= 3) return { level: '大吉', color: 'text-green-600 bg-green-50', border: 'border-green-300' };
    if (score >= 1) return { level: '吉', color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-300' };
    if (score <= -3) return { level: '大凶', color: 'text-red-600 bg-red-50', border: 'border-red-300' };
    if (score <= -1) return { level: '凶', color: 'text-orange-600 bg-orange-50', border: 'border-orange-300' };
    return { level: '平', color: 'text-stone-600 bg-stone-50', border: 'border-stone-300' };
  };

  // 获取五行生克关系描述
  const getElementRelation = (element: ElementType) => {
    const relation = ELEMENT_RELATIONS[dayMaster.element][element];
    const relationMap: Record<string, string> = {
      'Same': '比劫',
      'IBirth': '食伤',
      'IControl': '财星',
      'ControlsMe': '官杀',
      'BirthsMe': '印星'
    };
    return relationMap[relation] || '';
  };

  return (
    <div className="w-full mt-6 bg-white p-4 rounded-xl shadow-sm border border-stone-200">
      <h3 className="text-sm font-bold text-stone-700 mb-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-amber-600 rounded-full"></span>
        流年大运
        <span className="text-xs font-normal text-stone-500 ml-2">（每步大运10年）</span>
      </h3>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {cycles.map((cycle, idx) => {
            const evaluation = evaluateCycle(cycle);
            const isSelected = selectedCycle === idx;

            return (
              <div
                key={idx}
                className={`flex flex-col items-center min-w-[90px] p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${isSelected ? `${evaluation.border} shadow-md` : 'border-stone-200'
                  }`}
                onClick={() => setSelectedCycle(isSelected ? null : idx)}
              >
                <span className="text-[10px] text-stone-400 mb-1">
                  {cycle.startAge}-{cycle.startAge + 9}岁
                </span>

                <div className="flex flex-col items-center gap-1 my-2">
                  <div className={`font-bold text-2xl font-serif ${ELEMENT_COLORS[cycle.stem.element]}`}>
                    {cycle.stem.char}
                  </div>
                  <div className={`font-bold text-2xl font-serif ${ELEMENT_COLORS[cycle.branch.element]}`}>
                    {cycle.branch.char}
                  </div>
                </div>

                <div className={`text-[10px] px-2 py-0.5 rounded-full ${evaluation.color} font-medium mb-1`}>
                  {evaluation.level}
                </div>

                <span className="text-[10px] text-stone-400">
                  {birthYear + cycle.startAge}年
                </span>

                <div className="text-[9px] text-stone-500 mt-1">
                  {cycle.tenGod}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedCycle !== null && (
        <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
          <h4 className="text-sm font-bold text-stone-700 mb-3">
            {cycles[selectedCycle].startAge}-{cycles[selectedCycle].startAge + 9}岁 大运详解
          </h4>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-stone-500 min-w-[60px]">干支：</span>
              <span className="text-stone-700">
                <span className={`font-bold ${ELEMENT_COLORS[cycles[selectedCycle].stem.element]}`}>
                  {cycles[selectedCycle].stem.char}
                </span>
                <span className="text-stone-400 mx-1">·</span>
                <span className={`font-bold ${ELEMENT_COLORS[cycles[selectedCycle].branch.element]}`}>
                  {cycles[selectedCycle].branch.char}
                </span>
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-stone-500 min-w-[60px]">五行：</span>
              <span className="text-stone-700">
                天干{cycles[selectedCycle].stem.element}
                （{getElementRelation(cycles[selectedCycle].stem.element)}）、
                地支{cycles[selectedCycle].branch.element}
                （{getElementRelation(cycles[selectedCycle].branch.element)}）
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-stone-500 min-w-[60px]">十神：</span>
              <span className="text-stone-700">{cycles[selectedCycle].tenGod}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-stone-500 min-w-[60px]">地支藏干：</span>
              <span className="text-stone-700">
                {EARTHLY_BRANCHES[cycles[selectedCycle].branch.char].hiddenStems.join('、')}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-stone-500 min-w-[60px]">吉凶评价：</span>
              <span className={evaluateCycle(cycles[selectedCycle]).color.split(' ')[0]}>
                {evaluateCycle(cycles[selectedCycle]).level}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-stone-500 min-w-[60px]">运势分析：</span>
              <div className="text-stone-700 flex-1">
                {(() => {
                  const cycle = cycles[selectedCycle];
                  const evaluation = evaluateCycle(cycle);
                  const stemRel = getElementRelation(cycle.stem.element);
                  const branchRel = getElementRelation(cycle.branch.element);

                  if (evaluation.level === '大吉' || evaluation.level === '吉') {
                    return `此运天干为${stemRel}，地支为${branchRel}，五行配置有利，适合发展事业、拓展人际关系。建议把握机遇，积极进取。`;
                  } else if (evaluation.level === '大凶' || evaluation.level === '凶') {
                    return `此运天干为${stemRel}，地支为${branchRel}，五行配置不利，宜谨慎行事，避免重大决策。建议保守稳健，修身养性。`;
                  } else {
                    return `此运天干为${stemRel}，地支为${branchRel}，五行配置平和，运势平稳。建议顺势而为，稳中求进。`;
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-stone-200">
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>大吉/吉运</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-stone-400"></span>
            <span>平运</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>凶/大凶运</span>
          </div>
          <span className="ml-auto">点击大运查看详细信息</span>
        </div>
      </div>
    </div>
  );
};

export default LuckCyclesDisplay;
