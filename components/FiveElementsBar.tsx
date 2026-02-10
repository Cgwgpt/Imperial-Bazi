
import React, { useState } from 'react';
import { ELEMENT_BG, ELEMENT_COLORS } from '../constants.ts';
import type { ElementType } from '../constants.ts';

interface Props {
  counts: Record<ElementType, number>;
  dayMaster: { char: string; element: ElementType };
  favorable: ElementType[];
  unfavorable: ElementType[];
}

const FiveElementsBar: React.FC<Props> = ({ counts, dayMaster, favorable, unfavorable }) => {
  const elements: ElementType[] = ['木', '火', '土', '金', '水'];
  const total = elements.reduce((a, el) => a + (counts[el] || 0), 0);
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);

  // 五行属性信息
  const elementInfo: Record<ElementType, { 
    nature: string; 
    season: string; 
    direction: string; 
    color: string;
    organ: string;
    personality: string;
    career: string;
  }> = {
    '木': {
      nature: '生发、条达',
      season: '春季',
      direction: '东方',
      color: '青色、绿色',
      organ: '肝胆',
      personality: '仁慈、进取、灵活',
      career: '教育、文化、医疗、林业'
    },
    '火': {
      nature: '炎上、热烈',
      season: '夏季',
      direction: '南方',
      color: '红色、紫色',
      organ: '心脏、小肠',
      personality: '热情、积极、礼貌',
      career: '能源、餐饮、娱乐、电子'
    },
    '土': {
      nature: '稳重、承载',
      season: '四季末',
      direction: '中央',
      color: '黄色、棕色',
      organ: '脾胃',
      personality: '诚信、稳重、包容',
      career: '房地产、农业、建筑、中介'
    },
    '金': {
      nature: '收敛、肃杀',
      season: '秋季',
      direction: '西方',
      color: '白色、金色',
      organ: '肺、大肠',
      personality: '果断、坚毅、理性',
      career: '金融、科技、机械、军警'
    },
    '水': {
      nature: '润下、流动',
      season: '冬季',
      direction: '北方',
      color: '黑色、蓝色',
      organ: '肾、膀胱',
      personality: '智慧、灵活、深沉',
      career: '贸易、物流、旅游、水产'
    }
  };

  // 评估五行状态
  const evaluateElement = (element: ElementType) => {
    const count = counts[element];
    const percent = total > 0 ? (count / total) * 100 : 0;
    
    let status = '';
    let statusColor = '';
    
    if (count === 0) {
      status = '缺失';
      statusColor = 'text-red-600 bg-red-50';
    } else if (percent < 10) {
      status = '偏弱';
      statusColor = 'text-orange-600 bg-orange-50';
    } else if (percent > 30) {
      status = '偏旺';
      statusColor = 'text-blue-600 bg-blue-50';
    } else {
      status = '适中';
      statusColor = 'text-green-600 bg-green-50';
    }
    
    return { status, statusColor };
  };

  // 判断是否为喜用神或忌神
  const getElementRole = (element: ElementType) => {
    if (favorable.includes(element)) return { role: '喜用神', color: 'text-green-600' };
    if (unfavorable.includes(element)) return { role: '忌神', color: 'text-red-600' };
    return { role: '中性', color: 'text-stone-500' };
  };

  return (
    <div className="w-full mt-6 bg-white p-4 rounded-xl shadow-sm border border-stone-200">
      <h3 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
        <span className="w-1 h-4 bg-red-700 rounded-full"></span>
        五行能量分布
        <span className="text-xs font-normal text-stone-500 ml-2">
          （日元：<span className={ELEMENT_COLORS[dayMaster.element]}>{dayMaster.char}{dayMaster.element}</span>）
        </span>
      </h3>
      
      {/* 能量条 */}
      <div className="flex h-8 w-full rounded-full overflow-hidden bg-stone-100 mb-3 shadow-inner">
        {elements.map((el) => {
          const percent = total > 0 ? (counts[el] / total) * 100 : 0;
          if (percent === 0) return null;
          return (
            <div 
              key={el}
              className={`${ELEMENT_BG[el]} transition-all duration-1000 hover:opacity-80 cursor-pointer relative group`}
              style={{ width: `${percent}%` }}
              onClick={() => setSelectedElement(selectedElement === el ? null : el)}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {el}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 五行统计 */}
      <div className="grid grid-cols-5 gap-2 text-center">
        {elements.map((el) => {
          const { status, statusColor } = evaluateElement(el);
          const { role, color } = getElementRole(el);
          const isSelected = selectedElement === el;
          
          return (
            <div 
              key={el} 
              className={`flex flex-col items-center p-2 rounded-lg transition-all cursor-pointer ${
                isSelected ? 'bg-stone-100 shadow-md' : 'hover:bg-stone-50'
              }`}
              onClick={() => setSelectedElement(isSelected ? null : el)}
            >
              <span className={`text-sm font-bold ${ELEMENT_COLORS[el]} mb-1`}>{el}</span>
              <span className="font-bold text-lg text-stone-800">{counts[el]}</span>
              <span className="text-[10px] text-stone-400 mb-1">
                {total > 0 ? ((counts[el]/total)*100).toFixed(0) : '0'}%
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${statusColor} font-medium`}>
                {status}
              </span>
              <span className={`text-[9px] ${color} mt-0.5 font-medium`}>
                {role}
              </span>
            </div>
          );
        })}
      </div>

      {/* 详细信息面板 */}
      {selectedElement && (
        <div className="mt-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
          <h4 className={`text-sm font-bold mb-2 ${ELEMENT_COLORS[selectedElement]}`}>
            {selectedElement}行详解
          </h4>
          
          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-stone-500 min-w-[60px]">数量占比：</span>
              <span className="text-stone-700">
                {counts[selectedElement]}个 / 共{total}个 
                （{total > 0 ? ((counts[selectedElement]/total)*100).toFixed(1) : '0'}%）
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-stone-500 min-w-[60px]">状态评估：</span>
              <span className={evaluateElement(selectedElement).statusColor.split(' ')[0]}>
                {evaluateElement(selectedElement).status}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-stone-500 min-w-[60px]">喜忌属性：</span>
              <span className={getElementRole(selectedElement).color}>
                {getElementRole(selectedElement).role}
                {favorable.includes(selectedElement) && '（宜补充增强）'}
                {unfavorable.includes(selectedElement) && '（宜克制减弱）'}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-stone-500 min-w-[60px]">五行属性：</span>
              <span className="text-stone-700">{elementInfo[selectedElement].nature}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-stone-500 min-w-[60px]">对应季节：</span>
              <span className="text-stone-700">{elementInfo[selectedElement].season}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-stone-500 min-w-[60px]">对应方位：</span>
              <span className="text-stone-700">{elementInfo[selectedElement].direction}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-stone-500 min-w-[60px]">对应颜色：</span>
              <span className="text-stone-700">{elementInfo[selectedElement].color}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-stone-500 min-w-[60px]">对应脏腑：</span>
              <span className="text-stone-700">{elementInfo[selectedElement].organ}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-stone-500 min-w-[60px]">性格特质：</span>
              <span className="text-stone-700">{elementInfo[selectedElement].personality}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-stone-500 min-w-[60px]">适合行业：</span>
              <span className="text-stone-700">{elementInfo[selectedElement].career}</span>
            </div>
          </div>
        </div>
      )}

      {/* 五行生克关系提示 */}
      <div className="mt-3 pt-2 border-t border-stone-200">
        <div className="text-xs text-stone-500 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">五行生克：</span>
            <span>木→火→土→金→水→木（相生） | 木克土、土克水、水克火、火克金、金克木</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">●</span>
            <span>喜用神宜补充</span>
            <span className="text-red-600 ml-3">●</span>
            <span>忌神宜克制</span>
            <span className="text-stone-400 ml-3">点击五行查看详情</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiveElementsBar;
