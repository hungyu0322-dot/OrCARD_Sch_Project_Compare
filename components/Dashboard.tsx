
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  ShieldAlert, Activity, Package, Network, TrendingUp, TrendingDown 
} from 'lucide-react';
import { NetCompareResults, CompCompareResults } from '../types';

interface DashboardProps {
  results: {
    net: NetCompareResults;
    comp: CompCompareResults;
    old: any;
    new: any;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard({ results }: DashboardProps) {
  const { net, comp } = results;

  const summaryCards = [
    { label: 'Net Mismatches', value: net.stats.mismatch, icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Unconnected Nets', value: net.stats.unconnected, icon: Network, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Comp Added', value: comp.stats.added, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Comp Removed', value: comp.stats.removed, icon: TrendingDown, color: 'text-slate-600', bg: 'bg-slate-50' }
  ];

  const netData = [
    { name: 'Mismatch', value: net.stats.mismatch },
    { name: 'Added', value: net.stats.added },
    { name: 'Deleted', value: net.stats.deleted }
  ];

  const compData = [
    { name: 'Footprint', value: comp.stats.footprintDiff },
    { name: 'Value', value: comp.stats.valueDiff },
    { name: 'P/N', value: comp.stats.pnDiff }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className={`p-3 rounded-2xl ${card.bg} ${card.color} w-fit mb-4`}>
              <card.icon size={24} />
            </div>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{card.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Hub */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Net Revision Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Network className="text-blue-600" size={20} /> Signal Topology Delta
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={netData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {netData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Component Diffs */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Package className="text-blue-600" size={20} /> Property Revisions
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {compData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
