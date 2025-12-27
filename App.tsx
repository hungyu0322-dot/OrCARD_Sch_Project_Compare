
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Cpu, 
  Search, 
  ArrowRightLeft,
  FileDiff,
  Trash2,
  Network,
  Download,
  FileText,
  FileSpreadsheet,
  Zap,
  Activity,
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';
import { 
  Part, Meta, Stats, NetObject, NetCompareResults, CompCompareResults, NetMismatch, CompDiff 
} from './types';
import { parseOrCADJson } from './utils/parsers';
import { analyzeSchematicDiffs } from './services/geminiService';
import FileUploader from './components/FileUploader';
import NetCompareView from './components/NetCompareView';
import ComponentCompareView from './components/ComponentCompareView';
import Dashboard from './components/Dashboard';

export default function App() {
  const [oldData, setOldData] = useState<{ parts: Part[], meta: Meta, stats: Stats } | null>(null);
  const [newData, setNewData] = useState<{ parts: Part[], meta: Meta, stats: Stats } | null>(null);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'net' | 'component'>('dashboard');
  const [filterText, setFilterText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  // --- Comparison Engine ---
  const netCompareResults = useMemo((): NetCompareResults | null => {
    if (!oldData || !newData) return null;
    
    const buildNetMap = (parts: Part[]) => {
      const netMap = new Map<string, NetObject>();
      parts.forEach(part => {
        part.pins.forEach(pin => {
          if (!netMap.has(pin.net)) {
            netMap.set(pin.net, { name: pin.net, pins: [], pages: new Set() });
          }
          const netObj = netMap.get(pin.net)!;
          netObj.pins.push({
            ref: part.ref,
            pinNum: pin.num,
            pinName: pin.name,
            partType: part.classification.type,
            pn: part.pn,
            value: part.value,
            footprint: part.footprint
          });
          netObj.pages.add(part.page);
        });
      });
      netMap.forEach(net => {
        net.pins.sort((a, b) => a.ref.localeCompare(b.ref, undefined, { numeric: true }));
        net.signature = net.pins.map(p => `${p.ref}.${p.pinNum}`).join('|');
      });
      return netMap;
    };

    const oldNetMap = buildNetMap(oldData.parts);
    const newNetMap = buildNetMap(newData.parts);

    const added: NetObject[] = [];
    const deleted: NetObject[] = [];
    // Fix: Explicitly type mismatch array
    const mismatch: NetMismatch[] = [];
    const unconnected: NetObject[] = [];

    newNetMap.forEach((newNet, netName) => {
      if (new Set(newNet.pins.map(p => p.ref)).size < 2) unconnected.push(newNet);
      if (!oldNetMap.has(netName)) {
        added.push(newNet);
      } else {
        const oldNet = oldNetMap.get(netName)!;
        if (oldNet.signature !== newNet.signature) {
          mismatch.push({ name: netName, old: oldNet, new: newNet });
        }
      }
    });

    oldNetMap.forEach((oldNet, netName) => {
      if (!newNetMap.has(netName)) deleted.push(oldNet);
    });

    return {
      mismatch, added, deleted, unconnected,
      stats: { mismatch: mismatch.length, added: added.length, deleted: deleted.length, unconnected: unconnected.length }
    };
  }, [oldData, newData]);

  const compCompareResults = useMemo((): CompCompareResults | null => {
    if (!oldData || !newData) return null;
    // Fix: Explicitly type Maps to ensure correct type inference for entries
    const oldMap = new Map<string, Part>(oldData.parts.map(p => [p.ref, p]));
    const newMap = new Map<string, Part>(newData.parts.map(p => [p.ref, p]));

    const added: Part[] = [];
    const removed: Part[] = [];
    // Fix: Explicitly type diff arrays using CompDiff interface
    const footprintDiff: CompDiff[] = [];
    const valueDiff: CompDiff[] = [];
    const pnDiff: CompDiff[] = [];

    newData.parts.forEach(nP => {
      const oP = oldMap.get(nP.ref);
      if (!oP) {
        added.push(nP);
      } else {
        // Fix: Explicit Map typing ensures oP is recognized as a Part here
        if (nP.footprint !== oP.footprint) footprintDiff.push({ ref: nP.ref, page: nP.page, old: oP, new: nP });
        if (nP.value !== oP.value) valueDiff.push({ ref: nP.ref, page: nP.page, old: oP, new: nP });
        if (nP.pn !== oP.pn) pnDiff.push({ ref: nP.ref, page: nP.page, old: oP, new: nP });
      }
    });

    oldData.parts.forEach(oP => { if (!newMap.has(oP.ref)) removed.push(oP); });

    return { 
      added, removed, footprintDiff, valueDiff, pnDiff,
      stats: { added: added.length, removed: removed.length, footprintDiff: footprintDiff.length, valueDiff: valueDiff.length, pnDiff: pnDiff.length }
    };
  }, [oldData, newData]);

  // --- AI Trigger ---
  useEffect(() => {
    if (netCompareResults && compCompareResults) {
      setIsAnalyzing(true);
      analyzeSchematicDiffs(netCompareResults, compCompareResults).then(res => {
        setAiAnalysis(res);
        setIsAnalyzing(false);
      });
    }
  }, [netCompareResults, compCompareResults]);

  const handleFileUpload = async (file: File, type: 'old' | 'new') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const processed = parseOrCADJson(json, 'UTF-8');
        if (type === 'old') setOldData(processed);
        else setNewData(processed);
      } catch (err) {
        alert("Invalid JSON format");
      }
    };
    reader.readAsText(file);
  };

  const hasResults = netCompareResults && compCompareResults;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <ArrowRightLeft className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                CES-PCW <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">PRO v2.0</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Schematic Intelligence Engine</p>
            </div>
          </div>

          <nav className="flex gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'net', label: 'Nets', icon: Network },
              { id: 'component', label: 'Components', icon: Cpu }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                disabled={!hasResults}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                } ${!hasResults && 'opacity-50 cursor-not-allowed'}`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {hasResults && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter signals or refs..." 
                  className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none w-48 focus:w-64 transition-all"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
            )}
            <div className="h-8 w-px bg-slate-700 mx-2" />
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors" title="Export Reports">
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-6 py-8">
        {/* Upload Hub */}
        {!hasResults && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900">Schematic Comparison Portal</h2>
              <p className="text-slate-500 text-lg">Compare two OrCAD .part files to analyze signal topology and component changes.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <FileUploader 
                label="Base Design (Old Version)" 
                onUpload={(f) => handleFileUpload(f, 'old')} 
                data={oldData}
                onClear={() => setOldData(null)}
              />
              <FileUploader 
                label="Target Design (New Version)" 
                onUpload={(f) => handleFileUpload(f, 'new')} 
                data={newData}
                onClear={() => setNewData(null)}
                variant="blue"
              />
            </div>
          </div>
        )}

        {/* Results View */}
        {hasResults && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            {/* AI Insights Banner */}
            <div className={`rounded-2xl border p-6 flex flex-col md:flex-row gap-6 items-start transition-all ${
              aiAnalysis ? 'bg-indigo-900 border-indigo-700 text-white shadow-2xl shadow-indigo-500/20' : 'bg-white border-slate-200'
            }`}>
              <div className="bg-indigo-600/30 p-4 rounded-2xl">
                {isAnalyzing ? <RefreshCw className="animate-spin text-indigo-200" size={32} /> : <Zap className="text-indigo-300" size={32} />}
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">AI Design Insight</h3>
                  {aiAnalysis && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                      aiAnalysis.criticality === 'High' ? 'bg-rose-500' : aiAnalysis.criticality === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}>
                      {aiAnalysis.criticality} CRITICALITY
                    </span>
                  )}
                </div>
                {isAnalyzing ? (
                  <p className="text-indigo-200 animate-pulse font-medium">Gemini is analyzing the signal topology and BOM changes for potential risks...</p>
                ) : aiAnalysis ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <p className="text-indigo-100 leading-relaxed font-medium opacity-90">{aiAnalysis.analysis}</p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {aiAnalysis.risks.map((r: string, idx: number) => (
                          <span key={idx} className="bg-white/10 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-2">
                            <ShieldAlert size={12} className="text-indigo-300" /> {r}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-indigo-800/50 p-4 rounded-xl space-y-2">
                      <h4 className="text-xs uppercase tracking-widest font-black text-indigo-300">Recommendations</h4>
                      <ul className="space-y-1">
                        {aiAnalysis.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <ChevronRight size={14} className="mt-1 flex-shrink-0 text-indigo-400" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">Upload designs to start AI analysis.</p>
                )}
              </div>
            </div>

            {/* Dynamic Views */}
            <div className="min-h-[600px]">
              {activeTab === 'dashboard' && <Dashboard results={{ net: netCompareResults, comp: compCompareResults, old: oldData, new: newData }} />}
              {activeTab === 'net' && <NetCompareView results={netCompareResults} filterText={filterText} />}
              {activeTab === 'component' && <ComponentCompareView results={compCompareResults} filterText={filterText} />}
            </div>
          </div>
        )}
      </main>

      {/* Footer / Status Bar */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${hasResults ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            ENGINEERING CONTEXT: {hasResults ? 'LOADED' : 'READY'}
          </div>
          {hasResults && (
            <>
              <div className="flex items-center gap-2">
                <Activity size={12} />
                COMPONENTS: {newData?.stats.parts}
              </div>
              <div className="flex items-center gap-2">
                <Network size={12} />
                SIGNALS: {newData?.stats.nets}
              </div>
            </>
          )}
        </div>
        <div>© 2025 CES-PCW PRO • ADVANCED HARDWARE ANALYTICS</div>
      </footer>
    </div>
  );
}
