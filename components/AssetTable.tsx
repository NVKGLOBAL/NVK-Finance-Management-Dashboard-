
import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { Asset } from '../types';

interface AssetTableProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

const AssetTable: React.FC<AssetTableProps> = ({ assets, onEdit, onDelete }) => {
  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto overflow-y-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-800">
              <th className="px-6 py-4 font-bold">Asset</th>
              <th className="px-6 py-4 font-bold">Type</th>
              <th className="px-6 py-4 font-bold">Units</th>
              <th className="px-6 py-4 font-bold">Avg. Price / Market</th>
              <th className="px-6 py-4 font-bold">P/L (Unrealized)</th>
              <th className="px-6 py-4 font-bold">Balance</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            {assets.map((asset) => {
              const currentPrice = asset.units > 0 ? asset.value / asset.units : 0;
              const profit = asset.value - (asset.units * asset.costBasis);
              const profitPercent = asset.costBasis > 0 ? (profit / (asset.units * asset.costBasis)) * 100 : 0;

              return (
                <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center mr-3 text-xs font-bold text-slate-300 shrink-0">
                        {asset.symbol[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white leading-none mb-1 truncate">{asset.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{asset.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 truncate inline-block">
                      {asset.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400">
                    {asset.units.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-mono text-slate-500">Avg: ${asset.costBasis.toLocaleString()}</div>
                    <div className="text-xs font-mono font-bold text-slate-200">Mkt: ${currentPrice.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-xs font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {profit >= 0 ? '+' : ''}${Math.abs(profit).toLocaleString()}
                    </div>
                    <div className={`text-[10px] font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {profit >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-white">
                    ${asset.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(asset)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(asset.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {assets.map((asset) => {
          const currentPrice = asset.units > 0 ? asset.value / asset.units : 0;
          const profit = asset.value - (asset.units * asset.costBasis);
          const profitPercent = asset.costBasis > 0 ? (profit / (asset.units * asset.costBasis)) * 100 : 0;

          return (
            <div key={asset.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                    {asset.symbol[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{asset.name}</h4>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{asset.symbol} • {asset.type}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => onEdit(asset)}
                    className="p-2 text-slate-400 hover:text-blue-400 bg-slate-800 rounded-lg"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(asset.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/50">
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Balance</p>
                  <p className="text-sm font-mono font-bold text-white">${asset.value.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{asset.units.toLocaleString()} units</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">P/L (Unrealized)</p>
                  <div className={`text-sm font-bold flex items-center space-x-1.5 ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <span>{profit >= 0 ? '+' : ''}${Math.abs(profit).toLocaleString()}</span>
                  </div>
                  <p className={`text-[10px] font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {profit >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/50 rounded-xl p-3 flex justify-between items-center bg-slate-800/20">
                <div>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Entry Price</p>
                  <p className="text-[11px] font-mono text-slate-300 font-bold">${asset.costBasis.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Market Price</p>
                  <p className="text-[11px] font-mono text-slate-300 font-bold">${currentPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssetTable;
