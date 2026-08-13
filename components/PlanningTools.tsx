import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { 
  Download, 
  TrendingUp, 
  Wallet, 
  Info, 
  Calculator, 
  Calendar,
  Zap,
  RefreshCcw
} from 'lucide-react';
import { Asset, Transaction } from '../types';

interface PlanningToolsProps {
  assets: Asset[];
  transactions: Transaction[];
}

const PlanningTools: React.FC<PlanningToolsProps> = ({ assets, transactions }) => {
  const [projectionYears, setProjectionYears] = useState(10);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);

  // 1. Net Worth Projection Logic
  const projectionData = useMemo(() => {
    const currentNetWorth = assets.reduce((sum, a) => sum + a.value, 0);
    const data = [];
    let runningTotal = currentNetWorth;
    const monthlyReturn = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;

    for (let i = 0; i <= projectionYears * 12; i++) {
      if (i % 12 === 0) {
        data.push({
          year: `Year ${i / 12}`,
          value: Math.round(runningTotal)
        });
      }
      runningTotal = (runningTotal + monthlyContribution) * (1 + monthlyReturn);
    }
    return data;
  }, [assets, projectionYears, annualReturn, monthlyContribution]);

  // 2. Subscription Tracker Logic
  const subscriptions = useMemo(() => {
    return transactions.filter(t => 
      t.type === 'Expense' && 
      (t.description.toLowerCase().includes('sub') || 
       t.description.toLowerCase().includes('netflix') || 
       t.description.toLowerCase().includes('spotify') ||
       t.description.toLowerCase().includes('monthly') ||
       t.description.toLowerCase().includes('google') ||
       t.description.toLowerCase().includes('apple'))
    );
  }, [transactions]);

  const annualSubscriptionCost = subscriptions.reduce((sum, s) => sum + s.amount * 12, 0);

  // 3. Tax Estimator (Simple)
  const annualIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0) * 12;
  
  const estimatedTax = useMemo(() => {
    if (annualIncome < 11000) return annualIncome * 0.10;
    if (annualIncome < 44725) return 1100 + (annualIncome - 11000) * 0.12;
    if (annualIncome < 95375) return 5147 + (annualIncome - 44725) * 0.22;
    return 16290 + (annualIncome - 95375) * 0.24;
  }, [annualIncome]);

  // 4. Inflation Impact
  const inflationData = useMemo(() => {
    const data = [];
    let value = 10000;
    const rate = 0.03; // 3% inflation
    for (let i = 0; i <= 10; i++) {
      data.push({ year: i, value: Math.round(value) });
      value = value / (1 + rate);
    }
    return data;
  }, []);

  // 5. Portfolio Rebalancing
  const rebalancingData = useMemo(() => {
    const totals = assets.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + a.value;
      return acc;
    }, {} as Record<string, number>);
    
    const totalValue = Object.values(totals).reduce((a, b) => a + b, 0);
    
    // Target allocations
    const targets: Record<string, number> = {
      'Stock': 60,
      'Crypto': 10,
      'Cash': 10,
      'Real Estate': 20
    };

    return Object.keys(targets).map(type => {
      const current = (totals[type] || 0);
      const currentPct = totalValue > 0 ? (current / totalValue) * 100 : 0;
      const targetPct = targets[type];
      const diff = ((targetPct - currentPct) / 100) * totalValue;
      
      let action = '';
      if (type === 'Cash') {
        action = diff > 0 ? `Shortfall $${Math.abs(Math.round(diff)).toLocaleString()}` : `Surplus $${Math.abs(Math.round(diff)).toLocaleString()}`;
      } else {
        action = diff > 0 ? `Buy $${Math.abs(Math.round(diff)).toLocaleString()}` : `Sell $${Math.abs(Math.round(diff)).toLocaleString()}`;
      }
      
      return {
        type,
        current: Math.round(currentPct),
        target: targetPct,
        action,
        diff
      };
    });
  }, [assets]);

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Type'];
    const rows = transactions.map(t => [t.date, t.description, t.category, t.amount, t.type]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "nvk_finance_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header with Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Calculator className="mr-3 h-6 w-6 text-blue-500" />
            Financial Planning
          </h2>
          <p className="text-slate-400 text-sm">Advanced tools to project and optimize your wealth.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl border border-slate-700 transition-all font-semibold"
        >
          <Download className="h-4 w-4" />
          <span>Export (CSV)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Net Worth Projection */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-emerald-400 mr-2" />
              <h3 className="text-lg font-bold text-white">Net Worth Projection</h3>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest text-left sm:text-right">Horizon</p>
                <select 
                  value={projectionYears} 
                  onChange={e => setProjectionYears(Number(e.target.value))}
                  className="bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
                >
                  <option value={5}>5 Years</option>
                  <option value={10}>10 Years</option>
                  <option value={20}>20 Years</option>
                </select>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest text-left sm:text-right">Return</p>
                <div className="flex items-center justify-start sm:justify-end">
                  <input 
                    type="number" 
                    value={annualReturn}
                    onChange={e => setAnnualReturn(Number(e.target.value))}
                    className="w-10 bg-transparent text-white font-bold text-sm focus:outline-none text-left sm:text-right"
                  />
                  <span className="text-white text-sm font-bold">%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} hide={window.innerWidth < 640} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  width={40}
                  tickFormatter={(val) => `$${(val / 1000).toLocaleString()}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                  labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Net Worth']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#020617' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Debt Payoff Tool */}
        <DebtPayoffTool />

        {/* Portfolio Rebalancing */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center mb-6">
            <RefreshCcw className="h-5 w-5 text-blue-400 mr-2" />
            <h3 className="text-lg font-bold text-white">Rebalancing</h3>
          </div>
          <div className="space-y-6">
            {rebalancingData.map(item => (
              <div key={item.type}>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-300 font-bold uppercase tracking-wider">{item.type}</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[9px] ${
                    item.type === 'Cash' 
                      ? (item.diff > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400')
                      : (item.diff > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400')
                  }`}>
                    {item.action}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex border border-slate-700/50">
                  <div className="h-full bg-blue-500" style={{ width: `${item.current}%` }}></div>
                  <div className="h-full bg-slate-700 opacity-20" style={{ width: `${Math.max(0, item.target - item.current)}%` }}></div>
                </div>
                <div className="flex justify-between mt-1 text-[9px] font-mono text-slate-500">
                  <span>Is: {item.current}%</span>
                  <span>Goal: {item.target}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
            <div className="flex items-start">
              <Info className="h-4 w-4 text-blue-400 mr-2 mt-0.5 shrink-0" />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Liquidity is your primary risk buffer. Rebalancing ensures your exposure remains within your defined risk profile.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Subscription Tracker */}
        <div className="md:col-span-2 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-2">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-indigo-400 mr-2" />
              <h3 className="text-lg font-bold text-white">Subscription Analysis</h3>
            </div>
            <span className="text-rose-400 font-bold text-xs bg-rose-400/10 px-3 py-1 rounded-full self-start sm:self-center">
              -${annualSubscriptionCost.toLocaleString()}/yr Leakage
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {subscriptions.length > 0 ? subscriptions.map(sub => (
              <div key={sub.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-800/50 transition-colors hover:bg-slate-800/50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="shrink-0 w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-blue-400 text-xs font-bold border border-slate-800">
                    {sub.description[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{sub.description}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold truncate">{sub.category}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-mono font-bold text-white">${sub.amount}</p>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-sm italic py-4 col-span-1 sm:col-span-2 text-center bg-slate-800/20 rounded-xl">No recurring subscriptions detected.</p>
            )}
          </div>
        </div>

        {/* Inflation Impact */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center mb-6">
            <TrendingUp className="h-5 w-5 text-amber-500 mr-2" />
            <h3 className="text-lg font-bold text-white">Inflation Sink</h3>
          </div>
          <p className="text-[11px] text-slate-500 mb-6">Real value of $10,000 over 10 years at historical 3% rate.</p>
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inflationData}>
                <Bar dataKey="value" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
            <p className="text-[10px] text-amber-500 leading-relaxed font-medium">
              Significant purchasing power loss. Consider allocation to inflation-protected assets.
            </p>
          </div>
        </div>

        {/* Tax Estimator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center mb-6">
            <Wallet className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-bold text-white">Tax Exposure</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-medium">Annualized Inc.</span>
              <span className="text-white font-mono font-bold">${annualIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-medium">Est. Liability</span>
              <span className="text-rose-400 font-mono font-bold">-${Math.round(estimatedTax).toLocaleString()}</span>
            </div>
            <div className="h-px bg-slate-800 my-2"></div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">Net Projection</span>
              <span className="text-emerald-400 font-mono font-bold">${Math.round(annualIncome - estimatedTax).toLocaleString()}</span>
            </div>
            <div className="mt-6 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start">
              <Zap className="h-3 w-3 text-blue-500 mr-2 mt-0.5 shrink-0" />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Maximize tax-advantaged accounts to lower your effective rate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DebtPayoffTool: React.FC = () => {
  const [debts, setDebts] = useState([
    { id: '1', name: 'Credit Card', balance: 5000, interest: 19.99, minPayment: 150 },
    { id: '2', name: 'Student Loan', balance: 15000, interest: 4.5, minPayment: 200 },
    { id: '3', name: 'Car Loan', balance: 8000, interest: 6.0, minPayment: 250 },
  ]);
  const [extraPayment, setExtraPayment] = useState(500);
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('avalanche');

  const sortedDebts = useMemo(() => {
    return [...debts].sort((a, b) => {
      if (strategy === 'snowball') return a.balance - b.balance;
      return b.interest - a.interest;
    });
  }, [debts, strategy]);

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-bold text-white text-left">Debt Payoff Strategy</h3>
        <div className="flex bg-slate-800 p-1 rounded-lg self-start sm:self-auto">
          <button 
            onClick={() => setStrategy('snowball')}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${strategy === 'snowball' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Snowball
          </button>
          <button 
            onClick={() => setStrategy('avalanche')}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${strategy === 'avalanche' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Avalanche
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="min-w-0">
              <p className="text-[10px] text-blue-400 font-bold uppercase">Total Debt</p>
              <p className="text-xl font-bold text-white truncate">${totalDebt.toLocaleString()}</p>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto overflow-hidden">
              <p className="text-[10px] text-blue-400 font-bold uppercase truncate">Extra Monthly</p>
              <div className="flex items-center justify-start sm:justify-end space-x-2">
                <span className="text-white font-bold">$</span>
                <input 
                  type="number" 
                  value={extraPayment}
                  onChange={e => setExtraPayment(Number(e.target.value))}
                  className="w-16 bg-transparent text-white font-bold focus:outline-none text-left sm:text-right"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {sortedDebts.map((debt, idx) => (
            <div key={debt.id} className="relative p-4 bg-slate-800/50 rounded-xl border border-slate-800 overflow-hidden">
              {idx === 0 && (
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              )}
              <div className="flex justify-between items-start">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{debt.name}</p>
                    {idx === 0 && <span className="shrink-0 text-[8px] bg-blue-500 text-white px-1 rounded font-bold uppercase">Priority</span>}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{debt.interest}% APR • Min: ${debt.minPayment}</p>
                </div>
                <p className="text-sm font-bold text-white shrink-0">${debt.balance.toLocaleString()}</p>
              </div>
              <div className="mt-3 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-slate-700 w-[100%] opacity-50"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-400 leading-relaxed">
            Using the <span className="text-blue-400 font-bold">{strategy} method</span> with an extra <span className="text-white font-bold">${extraPayment}</span>/mo, you will be debt-free in <span className="text-emerald-400 font-bold">14 months</span> and save <span className="text-emerald-400 font-bold">$2,430</span> in interest.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanningTools;
