
import React, { useState } from 'react';
import { FileJson, CheckCircle, Trash2, FileText, ChevronRight } from 'lucide-react';
import { Meta, Stats } from '../types';

interface FileUploaderProps {
  label: string;
  onUpload: (file: File) => void;
  onClear: () => void;
  data: { meta: Meta, stats: Stats } | null;
  variant?: 'blue' | 'slate';
}

export default function FileUploader({ label, onUpload, onClear, data, variant = 'slate' }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const colors = variant === 'blue' 
    ? { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:border-blue-400' }
    : { border: 'border-slate-400', bg: 'bg-slate-50', text: 'text-slate-600', hover: 'hover:border-slate-300' };

  if (data) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
        <button 
          onClick={onClear}
          className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={18} />
        </button>
        
        <div className="flex items-start gap-6">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
            <CheckCircle size={32} />
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
              <h3 className="text-xl font-bold text-slate-900 truncate max-w-[280px]">{data.meta.name}</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Parts</p>
                <p className="text-lg font-black text-slate-800">{data.stats.parts}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pins</p>
                <p className="text-lg font-black text-slate-800">{data.stats.pins}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signals</p>
                <p className="text-lg font-black text-slate-800">{data.stats.nets}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files[0]) onUpload(e.dataTransfer.files[0]);
      }}
      className={`relative h-64 border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center p-8 text-center group cursor-pointer ${
        dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 bg-white hover:border-slate-400'
      }`}
    >
      <input 
        type="file" 
        id={`file-${label}`} 
        className="hidden" 
        accept=".part,.json" 
        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} 
      />
      <label htmlFor={`file-${label}`} className="cursor-pointer space-y-4">
        <div className="bg-slate-100 p-6 rounded-3xl group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-300">
          <FileJson className="text-slate-400 group-hover:text-blue-500" size={48} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{label}</h3>
          <p className="text-sm text-slate-500 font-medium">Drag & drop .part schematic export</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest">
          Click to Browse <ChevronRight size={14} />
        </div>
      </label>
    </div>
  );
}
