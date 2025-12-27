
import React, { useState } from 'react';
import { 
  ArrowRight, ShieldAlert, PlusCircle, XCircle, Unplug, ChevronRight, Search 
} from 'lucide-react';
import { NetCompareResults, NetObject, NetMismatch } from '../types';

interface NetCompareViewProps {
  results: NetCompareResults;
  filterText: string;
}

export default function NetCompareView({ results, filterText }: NetCompareViewProps) {
  const [activeTab, setActiveTab] = useState<'mismatch' | 'added' | 'deleted' | 'unconnected'>('mismatch');

  const tabs = [
    { id: 'mismatch', label: 'Mismatches', count: results.stats.mismatch, icon: ShieldAlert, color: 'rose' },
    { id: 'added', label: 'Added', count: results.stats.added, icon: PlusCircle, color: 'emerald' },
    { id: 'deleted', label: 'Deleted', count: results.stats.deleted, icon: XCircle, color: 'slate' },
    { id: 'unconnected', label: 'Single-Pin', count: results.stats.unconnected, icon: Unplug, color: 'amber' }
  ];

  const getFilteredList = () => {
    const list = results[activeTab as keyof NetCompareResults] as any[];
    if (!filterText) return list;
    const low = filterText.toLowerCase();
    return list.filter(item => {
      const name = item.name || item.new?.name;
      return name.toLowerCase().includes(low);
    });
  };

  // Fix: Use React.FC to properly handle reserved props like 'key' in JSX
  const PinTag: React.FC<{ refDes: string, pinNum: string, isCommon?: boolean }> = ({ refDes, pinNum, isCommon = false }) => (
    <span className={`px-2 py-0.5 rounded border text-[10px] font-mono whitespace-nowrap ${
      isCommon ? 'bg-slate-100 text-slate-600 border-slate-200' : 
      refDes.startsWith('U') || refDes.startsWith('J') ? 'bg-blue-600 text-white border-blue-500 font-bold' : 'bg-slate-50 text-slate-800 border-slate-200'
    }`}>
      {refDes}.{pinNum}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* View Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all border ${
              activeTab === tab.id 
                ? `bg-white border-${tab.color}-200 text-${tab.color}-600 shadow-sm ring-2 ring-${tab.color}-500/10` 
                : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
              activeTab === tab.id ? `bg-${tab.color}-100` : 'bg-slate-200 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table Hub */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            {activeTab === 'mismatch' ? (
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4 w-48">Signal Name</th>
                <th className="px-6 py-4 w-24 text-center">Pin Δ</th>
                <th className="px-6 py-4">Topology Changes</th>
              </tr>
            ) : (
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4 w-64">Signal Name</th>
                <th className="px-6 py-4 text-center w-24">Pins</th>
                <th className="px-6 py-4">Connections</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {getFilteredList().map((item, idx) => {
              if (activeTab === 'mismatch') {
                const mismatch = item as NetMismatch;
                const oldPins = new Set(mismatch.old.pins.map(p => `${p.ref}.${p.pinNum}`));
                const newPins = new Set(mismatch.new.pins.map(p => `${p.ref}.${p.pinNum}`));
                
                const removed = mismatch.old.pins.filter(p => !newPins.has(`${p.ref}.${p.pinNum}`));
                const added = mismatch.new.pins.filter(p => !oldPins.has(`${p.ref}.${p.pinNum}`));
                const common = mismatch.new.pins.filter(p => oldPins.has(`${p.ref}.${p.pinNum}`));

                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-black text-slate-800 text-sm">{mismatch.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold">
                        <span className="text-slate-400 line-through decoration-slate-300">{mismatch.old.pins.length}</span>
                        <ArrowRight size={10} className="text-slate-300" />
                        <span className="text-blue-600 bg-blue-50 px-1.5 rounded">{mismatch.new.pins.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {removed.map((p, i) => <div key={i} className="opacity-60 grayscale border-rose-300 border bg-rose-50 text-rose-600 rounded flex items-center overflow-hidden"><span className="px-1.5 py-0.5 text-[10px] font-black bg-rose-200">OUT</span><PinTag refDes={p.ref} pinNum={p.pinNum} /></div>)}
                        {added.map((p, i) => <div key={i} className="border-emerald-300 border bg-emerald-50 text-emerald-600 rounded flex items-center overflow-hidden"><span className="px-1.5 py-0.5 text-[10px] font-black bg-emerald-200">IN</span><PinTag refDes={p.ref} pinNum={p.pinNum} /></div>)}
                        <div className="h-4 w-px bg-slate-200 mx-2 self-center" />
                        {common.map((p, i) => <PinTag key={i} refDes={p.ref} pinNum={p.pinNum} isCommon />)}
                      </div>
                    </td>
                  </tr>
                );
              }

              const net = item as NetObject;
              return (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-black text-slate-800 text-sm flex items-center gap-2">
                    {activeTab === 'added' && <PlusCircle size={14} className="text-emerald-500" />}
                    {activeTab === 'deleted' && <XCircle size={14} className="text-slate-400" />}
                    {activeTab === 'unconnected' && <Unplug size={14} className="text-amber-500" />}
                    {net.name}
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-slate-500 text-xs">{net.pins.length}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {net.pins.slice(0, 15).map((p, i) => <PinTag key={i} refDes={p.ref} pinNum={p.pinNum} />)}
                      {net.pins.length > 15 && <span className="text-[10px] font-bold text-slate-400">+{net.pins.length - 15} more</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {getFilteredList().length === 0 && (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <Search size={48} className="mx-auto opacity-20" />
            <p className="font-bold text-slate-500 uppercase tracking-widest">No results found</p>
            <p className="text-sm">Try adjusting your filter or check another category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
