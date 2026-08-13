import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Target, 
  TrendingUp, 
  Wallet, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Asset, UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (data: {
    profile: UserProfile;
    goals: string[];
    initialAsset: Partial<Asset>;
    budgets: Record<string, number>;
    initialIncome?: number;
  }) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    username: '',
    avatar: 'https://picsum.photos/seed/user1/40/40'
  });
  const [goals, setGoals] = useState<string[]>([]);
  const [incomeSources, setIncomeSources] = useState<Record<string, number>>({
    'Primary Salary': 5000,
    'Side Hustle': 0,
    'Dividends/Interest': 0,
    'Other Income': 0
  });
  const [fixedBills, setFixedBills] = useState<Record<string, number>>({
    'Rent/Mortgage': 1500,
    'Utilities': 200,
    'Insurance': 150,
    'Subscriptions': 50
  });
  const [variableExpenses, setVariableExpenses] = useState<Record<string, number>>({
    'Food & Dining': 500,
    'Transport': 300,
    'Entertainment': 200,
    'Shopping': 200,
    'Health': 100,
    'Other': 100
  });
  const [initialAsset, setInitialAsset] = useState<Partial<Asset>>({
    name: '',
    symbol: '',
    value: 0,
    type: 'Cash',
    allocation: 100
  });
  const [initialIncome, setInitialIncome] = useState<number>(0);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const toggleGoal = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const AVATARS = [
    'https://picsum.photos/seed/user1/40/40',
    'https://picsum.photos/seed/user2/40/40',
    'https://picsum.photos/seed/user3/40/40',
    'https://picsum.photos/seed/user4/40/40',
    'https://picsum.photos/seed/user5/40/40',
    'https://picsum.photos/seed/user6/40/40',
  ];

  const steps = [
    {
      title: "Welcome to NVK Finance",
      description: "Your personalized, AI-driven command center for wealth building.",
      content: (
        <div className="space-y-6 mt-6 text-slate-300 leading-relaxed">
          <p className="text-slate-400">
            NVK Finance is designed to give you complete clarity over your financial life. 
            By connecting income, expenses, and investments, we provide actionable insights.
          </p>
          <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800 flex items-start space-x-4 transition-all hover:border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-1">Secure & Private</h3>
              <p className="text-xs text-slate-500">Your data stays local and is never used to train global models.</p>
            </div>
          </div>
          <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800 flex items-start space-x-4 transition-all hover:border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-1">AI-Powered Analysis</h3>
              <p className="text-xs text-slate-500">Get personalized strategies based on your unique cash flow architecture.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Create Your Identity",
      description: "How should we address you in your financial command center?",
      content: (
        <div className="space-y-8 mt-6">
          <div className="flex flex-wrap justify-center gap-2 sm:space-x-4">
            {AVATARS.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setProfile({ ...profile, avatar: url })}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border-2 transition-all overflow-hidden ${
                  profile.avatar === url ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/20' : 'border-transparent opacity-40 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
          <div className="space-y-5">
            <div className="group">
              <label className="block text-[10px] text-slate-500 mb-1.5 font-bold uppercase tracking-[0.2em]">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="e.g. Nikola V. Kovac"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-[10px] text-slate-500 mb-1.5 font-bold uppercase tracking-[0.2em]">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 font-bold transition-colors">@</span>
                <input 
                  type="text" 
                  placeholder="nvk_finance"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3.5 text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                  value={profile.username}
                  onChange={e => setProfile({...profile, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Wealth Objectives",
      description: "Define your primary financial milestones for customized projection logic.",
      content: (
        <div className="grid grid-cols-2 gap-4 mt-8">
          {['Retirement', 'Home Ownership', 'Debt Free', 'Passive Income', 'Travel', 'Emergency Fund'].map(goal => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center space-y-2 ${
                goals.includes(goal) 
                  ? 'border-blue-500 bg-blue-500/10 text-white shadow-lg shadow-blue-900/10' 
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <Target className={`h-6 w-6 ${goals.includes(goal) ? 'text-blue-400' : 'text-slate-600'}`} />
              <span className="text-xs font-bold tracking-tight">{goal}</span>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Monthly Inflow",
      description: "Capture all recurring income streams to establish your baseline.",
      content: (
        <div className="space-y-4 mt-6">
          {Object.entries(incomeSources).map(([source, val]) => (
            <div key={source} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 group hover:border-slate-700 transition-colors">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-tighter">{source}</span>
              <div className="flex items-center">
                <span className="text-slate-600 text-sm font-mono mr-2">$</span>
                <input 
                  type="number" 
                  className="w-28 bg-slate-900 border-none rounded-lg px-3 py-2 text-right text-white font-mono font-bold focus:ring-1 focus:ring-blue-500"
                  value={val || ''}
                  onChange={e => setIncomeSources({...incomeSources, [source]: Number(e.target.value)})}
                />
              </div>
            </div>
          ))}
          <div className="pt-6 mt-6 border-t border-slate-800 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Monthly Liquidity</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              ${Object.values(incomeSources).reduce((a, b) => a + b, 0).toLocaleString()}
            </span>
          </div>
        </div>
      )
    },
    {
      title: "Core Liabilities",
      description: "Define your non-negotiable fixed expenses.",
      content: (
        <div className="space-y-4 mt-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
          {Object.entries(fixedBills).map(([bill, val]) => (
            <div key={bill} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 group hover:border-slate-700 transition-colors">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-tighter">{bill}</span>
              <div className="flex items-center">
                <span className="text-slate-600 text-sm font-mono mr-2">$</span>
                <input 
                  type="number" 
                  className="w-28 bg-slate-900 border-none rounded-lg px-3 py-2 text-right text-white font-mono font-bold focus:ring-1 focus:ring-blue-500"
                  value={val || ''}
                  onChange={e => setFixedBills({...fixedBills, [bill]: Number(e.target.value)})}
                />
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Variable Outflow",
      description: "Estimate lifestyle and discretionary spending categories.",
      content: (
        <div className="space-y-3 mt-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
          {Object.entries(variableExpenses).map(([cat, val]) => (
            <div key={cat} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{cat}</span>
              <div className="flex items-center">
                <span className="text-slate-600 text-xs font-mono mr-2">$</span>
                <input 
                  type="number" 
                  className="w-24 bg-slate-900 border-none rounded-lg px-2 py-1.5 text-right text-white font-mono font-bold focus:ring-1 focus:ring-blue-500"
                  value={val || ''}
                  onChange={e => setVariableExpenses({...variableExpenses, [cat]: Number(e.target.value)})}
                />
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Primary Asset",
      description: "Initialize your portfolio with your most substantial current holding.",
      content: (
        <div className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Asset Name</label>
              <input 
                type="text" 
                placeholder="e.g. Bitcoin"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-600 outline-none transition-all text-sm"
                value={initialAsset.name}
                onChange={e => setInitialAsset({...initialAsset, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ticker</label>
              <input 
                type="text" 
                placeholder="BTC"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-600 outline-none transition-all text-sm font-bold"
                value={initialAsset.symbol}
                onChange={e => setInitialAsset({...initialAsset, symbol: e.target.value.toUpperCase()})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Units Owned</label>
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-600 outline-none transition-all text-sm font-mono"
                value={initialAsset.units || ''}
                onChange={e => setInitialAsset({...initialAsset, units: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cost per Unit ($)</label>
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-600 outline-none transition-all text-sm font-mono"
                value={initialAsset.costBasis || ''}
                onChange={e => setInitialAsset({...initialAsset, costBasis: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Classification</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-600 outline-none transition-all text-sm font-bold appearance-none"
              value={initialAsset.type}
              onChange={e => setInitialAsset({...initialAsset, type: e.target.value as any})}
            >
              <option>Cash</option>
              <option>Stock</option>
              <option>Crypto</option>
              <option>Real Estate</option>
            </select>
          </div>
        </div>
      )
    },
    {
      title: "Current Altitude",
      description: "How much total liquid capital do you have across all accounts today?",
      content: (
        <div className="space-y-6 mt-8">
          <div className="relative group">
            <label className="block text-[10px] text-slate-500 mb-3 font-bold uppercase tracking-[0.2em] text-center">Total Household Liquidity</label>
            <div className="flex items-center justify-center space-x-3">
              <span className="text-4xl font-bold text-slate-700 font-mono">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                autoFocus
                className="bg-transparent border-b-2 border-slate-800 focus:border-blue-600 outline-none text-center text-5xl font-bold text-white font-mono w-full max-w-[280px] py-2 transition-all"
                value={initialIncome || ''}
                onChange={e => setInitialIncome(Number(e.target.value))}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-6 text-center leading-relaxed max-w-xs mx-auto">
              This initialization balance sets your net worth baseline. 
              Future growth will be calculated from this point.
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[step - 1];

  const handleFinish = () => {
    const combinedBudgets = { ...fixedBills, ...variableExpenses };
    onComplete({ 
      profile, 
      goals, 
      initialAsset, 
      budgets: combinedBudgets, 
      initialIncome 
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020617] p-2 sm:p-4 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-blue-600/10 blur-[120px] sm:blur-[150px] rounded-full pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-slate-900 border border-slate-800 rounded-[20px] sm:rounded-[32px] w-full max-w-xl p-6 sm:p-10 shadow-2xl overflow-y-auto max-h-[95vh] sm:overflow-visible"
      >
        {/* Progress System */}
        <div className="absolute top-0 left-0 w-full flex space-x-1 p-0.5 sm:p-1">
          {steps.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 rounded-full overflow-hidden bg-slate-800">
              {idx + 1 <= step && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className={`h-full ${idx + 1 === step ? 'bg-blue-500' : 'bg-slate-500'}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mb-6 sm:mb-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50 mb-3 sm:mb-4"
          >
            <span className="text-[8px] sm:text-[9px] font-black text-blue-400 uppercase tracking-widest">Configuration Phase {step}</span>
          </motion.div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">{currentStepData.title}</h2>
          <p className="text-slate-400 mt-2 sm:mt-3 text-xs sm:text-sm font-medium max-w-xs sm:max-w-sm mx-auto">{currentStepData.description}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="min-h-[300px]"
          >
            {currentStepData.content}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 sm:mt-12 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center space-x-2 text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          
          <button
            onClick={step === steps.length ? handleFinish : nextStep}
            className="group flex items-center space-x-2 sm:space-x-3 bg-blue-600 hover:bg-white hover:text-slate-950 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-base font-black transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            <span>{step === steps.length ? 'Initialize Dashboard' : 'Next Sequence'}</span>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
