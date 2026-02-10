import React, { useState, useRef } from 'react';
import { generateBaziChart } from './utils/baziEngine.ts';
import type { BaziChart } from './constants.ts';
import PillarDisplay from './components/PillarDisplay.tsx';
import FiveElementsBar from './components/FiveElementsBar.tsx';
import LuckCyclesDisplay from './components/LuckCyclesDisplay.tsx';
import BaziAnalysis from './components/BaziAnalysis.tsx';
import Report from './components/Report.tsx';
import EncyclopediaArticle from './components/EncyclopediaArticle.tsx';
import Calendar from './components/Calendar.tsx';
import HistoryView from './components/HistoryView.tsx';
import { ENCYCLOPEDIA_CONTENT } from './data/encyclopedia.ts';
import { baziDb } from './utils/db.ts';

// Declare html2pdf as it is loaded from CDN
declare const html2pdf: any;

function App() {
  const [view, setView] = useState<'calculator' | 'encyclopedia' | 'calendar' | 'history'>('calculator');
  const [activeArticleId, setActiveArticleId] = useState(ENCYCLOPEDIA_CONTENT[0].id);
  const [formData, setFormData] = useState({
    name: '张三',
    gender: 'male' as 'male' | 'female',
    date: '1990-06-15',
    time: '12:00',
    city: '北京'
  });
  const [chart, setChart] = useState<BaziChart | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      try {
        const birthDate = new Date(`${formData.date}T${formData.time}`);
        const location = formData.city ? { city: formData.city } : undefined;
        const result = generateBaziChart(formData.name, formData.gender, birthDate, location);
        setChart(result);
      } catch (err) {
        console.error("Bazi Calculation Error:", err);
        alert("排盘计算出错，请检查输入日期是否正确。");
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  const handleExport = async () => {
    if (!chart || exporting) return;
    if (typeof html2pdf === 'undefined') {
      alert("PDF导出功能加载中，请稍后重试");
      return;
    }

    setExporting(true);
    const element = exportRef.current || reportRef.current;
    if (!element) {
      setExporting(false);
      return;
    }

    try {
      console.log("Starting PDF Export... Content height:", element.scrollHeight);
      const opt = {
        margin: 0,
        filename: `${chart.name}_八字详批.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };

      const originalStyle = element.style.cssText;
      element.style.cssText = 'position: fixed; left: 0; top: 0; width: 794px; background: white; padding: 40px; z-index: 99999; display: block; visibility: visible; opacity: 1;';

      const originalScrollX = window.scrollX;
      const originalScrollY = window.scrollY;
      window.scrollTo(0, 0);

      let attempts = 0;
      const maxAttempts = 120;
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const spinners = element.querySelectorAll('.animate-spin');
        if (spinners.length === 0) break;
        attempts++;
      }

      console.log("AI Content fully loaded. Finalizing render...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      await html2pdf().set(opt).from(element).save();

      console.log("PDF generated successfully.");
      element.style.cssText = originalStyle;
      window.scrollTo(originalScrollX, originalScrollY);

    } catch (e: any) {
      console.error("PDF Export Error:", e);
      alert("PDF导出失败: " + (e.message || "未知错误") + "，请重试");
    } finally {
      setExporting(false);
    }
  };

  const activeArticle = ENCYCLOPEDIA_CONTENT.find(a => a.id === activeArticleId) || ENCYCLOPEDIA_CONTENT[0];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row text-stone-800 font-sans">
      <aside className="w-full md:w-96 bg-stone-900 text-stone-200 flex flex-col shrink-0 shadow-2xl relative overflow-hidden h-[300px] md:h-screen transition-all">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none select-none">
          <span className="text-9xl font-serif">命</span>
        </div>
        <div className="p-6 pb-4 z-10 border-b border-stone-800 shrink-0">
          <h1 className="text-2xl font-bold font-serif tracking-widest text-amber-500 mb-1">天机阁</h1>
          <h2 className="text-xs text-stone-400 uppercase tracking-[0.2em]">Imperial Bazi Pro</h2>
        </div>

        <div className="grid grid-cols-4 p-4 gap-2 z-10 shrink-0">
          <button
            onClick={() => setView('calculator')}
            className={`py-3 px-1 rounded text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${view === 'calculator' ? 'bg-red-900 text-white shadow-lg' : 'bg-stone-800 text-stone-400'}`}
          >
            <span className="text-lg">📊</span>
            <span>排盤</span>
          </button>
          <button
            onClick={() => setView('history')}
            className={`py-3 px-1 rounded text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${view === 'history' ? 'bg-red-900 text-white shadow-lg' : 'bg-stone-800 text-stone-400'}`}
          >
            <span className="text-lg">📜</span>
            <span>历史</span>
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`py-3 px-1 rounded text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${view === 'calendar' ? 'bg-red-900 text-white shadow-lg' : 'bg-stone-800 text-stone-400'}`}
          >
            <span className="text-lg">📅</span>
            <span>萬年曆</span>
          </button>
          <button
            onClick={() => setView('encyclopedia')}
            className={`py-3 px-1 rounded text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${view === 'encyclopedia' ? 'bg-red-900 text-white shadow-lg' : 'bg-stone-800 text-stone-400'}`}
          >
            <span className="text-lg">📖</span>
            <span>學堂</span>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto z-10 px-6 py-2">
          {view === 'calculator' && (
            <form onSubmit={handleCalculate} className="flex flex-col gap-5 py-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">姓名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 focus:outline-none focus:border-amber-500 transition-colors placeholder-stone-600"
                  placeholder="请输入姓名"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">性别</label>
                <div className="flex bg-stone-800 rounded p-1 border border-stone-700">
                  <button type="button" onClick={() => setFormData({ ...formData, gender: 'male' })} className={`flex-1 py-2 rounded text-sm transition-all ${formData.gender === 'male' ? 'bg-stone-700 text-amber-500 font-bold' : 'text-stone-400'}`}>乾造 (男)</button>
                  <button type="button" onClick={() => setFormData({ ...formData, gender: 'female' })} className={`flex-1 py-2 rounded text-sm transition-all ${formData.gender === 'female' ? 'bg-stone-700 text-amber-500 font-bold' : 'text-stone-400'}`}>坤造 (女)</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">出生日期 (公历)</label>
                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">出生时间</label>
                <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">出生地点（校正）</label>
                <select
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded p-3 text-stone-100 focus:outline-none focus:border-amber-500 text-sm"
                >
                  {["北京", "上海", "广州", "深圳", "成都", "武汉", "西安", "南京", "杭州", "重庆", "香港", "台北", "哈尔滨", "乌鲁木齐", "拉萨"].map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                  <option value="">不校正</option>
                </select>
              </div>
              <button disabled={loading} className="mt-2 bg-red-900 hover:bg-red-800 text-white font-bold py-4 px-6 rounded shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 border border-red-800">
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>推演中...</span></> : <><span className="text-xl">🔮</span><span>开始推演</span></>}
              </button>
            </form>
          )}

          {view === 'encyclopedia' && (
            <div className="flex flex-col gap-1 py-4">
              {ENCYCLOPEDIA_CONTENT.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setActiveArticleId(article.id)}
                  className={`text-left px-4 py-3 rounded transition-colors text-sm ${activeArticleId === article.id ? 'bg-stone-800 text-amber-500 font-bold' : 'text-stone-300 hover:bg-stone-800/50'}`}
                >
                  {article.title}
                </button>
              ))}
            </div>
          )}

          {(view === 'history' || view === 'calendar') && (
            <div className="h-full flex flex-col items-center justify-center text-stone-600 opacity-50 py-10">
              <span className="text-4xl mb-4">{view === 'history' ? '📜' : '📅'}</span>
              <p className="text-xs text-center">正在查看{view === 'history' ? '历史记录' : '万年历'}</p>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative h-[calc(100vh-300px)] md:h-screen">
        {view === 'calculator' && (
          <div className="max-w-4xl mx-auto h-full">
            {!chart ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 opacity-50 select-none min-h-[400px]">
                <div className="w-24 h-24 border-2 border-stone-300 rounded-full flex items-center justify-center mb-6">
                  <span className="text-5xl text-stone-300">☯</span>
                </div>
                <p className="font-serif text-lg tracking-[0.3em]">请输入生辰信息开启命理推演</p>
              </div>
            ) : (
              <div ref={reportRef} className="pb-10 animate-fadeIn">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b-2 border-red-900 pb-4 gap-4">
                  <div className="w-full">
                    <h1 className="text-3xl font-bold font-serif text-stone-900 mb-2">八字命盘详批</h1>
                    <div className="text-stone-500 text-sm flex flex-wrap gap-4">
                      <span>姓名：<strong className="text-stone-800">{chart.name}</strong></span>
                      <span>性别：{chart.gender === 'male' ? '乾造' : '坤造'}</span>
                      <span>公历：{chart.birthDate.split('T')[0]}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="shrink-0 bg-stone-800 text-white px-4 py-2 rounded text-sm hover:bg-stone-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {exporting ? <><span className="animate-spin">⏳</span> 生成中...</> : <><span className="text-lg">📥</span> 保存 PDF</>}
                  </button>
                </div>

                <div className="bg-stone-50 p-4 md:p-8 rounded-xl shadow-inner border border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                  <PillarDisplay pillar={chart.yearPillar} title="年柱 (根)" />
                  <PillarDisplay pillar={chart.monthPillar} title="月柱 (苗)" />
                  <PillarDisplay pillar={chart.dayPillar} title="日柱 (花)" isDay />
                  <PillarDisplay pillar={chart.hourPillar} title="时柱 (果)" />
                </div>

                <FiveElementsBar
                  counts={chart.elementCounts}
                  dayMaster={chart.dayMaster}
                  favorable={chart.strength.favorable}
                  unfavorable={chart.strength.unfavorable}
                />

                <LuckCyclesDisplay
                  cycles={chart.luckCycles}
                  birthYear={new Date(chart.birthDate).getFullYear()}
                  dayMaster={chart.dayMaster}
                  favorable={chart.strength.favorable}
                  unfavorable={chart.strength.unfavorable}
                />

                <Report
                  chart={chart}
                  onSave={async (aiContent) => {
                    try {
                      await baziDb.addRecord({
                        id: `${chart.id}-${Date.now()}`,
                        timestamp: Date.now(),
                        name: chart.name,
                        gender: chart.gender,
                        birthDate: chart.birthDate,
                        chart: chart,
                        aiContent: aiContent
                      });
                      alert("记录已保存到本地历史");
                    } catch (err) {
                      console.error("Save failed:", err);
                      alert("保存失败");
                    }
                  }}
                />

                {/* Hidden Export Element */}
                <div ref={exportRef} style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: '794px', backgroundColor: 'white', padding: '20px', zIndex: -9999 }}>
                  <div className="pb-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b-2 border-red-900 pb-4 gap-4">
                      <div className="w-full">
                        <h1 className="text-3xl font-bold font-serif text-stone-900 mb-2">八字命盘详批</h1>
                        <div className="text-stone-500 text-sm flex flex-wrap gap-4">
                          <span>姓名：<strong className="text-stone-800">{chart.name}</strong></span>
                          <span>性别：{chart.gender === 'male' ? '乾造' : '坤造'}</span>
                          <span>公历：{chart.birthDate.split('T')[0]}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-stone-50 p-4 md:p-8 rounded-xl shadow-inner border border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                      <PillarDisplay pillar={chart.yearPillar} title="年柱 (根)" />
                      <PillarDisplay pillar={chart.monthPillar} title="月柱 (苗)" />
                      <PillarDisplay pillar={chart.dayPillar} title="日柱 (花)" isDay />
                      <PillarDisplay pillar={chart.hourPillar} title="时柱 (果)" />
                    </div>
                    <FiveElementsBar counts={chart.elementCounts} dayMaster={chart.dayMaster} favorable={chart.strength.favorable} unfavorable={chart.strength.unfavorable} />
                    <LuckCyclesDisplay cycles={chart.luckCycles} birthYear={new Date(chart.birthDate).getFullYear()} dayMaster={chart.dayMaster} favorable={chart.strength.favorable} unfavorable={chart.strength.unfavorable} />
                    <Report chart={chart} exportMode={true} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'calendar' && (
          <div className="max-w-5xl mx-auto p-4 md:p-6 h-full overflow-y-auto">
            <Calendar />
          </div>
        )}

        {view === 'history' && (
          <HistoryView onBack={() => setView('calculator')} />
        )}

        {view === 'encyclopedia' && (
          <div className="max-w-4xl mx-auto h-full">
            <EncyclopediaArticle title={activeArticle.title} content={activeArticle.content} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
