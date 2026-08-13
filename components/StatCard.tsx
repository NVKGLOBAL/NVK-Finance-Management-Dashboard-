
import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, isPositive, icon }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 hover:border-slate-700 transition-all duration-300 group shadow-lg shadow-black/20">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-800 group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-colors">
          {React.cloneElement(icon as React.ReactElement<any>, { className: 'h-5 w-5 sm:h-6 sm:w-6' })}
        </div>
        {change && (
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            isPositive 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {isPositive ? '+' : ''}{change}
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-white font-mono">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
