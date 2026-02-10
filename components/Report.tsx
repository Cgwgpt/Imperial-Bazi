
import React, { useState, useEffect, useRef } from 'react';
import type { BaziChart } from '../constants.ts';
import { speakText } from '../utils/ttsEngine.ts';
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from 'openai';
import { API_CONFIG } from '../config.ts';
import BaziAnalysis from './BaziAnalysis.tsx';
import { marked } from 'marked';

// Configure marked to support GitHub Flavored Markdown
marked.setOptions({
  gfm: true,
  breaks: true,
});

interface Props {
  chart: BaziChart;
  exportMode?: boolean;
  initialAiContent?: Record<string, string>;
  onSave?: (content: Record<string, string>) => void;
  isHistoryView?: boolean;
}

const Report: React.FC<Props> = ({ chart, exportMode = false, initialAiContent, onSave, isHistoryView = false }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'summary' | 'career' | 'wealth' | 'relationship' | 'health' | 'children' | 'education' | 'social' | 'yearly' | 'advice'>('analysis');
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const generatedCache = useRef<Record<string, string>>(initialAiContent || {});

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    alert("内容已复制到剪贴板");
  };

  const handleShare = async () => {
    if (!content) return;
    const shareText = `【天机阁八字详批 - ${activeTab === 'analysis' ? '命盘' : tabTitles[activeTab]}】\n姓名：${chart.name}\n${content}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `天机阁 - ${chart.name}的命理报告`,
          text: shareText,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("内容已复制分享文本到剪贴板");
    }
  };

  const handleSaveToHistory = () => {
    if (onSave) {
      // Create a clean copy of the cache without the chart.id prefix in keys
      const cleanContent: Record<string, string> = {};
      Object.keys(generatedCache.current).forEach(key => {
        const cleanKey = key.includes('-') ? key.split('-').slice(1).join('-') : key;
        cleanContent[cleanKey] = generatedCache.current[key];
      });
      onSave(cleanContent);
    }
  };

  const handleSpeak = async () => {
    if (!content) return;

    if (speaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      setSpeaking(true);
      setIsPaused(false);
      try {
        await speakText(content, () => {
          setSpeaking(false);
          setIsPaused(false);
        });
      } catch (error) {
        console.error('Speech error:', error);
        setSpeaking(false);
        setIsPaused(false);
      }
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setIsPaused(false);
  };

  const tabTitles: Record<typeof activeTab, string> = {
    analysis: '命盘详批',
    summary: '命局总评',
    career: '事业运势',
    wealth: '财富运势',
    relationship: '婚姻情感',
    health: '健康养生',
    children: '子女运势',
    education: '学业运势',
    social: '人际关系',
    yearly: '流年运势',
    advice: '人生建议'
  };

  const generateReport = async (tabOverride?: typeof activeTab) => {
    const targetTab = tabOverride || activeTab;
    if (targetTab === 'analysis') return;

    const cacheKey = isHistoryView ? targetTab : `${chart.id}-${targetTab}`;
    if (generatedCache.current[cacheKey]) {
      if (!tabOverride) setContent(generatedCache.current[cacheKey]);
      return;
    }

    if (!tabOverride) {
      setLoading(true);
      setContent("");
    }

    // If we are in history view and content is not cached, don't try to generate
    if (isHistoryView) {
      if (!tabOverride) {
        setContent("该项记录暂无 AI 推演内容。");
        setLoading(false);
      }
      return;
    }

    try {
      const provider = (import.meta as any).env?.VITE_AI_PROVIDER || API_CONFIG.AI_PROVIDER || 'gemini';
      const apiKey = provider === 'deepseek'
        ? ((import.meta as any).env?.VITE_DEEPSEEK_API_KEY || API_CONFIG.DEEPSEEK_API_KEY)
        : ((import.meta as any).env?.VITE_GEMINI_API_KEY || API_CONFIG.GEMINI_API_KEY);

      if (!apiKey) throw new Error(`${provider} API Key not configured`);

      const chartInfo = `
命主：${chart.name}（${chart.gender === 'male' ? '乾造' : '坤造'}）
日元：${chart.dayMaster.char}${chart.dayMaster.element}（${chart.dayMaster.polarity}）
格局：${chart.strength.verdict}（强度${chart.strength.score}分）
喜用神：${chart.strength.favorable.join('、')}
忌神：${chart.strength.unfavorable.join('、')}
五行分布：木${chart.elementCounts['木']} 火${chart.elementCounts['火']} 土${chart.elementCounts['土']} 金${chart.elementCounts['金']} 水${chart.elementCounts['水']}
年柱：${chart.yearPillar.stem.char}${chart.yearPillar.branch.char}（${chart.yearPillar.tenGod}）
月柱：${chart.monthPillar.stem.char}${chart.monthPillar.branch.char}（${chart.monthPillar.tenGod}）
日柱：${chart.dayPillar.stem.char}${chart.dayPillar.branch.char}
时柱：${chart.hourPillar.stem.char}${chart.hourPillar.branch.char}（${chart.hourPillar.tenGod}）
      `.trim();

      const prompts: Record<string, string> = {
        summary: `你是一位德高望重的子平八字大师，精通命理推演。请基于以下命盘信息，给出全面的命局总评：\n\n${chartInfo}\n\n请从以下角度分析（400-500字）：\n1. **命格特征**：分析日元强弱、格局高低、命局层次\n2. **性格特质**：根据五行配置和十神组合，分析性格优势与不足\n3. **人生格局**：整体运运势走向、人生发展潜力\n4. **核心建议**：3-5条具体可行的人生指导建议\n\n要求：\n- 语言古朴典雅，但通俗易懂\n- 避免模糊表述，给出明确判断\n- 提供可操作的具体建议\n- 使用Markdown格式，包含标题和列表`,
        career: `你是一位精通事业规划的命理大师。请基于以下命盘信息，给出事业财运分析：\n\n${chartInfo}\n\n请详细分析（400-500字）：\n1. **事业方向**：适合的行业领域（结合五行喜忌）\n2. **职业特质**：工作风格、领导力、执行力评估\n3. **发展时机**：事业高峰期、转折期的大运流年\n4. **晋升路径**：升职加薪的关键因素和时间节点\n5. **实操建议**：3-5条具体的职业发展策略\n\n要求：\n- 结合现代职场环境\n- 给出具体行业和岗位建议\n- 标注关键时间节点（年龄段）\n- 使用Markdown格式`,
        wealth: `你是一位精通财富规划的命理大师。请基于以下命盘信息，给出财运分析：\n\n${chartInfo}\n\n请详细分析（400-500字）：\n1. **财富格局**：正财偏财、财运强弱、财富层次\n2. **求财方式**：适合的赚钱模式（工资、投资、创业等）\n3. **财运周期**：发财时机、破财风险的大运流年\n4. **投资建议**：适合的投资方向和风险偏好\n5. **理财策略**：5条具体的财富积累建议\n\n要求：\n- 区分正财和偏财机会\n- 给出具体投资方向（房产、股票、创业等）\n- 标注财运高峰期和低谷期\n- 使用Markdown格式`,
        relationship: `你是一位精通婚姻情感的命理大师。请基于以下命盘信息，给出婚姻情感分析：\n\n${chartInfo}\n\n请详细分析（400-500字）：\n1. **婚姻格局**：婚姻宫状况、配偶特征、婚姻质量\n2. **感情模式**：恋爱风格、情感需求、相处之道\n3. **配偶画像**：理想伴侣的性格、职业、外貌特征\n4. **姻缘时机**：结婚最佳时期、感情波动期\n5. **婚姻建议**：5条维护感情的具体方法\n\n要求：\n- 描述配偶特征要具体\n- 给出最佳结婚年龄段\n- 提供实用的相处技巧\n- 使用Markdown格式`,
        health: `你是一位精通养生保健的命理大师。请基于以下命盘信息，给出健康养生分析：\n\n${chartInfo}\n\n请详细分析（400-500字）：\n1. **体质特征**：五行偏颇导致的体质类型\n2. **健康隐患**：易患疾病、薄弱器官、高发年龄段\n3. **养生方向**：饮食调理、运动方式、作息建议\n4. **疾病预防**：针对性的预防措施和体检项目\n5. **调理方案**：5条具体的日常养生建议\n\n要求：\n- 结合中医五行养生理论\n- 给出具体食物、运动、作息建议\n- 标注健康风险期\n- 使用Markdown格式`,
        advice: `你是一位德高望重的人生导师。请基于以下命盘信息，给出人生规划建议：\n\n${chartInfo}\n\n请提供全面的人生指导（400-500字）：\n1. **人生定位**：核心优势、发展方向、人生使命\n2. **阶段规划**：30岁前、30-40岁、40-50岁、50岁后的重点\n3. **趋吉避凶**：如何发挥优势、规避劣势\n4. **修身养性**：性格修炼、心态调整的具体方法\n5. **行动清单**：10条立即可执行的改运建议\n\n要求：\n- 按年龄段给出具体规划\n- 建议要具体可执行\n- 包含精神和物质两个层面\n- 使用Markdown格式，包含编号列表`,
        children: `你是一位精通子女缘分的命理大师。请基于以下命盘信息，给出子女运势分析：\n\n${chartInfo}\n\n请详细分析（400-500字）：\n1. **子女缘分**：子女数量、性别倾向、与子女关系\n2. **子女教育**：子女天赋、适合的教育方向、亲子沟通建议\n3. **生育时机**：最佳生育年龄、有利的年份\n4. **子女健康**：需要注意的健康问题\n5. **子女发展**：子女未来发展方向、职业倾向\n\n要求：\n- 结合现代育儿理念\n- 给出具体的教育建议\n- 标注有利的生育时期\n- 使用Markdown格式`,
        education: `你是一位精通学业发展的命理大师。请基于以下命盘信息，给出学业运势分析：\n\n${chartInfo}\n\n请详细分析（400-500字）：\n1. **学习能力**：记忆力、理解力、创造力评估\n2. **学业方向**：适合的专业领域、学科优势\n3. **考试运势**：重要考试（中考、高考、考研等）的有利时期\n4. **求学建议**：学习方法、时间管理、应试技巧\n5. **终身学习**：适合的进修方向、技能提升建议\n\n要求：\n- 结合现代教育体系\n- 给出具体的学习策略\n- 标注关键考试年份\n- 使用Markdown格式`,
        social: `你是一位精通人际关系的命理大师。请基于以下命盘信息，给出人际关系分析：\n\n${chartInfo}\n\n请详细分析（400-500字）：\n1. **贵人运势**：贵人类型、出现时机、如何识别\n2. **小人防范**：需要注意的人际关系风险、防范措施\n3. **社交模式**：社交风格、人脉积累策略\n4. **团队合作**：在团队中的角色、合作建议\n5. **沟通技巧**：有效的沟通方式、冲突解决方法\n\n要求：\n- 结合现代职场社交\n- 给出具体的社交建议\n- 标注贵人出现的时期\n- 使用Markdown格式`,
        yearly: `你是一位精通流年运势的命理大师。请基于以下命盘信息，给出未来三年流年运势分析：\n\n${chartInfo}\n\n请详细分析（400-500字）：\n1. **2026年运势**：整体运势、重点领域、注意事项\n2. **2027年运势**：机遇与挑战、关键月份\n3. **2028年运势**：发展趋势、重要转折点\n4. **流年建议**：每年具体的行动建议\n5. **风险防范**：需要避免的风险、化解方法\n\n要求：\n- 结合具体年份\n- 给出明确的月份提示\n- 提供可执行的建议\n- 使用Markdown格式`
      };

      const prompt = prompts[targetTab] || `请根据以下八字命盘给出${tabTitles[targetTab]}分析：\n\n${chartInfo}`;
      let fullText = "";

      if (provider === 'deepseek') {
        const client = new OpenAI({ apiKey, baseURL: 'https://api.deepseek.com', dangerouslyAllowBrowser: true });
        const response = await client.chat.completions.create({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          stream: true
        });
        for await (const chunk of response) {
          fullText += chunk.choices[0]?.delta?.content || '';
          if (!tabOverride) setContent(fullText);
        }
      } else {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContentStream(prompt);
        for await (const chunk of result.stream) {
          fullText += chunk.text();
          if (!tabOverride) setContent(fullText);
        }
      }
      generatedCache.current[cacheKey] = fullText;
    } catch (error: any) {
      console.error("AI Report Error:", error);
      if (!tabOverride) setContent("生成出错，请重试。");
    } finally {
      if (!tabOverride) setLoading(false);
    }
  };

  useEffect(() => {
    if (exportMode) {
      const aiTabs = ['summary', 'career', 'wealth', 'relationship', 'health', 'children', 'education', 'social', 'yearly', 'advice'] as const;
      const generateAll = async () => {
        for (const tab of aiTabs) {
          const cacheKey = isHistoryView ? tab : `${chart.id}-${tab}`;
          if (!generatedCache.current[cacheKey]) await generateReport(tab);
        }
      };
      generateAll();
    } else {
      generateReport();
    }
  }, [activeTab, chart.id, exportMode]);

  if (exportMode) {
    // Render all sections for export
    const aiTabs = ['summary', 'career', 'wealth', 'relationship', 'health', 'children', 'education', 'social', 'yearly', 'advice'] as const;
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="border-b border-stone-100 p-6">
            <h2 className="text-xl font-bold text-purple-900">🔮 命盘详批</h2>
          </div>
          <div className="p-8">
            <BaziAnalysis chart={chart} exportMode={true} />
          </div>
        </div>

        {aiTabs.map((tabKey, index) => {
          const cacheKey = isHistoryView ? tabKey : `${chart.id}-${tabKey}`;
          const cachedContent = generatedCache.current[cacheKey];
          return (
            <div key={tabKey} className={`bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden ${index > 0 ? 'pdf-page-break' : ''}`}>
              <div className="border-b border-stone-100 p-6">
                <h2 className="text-xl font-bold text-red-900">{tabTitles[tabKey]}</h2>
              </div>
              <div className="p-8 font-serif leading-loose">
                {cachedContent ? (
                  <div
                    className="prose prose-stone max-w-none text-stone-700"
                    dangerouslySetInnerHTML={{ __html: marked.parse(cachedContent) }}
                  />
                ) : (
                  <div className="flex items-center gap-3 text-stone-500 italic">
                    <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
                    正在自动推演 {tabTitles[tabKey]}...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Normal tabbed view
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mt-6">
      <div className="border-b border-stone-100 p-2 md:p-0">
        <div className="flex overflow-x-auto scrollbar-hide">
          <button onClick={() => setActiveTab('analysis')} className={`py-4 px-6 text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'analysis' ? 'text-purple-900 bg-purple-50 border-b-2 border-purple-900' : 'text-stone-500 hover:text-stone-800'}`}>
            🔮 命盘详批
          </button>
          {(Object.keys(tabTitles) as Array<keyof typeof tabTitles>).filter(t => t !== 'analysis').map(tabKey => (
            <button key={tabKey} onClick={() => setActiveTab(tabKey)} className={`py-4 px-6 text-sm font-bold transition-all whitespace-nowrap ${activeTab === tabKey ? 'text-red-900 bg-red-50 border-b-2 border-red-900' : 'text-stone-500 hover:text-stone-800'}`}>
              {tabTitles[tabKey]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between px-4 pb-3 gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleSpeak}
              disabled={loading || !content}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all ${speaking && !isPaused ? 'bg-amber-600 text-white' :
                speaking && isPaused ? 'bg-stone-600 text-white' :
                  'bg-stone-100 text-stone-600 hover:bg-stone-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {speaking && !isPaused ? <>⏸️ 暂停</> : speaking && isPaused ? <>▶️ 继续</> : <>🔊 聆听</>}
            </button>
            {speaking && (
              <button onClick={handleStop} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all bg-red-600 text-white hover:bg-red-700">
                ⏹️ 停止
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {!isHistoryView && onSave && (
              <button
                onClick={handleSaveToHistory}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all bg-green-600 text-white hover:bg-green-700"
              >
                💾 保存到历史
              </button>
            )}
            <button
              onClick={handleCopy}
              disabled={!content}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-50"
            >
              📋 复制
            </button>
            <button
              onClick={handleShare}
              disabled={!content}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
            >
              🔗 分享
            </button>
          </div>
        </div>
      </div>
      <div className="p-8 min-h-[300px] font-serif leading-loose">
        {activeTab === 'analysis' ? (
          <BaziAnalysis chart={chart} />
        ) : loading && !content ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-30">
            <div className="w-6 h-6 border-2 border-stone-800 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="animate-pulse">正在推演天机...</p>
          </div>
        ) : (
          <div
            className="prose prose-stone max-w-none text-stone-700"
            dangerouslySetInnerHTML={{ __html: content ? marked.parse(content) : "尚未生成批语。" }}
          />
        )}
      </div>
    </div>
  );
};

export default Report;
