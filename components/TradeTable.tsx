
import React from 'react';
import { Trade, TradeType } from '../types';

interface TradeTableProps {
  trades: Trade[];
}

export const TradeTable: React.FC<TradeTableProps> = ({ trades }) => {
  return (
    <div className="overflow-x-auto glass-card rounded-xl border border-slate-700/50 shadow-2xl">
      <table className="w-full text-left border-collapse min-w-[1200px]">
        <thead>
          <tr className="bg-slate-800/80 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-700">
            <th className="px-6 py-5">Datum & Kod</th>
            <th className="px-6 py-5">Političar & Pozicija</th>
            <th className="px-6 py-5">Odbor</th>
            <th className="px-6 py-5">Ticker</th>
            <th className="px-6 py-5 text-center">Tip</th>
            <th className="px-6 py-5 text-right">Vrijednost</th>
            <th className="px-6 py-5">Forenzički Kontekst</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {trades.map((trade, idx) => (
            <tr key={idx} className="hover:bg-emerald-500/5 transition-all group">
              <td className="px-6 py-4">
                <div className="font-mono text-xs text-emerald-400 font-bold">{trade.date}</div>
                <div className="text-[9px] text-slate-600 font-mono uppercase mt-0.5">{trade.transactionCode}</div>
              </td>
              <td className="px-6 py-4">
                <div className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">{trade.politician}</div>
                <div className="text-[10px] text-slate-500 font-mono uppercase mt-1">{trade.role}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-xs text-slate-300 max-w-[200px] leading-tight">
                  {trade.committee || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="font-mono font-black text-emerald-400 text-sm">{trade.ticker}</div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`text-[9px] font-black px-2 py-1 rounded-md border tracking-tighter ${
                  trade.type === TradeType.BUY 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {trade.type}
                </span>
              </td>
              <td className="px-6 py-4 text-right font-mono text-sm text-slate-300 font-bold">
                {trade.value}
              </td>
              <td className="px-6 py-4">
                <div className="text-[11px] text-slate-400 max-w-xs leading-relaxed italic group-hover:text-slate-300 transition-colors">
                  {trade.newsConnection}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
