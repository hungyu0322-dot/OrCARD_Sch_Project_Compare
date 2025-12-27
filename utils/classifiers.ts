
import { Classification } from '../types';

export const classifyPart = (pn: string): Classification => {
  if (!pn) return { type: 'Unknown', color: 'bg-slate-100 text-slate-600 border-slate-200', priority: 0 };
  
  const p2 = pn.substring(0, 2);
  const p3 = pn.substring(0, 3);
  const p4 = pn.substring(0, 4);

  // ICs & CPUs
  if (p2 === '14') {
     if (pn.startsWith('14CP')) return { type: 'CP(CHIP)', color: 'bg-purple-100 text-purple-700 border-purple-200', priority: 3 };
     if (pn.startsWith('14MP')) return { type: 'MP(BGA CPU)', color: 'bg-purple-200 text-purple-800 border-purple-300', priority: 3 };
     if (p3 === '141') return { type: 'IC/Part', color: 'bg-purple-50 text-purple-700 border-purple-200', priority: 3 };
     return { type: 'CPU', color: 'bg-purple-100 text-purple-700 border-purple-200', priority: 3 };
  }
  
  // Passives & Timing
  if (p4 === '1211') return { type: 'Inductor', color: 'bg-orange-100 text-orange-700 border-orange-200', priority: 3 };
  if (p4 === '1212') return { type: 'Bead', color: 'bg-orange-50 text-orange-600 border-orange-200', priority: 2 };
  if (p4 === '1231') return { type: 'Crystal', color: 'bg-teal-50 text-teal-700 border-teal-200', priority: 2 };
  if (p4 === '1233') return { type: 'Oscillator', color: 'bg-teal-100 text-teal-700 border-teal-200', priority: 2 };
  if (p4 === '1252') return { type: 'Transformer', color: 'bg-orange-200 text-orange-800 border-orange-300', priority: 3 };
  if (p3 === '125') return { type: 'Converter', color: 'bg-orange-100 text-orange-700 border-orange-200', priority: 3 };
  if (p3 === '129') return { type: 'Protection', color: 'bg-red-50 text-red-700 border-red-200', priority: 2 };

  // Discrete Semiconductors
  if (p2 === '13') {
      if (p4 === '1304') return { type: 'LED', color: 'bg-yellow-50 text-yellow-600 border-yellow-200', priority: 1 };
      if (p3 === '130') return { type: 'Diode', color: 'bg-cyan-50 text-cyan-600 border-cyan-200', priority: 2 };
      if (p3 === '131') return { type: 'Transistor', color: 'bg-cyan-100 text-cyan-700 border-cyan-200', priority: 3 };
      if (p3 === '132') return { type: 'Thyristor', color: 'bg-cyan-200 text-cyan-800 border-cyan-300', priority: 2 };
  }

  // Connectors & Basic Passives
  if (p2 === '16') return { type: 'Conn/Mech', color: 'bg-pink-50 text-pink-600 border-pink-100', priority: 0 };
  if (p2 === '10') return { type: 'Resistor', color: 'bg-blue-50 text-blue-700 border-blue-100', priority: 1 };
  if (p2 === '11') return { type: 'Capacitor', color: 'bg-yellow-50 text-yellow-700 border-yellow-100', priority: 1 };
  if (p3 === '180') return { type: 'Var Resistor', color: 'bg-blue-100 text-blue-800 border-blue-200', priority: 1 };
  if (p2 === '15') return { type: 'NETR', color: 'bg-gray-100 text-gray-600 border-gray-200', priority: 0 };
  if (p3 === '003') return { type: 'Test Pad', color: 'bg-gray-50 text-gray-500 border-gray-200', priority: 0 };

  return { type: 'Other', color: 'bg-slate-100 text-slate-600 border-slate-200', priority: 0 };
};
