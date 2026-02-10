
import React from 'react';
import type { Pillar } from '../constants.ts';
import { ELEMENT_COLORS } from '../constants.ts';

interface Props {
  pillar: Pillar;
  title: string;
  isDay?: boolean;
}

const PillarDisplay: React.FC<Props> = ({ pillar, title, isDay }) => {
  return (
    <div className={`flex flex-col items-center p-3 rounded-lg border-2 ${isDay ? 'border-amber-600 bg-amber-50/50' : 'border-stone-300 bg-white/50'} shadow-sm min-w-[80px]`}>
      <div className="text-xs text-stone-500 mb-2 font-serif tracking-widest">{title}</div>
      <div className="text-[10px] text-stone-400 h-4 mb-1">{isDay ? '日主' : pillar.tenGod}</div>
      <div className={`text-4xl font-bold mb-4 font-serif ${ELEMENT_COLORS[pillar.stem.element]}`}>
        {pillar.stem.char}
      </div>
      <div className={`text-4xl font-bold mb-2 font-serif ${ELEMENT_COLORS[pillar.branch.element]}`}>
        {pillar.branch.char}
      </div>
      <div className="flex flex-col gap-0.5 items-center mt-2 border-t border-stone-200 pt-1 w-full">
        {pillar.branch.hiddenStems.map((s, i) => (
          <div key={i} className="flex justify-between w-full px-1 text-[10px]">
             <span className="text-stone-400 scale-90">{pillar.hiddenGods[i]}</span>
             <span className="text-stone-600 font-medium">{s}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[10px] bg-stone-200 px-1.5 py-0.5 rounded text-stone-600">
        {pillar.lifeStage}
      </div>
    </div>
  );
};

export default PillarDisplay;
