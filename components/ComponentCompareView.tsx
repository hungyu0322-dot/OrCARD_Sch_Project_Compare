
import React, { useState } from 'react';
import { 
  Package, ChevronRight, ArrowRight, ExternalLink, RefreshCw, Hash 
} from 'lucide-react';
import { CompCompareResults, CompDiff, Part } from '../types';

interface ComponentCompareViewProps {
  results: CompCompareResults;
  filterText: string;
}

export default function ComponentCompareView({ results, filterText }: ComponentCompareViewProps) {
  const [activeTab, setActiveTab] = useState<'added' | 'removed' | 'footprintDiff' | 'valueDiff' | 'pnDiff'>('footprintDiff');

  const tabs = [
    { id: 'added', label: 'Added', count: results.stats.added },
    { id: 'removed', label: 'Removed', count: results.stats.removed },
    { id: 'footprintDiff', label: 'Footprints', count: results.stats.footprintDiff },
    { id: 'valueDiff', label: 'Values', count: results.stats.valueDiff },
    { id: 'pnDiff', label: 'Part Numbers', count: results.stats.pnDiff }
  ];

  const getFilteredList = () => {
    const list = results[activeTab as keyof CompCompareResults] as any[];
    if (!filterText) return list;
    const low = filterText.toLowerCase();
    return list.filter(item => {
      const ref = item.ref || (item as any).new?.ref;
      return ref?.toLowerCase().includes(low);
    });
  };

  const PNLink = ({ pn }: { pn: string }) => {
    if (!pn || pn === 'N/A') return <span className="text-slate-400 italic">N/A</span>;
    return (
      <a 
        href={`https://idesign.advantech.com/iDesignVite3/#/PartMart/EE/Detail/${pn}/PartDetail?tab=Parameters`} 
        target="_blank" 
        className="group inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
      >
        <span className="font-mono">{pn}</span>
        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100" />
      </a>
    );
  };

  const DiffRow = ({ label, oldVal, newVal, isPN = false }: { label: string, oldVal: string, newVal: string, isPN?: boolean }) => (
    <div className="flex flex-col gap-1 py-1 px-3 rounded-lg hover:bg-slate-50/50">
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <div className="flex items-center gap-3 text-xs font-mono">
        <span className="text-slate-400 line-through decoration-slate-300">{isPN ? <PNLink pn={oldVal} /> : oldVal}</span>
        <ArrowRight size={10} className="text-slate-300" />
        <span className="text-blue-700 font-black">{isPN ? <PNLink pn={newVal} /> : newVal}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === tab.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            <span className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px] font-black text-slate-500">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-6 py-4 w-32">Reference</th>
              <th className="px-6 py-4 w-48">Page Info</th>
              <th className="px-6 py-4">Design Property Diffs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {getFilteredList().map((item, idx) => {
              const isDiff = activeTab.includes('Diff');
              const n = isDiff ? (item as CompDiff).new : (item as Part);
              const o = isDiff ? (item as CompDiff).old : null;

              return (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-900 font-mono tracking-tight">{n.ref}</div>
                    <div className={`mt-1.5 text-[9px] px-1.5 py-0.5 rounded-full border w-fit font-black tracking-widest uppercase ${n.classification.color}`}>
                      {n.classification.type}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-500 font-medium truncate max-w-[180px]" title={n.page}>
                      {n.page}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">{n.schematic}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-4">
                      {isDiff && o ? (
                        <>
                          {activeTab === 'footprintDiff' && <DiffRow label="Footprint" oldVal={o.footprint} newVal={n.footprint} />}
                          {activeTab === 'valueDiff' && <DiffRow label="Value" oldVal={o.value} newVal={n.value} />}
                          {activeTab === 'pnDiff' && <DiffRow label="Part Number" oldVal={o.pn} newVal={n.pn} isPN />}
                          
                          <div className="w-px h-8 bg-slate-100 self-center mx-2" />
                          
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Context</span>
                            <div className="text-[10px] text-slate-500 font-medium italic">
                              {activeTab !== 'valueDiff' && `${n.value} | `}
                              {activeTab !== 'footprintDiff' && `${n.footprint}`}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="grid grid-cols-3 gap-6 w-full">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase text-slate-400">Value</span>
                            <span className="text-xs font-bold text-slate-800">{n.value}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase text-slate-400">Footprint</span>
                            <span className="text-xs font-mono text-slate-600">{n.footprint}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase text-slate-400">Part Number</span>
                            <span className="text-xs"><PNLink pn={n.pn} /></span>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
