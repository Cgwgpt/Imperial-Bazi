import React, { useEffect, useState } from 'react';
import { baziDb, HistoryRecord } from '../utils/db';
import PillarDisplay from './PillarDisplay';
import FiveElementsBar from './FiveElementsBar';
import LuckCyclesDisplay from './LuckCyclesDisplay';
import Report from './Report';

interface Props {
    onBack: () => void;
}

const HistoryView: React.FC<Props> = ({ onBack }) => {
    const [records, setRecords] = useState<HistoryRecord[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        setLoading(true);
        try {
            const allRecords = await baziDb.getAllRecords();
            setRecords(allRecords);
        } catch (err) {
            console.error("Failed to load records:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("确定要删除这条记录吗？")) return;
        try {
            await baziDb.deleteRecord(id);
            if (selectedRecord?.id === id) setSelectedRecord(null);
            await loadRecords();
        } catch (err) {
            console.error("Failed to delete record:", err);
        }
    };

    const formatDate = (ts: number) => {
        const d = new Date(ts);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    if (selectedRecord) {
        return (
            <div className="animate-fadeIn">
                <button
                    onClick={() => setSelectedRecord(null)}
                    className="mb-6 flex items-center gap-2 text-stone-600 hover:text-red-900 transition-colors font-bold"
                >
                    <span>⬅️</span> 返回列表
                </button>

                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b-2 border-red-900 pb-4 gap-4">
                    <div className="w-full">
                        <h1 className="text-3xl font-bold font-serif text-stone-900 mb-2">历史记录：八字命盘详批</h1>
                        <div className="text-stone-500 text-sm flex flex-wrap gap-4">
                            <span>姓名：<strong className="text-stone-800">{selectedRecord.name}</strong></span>
                            <span>性别：{selectedRecord.gender === 'male' ? '乾造' : '坤造'}</span>
                            <span>公历：{selectedRecord.birthDate.split('T')[0]}</span>
                            <span>保存于：{formatDate(selectedRecord.timestamp)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-stone-50 p-4 md:p-8 rounded-xl shadow-inner border border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <PillarDisplay pillar={selectedRecord.chart.yearPillar} title="年柱 (根)" />
                    <PillarDisplay pillar={selectedRecord.chart.monthPillar} title="月柱 (苗)" />
                    <PillarDisplay pillar={selectedRecord.chart.dayPillar} title="日柱 (花)" isDay />
                    <PillarDisplay pillar={selectedRecord.chart.hourPillar} title="时柱 (果)" />
                </div>

                <FiveElementsBar
                    counts={selectedRecord.chart.elementCounts}
                    dayMaster={selectedRecord.chart.dayMaster}
                    favorable={selectedRecord.chart.strength.favorable}
                    unfavorable={selectedRecord.chart.strength.unfavorable}
                />

                <LuckCyclesDisplay
                    cycles={selectedRecord.chart.luckCycles}
                    birthYear={new Date(selectedRecord.chart.birthDate).getFullYear()}
                    dayMaster={selectedRecord.chart.dayMaster}
                    favorable={selectedRecord.chart.strength.favorable}
                    unfavorable={selectedRecord.chart.strength.unfavorable}
                />

                <Report
                    chart={selectedRecord.chart}
                    initialAiContent={selectedRecord.aiContent}
                    isHistoryView={true}
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold font-serif text-stone-900">推演历史记录</h1>
                <button
                    onClick={onBack}
                    className="text-stone-500 hover:text-red-900 transition-colors"
                >
                    返回排盘 ⮕
                </button>
            </div>

            {loading ? (
                <div className="flex-grow flex items-center justify-center opacity-30">
                    <div className="w-8 h-8 border-4 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : records.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-stone-400 opacity-50 select-none">
                    <div className="text-6xl mb-6">📜</div>
                    <p className="font-serif text-lg tracking-[0.2em]">暂无历史记录</p>
                    <button
                        onClick={onBack}
                        className="mt-6 text-sm underline decoration-dotted underline-offset-4 hover:text-red-900 transition-colors"
                    >
                        去排出一盘
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 overflow-y-auto pb-10">
                    {records.map((record) => (
                        <div
                            key={record.id}
                            onClick={() => setSelectedRecord(record)}
                            className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-xl group-hover:bg-red-50 group-hover:text-red-900 transition-colors">
                                    {record.gender === 'male' ? '♂️' : '♀️'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-stone-800 mb-1">{record.name} 的命盘详批</h3>
                                    <div className="text-sm text-stone-500 flex gap-4">
                                        <span>{record.birthDate.split('T')[0]}</span>
                                        <span>保存：{formatDate(record.timestamp)}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={(e) => handleDelete(e, record.id)}
                                className="p-3 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                title="删除记录"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryView;
