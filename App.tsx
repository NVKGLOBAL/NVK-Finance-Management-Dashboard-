
import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  Target, 
  RefreshCcw, 
  Bell, 
  MessageSquare, 
  Plus, 
  History, 
  Trash2, 
  Edit3, 
  AlertCircle,
  ChevronDown,
  Activity,
  Shield,
  Menu,
  X
} from 'lucide-react';
import StatCard from './components/StatCard';
import AssetTable from './components/AssetTable';
import ChatAssistant from './components/ChatAssistant';
import Onboarding from './components/Onboarding';
import PlanningTools from './components/PlanningTools';
import { fetchCryptoPrices } from './services/marketService';
import { Asset, Transaction, UserProfile } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('nvk_assets');
    return saved ? JSON.parse(saved) : [];
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('nvk_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isEditingBudgets, setIsEditingBudgets] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(() => {
    return localStorage.getItem('nvk_onboarding_complete') !== 'true';
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nvk_user_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Nikola V. Kovac',
      username: 'nvk_finance',
      avatar: 'https://picsum.photos/40/40'
    };
  });
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({
    'Housing': 2000,
    'Food': 6000,
    'Transport': 500,
    'Entertainment': 400,
    'Other': 300
  });
  
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: 'Expense',
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
  });

  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    type: 'Stock',
    allocation: 0,
    value: 0,
    change24h: 0
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

  // Persistence
  useEffect(() => {
    localStorage.setItem('nvk_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('nvk_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('nvk_category_budgets', JSON.stringify(categoryBudgets));
  }, [categoryBudgets]);
  useEffect(() => {
    const updatePrices = async () => {
      const cryptoIds = assets.filter(a => a.type === 'Crypto').map(a => a.name.toLowerCase());
      if (cryptoIds.length === 0) return;

      const prices = await fetchCryptoPrices(cryptoIds);
      if (prices.length > 0) {
        setAssets(current => current.map(asset => {
          const priceData = prices.find(p => p.id === asset.name.toLowerCase());
          if (priceData) {
            return {
              ...asset,
              value: asset.units * priceData.current_price,
              change24h: Number(priceData.price_change_percentage_24h.toFixed(2))
            };
          }
          return asset;
        }));
      }
    };

    updatePrices();
    const interval = setInterval(updatePrices, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
    const totalLiabilities = 0; // In a real app, this would be calculated from debts/liabilities
    const netWorth = totalAssets - totalLiabilities;
    
    // Calculate monthly savings from transactions
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const monthlyIncome = transactions
      .filter(t => t.type === 'Income' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = transactions
      .filter(t => t.type === 'Expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const cashAssets = assets.filter(a => a.type === 'Cash').reduce((sum, a) => sum + a.value, 0);
    const runway = monthlyExpenses > 0 ? (cashAssets / monthlyExpenses).toFixed(1) : '∞';
    
    return {
      netWorth,
      totalAssets,
      totalLiabilities,
      monthlySavings: monthlyIncome - monthlyExpenses,
      runway
    };
  }, [assets, transactions]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.description || !newTx.amount) return;

    if (editingTransaction) {
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? { ...editingTransaction, ...newTx } as Transaction : t));
    } else {
      const transaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        date: newTx.date || new Date().toISOString().split('T')[0],
        category: newTx.category || 'Other',
        amount: Number(newTx.amount),
        description: newTx.description,
        type: newTx.type as 'Income' | 'Expense',
      };
      setTransactions([transaction, ...transactions]);
    }

    setIsAddingTransaction(false);
    setEditingTransaction(null);
    setNewTx({
      type: 'Expense',
      date: new Date().toISOString().split('T')[0],
      category: 'Food',
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setNewTx(tx);
    setIsAddingTransaction(true);
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const units = Number(newAsset.units) || 0;
    const costBasis = Number(newAsset.costBasis) || 0;
    const calculatedValue = units * costBasis;

    if (!newAsset.name || !newAsset.symbol) return;

    if (editingAsset) {
      setAssets(assets.map(a => a.id === editingAsset.id ? { 
        ...editingAsset, 
        ...newAsset,
        units,
        costBasis,
        value: calculatedValue 
      } as Asset : a));
    } else {
      const asset: Asset = {
        id: Math.random().toString(36).substr(2, 9),
        name: newAsset.name,
        symbol: newAsset.symbol,
        units,
        costBasis,
        value: calculatedValue,
        change24h: 0,
        allocation: Number(newAsset.allocation) || 0,
        type: newAsset.type as any,
      };
      setAssets([...assets, asset]);
    }

    setIsAddingAsset(false);
    setEditingAsset(null);
    setNewAsset({
      type: 'Stock',
      allocation: 0,
      units: 0,
      costBasis: 0,
      value: 0,
      change24h: 0
    });
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setNewAsset(asset);
    setIsAddingAsset(true);
  };

  const handleOnboardingComplete = (data: {
    profile: UserProfile;
    goals: string[];
    initialAsset: Partial<Asset>;
    budgets: Record<string, number>;
    initialIncome?: number;
  }) => {
    // Update profile
    setUserProfile(data.profile);
    localStorage.setItem('nvk_user_profile', JSON.stringify(data.profile));

    const newAssets: Asset[] = [];
    const newTransactions: Transaction[] = [];

    // Update assets if initial asset was provided
    if (data.initialAsset.name && (data.initialAsset.units || data.initialAsset.value)) {
      const asset: Asset = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.initialAsset.name,
        symbol: data.initialAsset.symbol || 'ASSET',
        units: Number(data.initialAsset.units) || 0,
        costBasis: Number(data.initialAsset.costBasis) || 0,
        value: (Number(data.initialAsset.units) || 0) * (Number(data.initialAsset.costBasis) || 0),
        type: data.initialAsset.type as any,
        allocation: 100,
        change24h: 0
      };
      newAssets.push(asset);
    }

    // Add initial income as a transaction
    if (data.initialIncome && data.initialIncome > 0) {
      newTransactions.push({
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        description: 'Initial Balance / Income',
        category: 'Salary',
        amount: data.initialIncome,
        type: 'Income'
      });
    }

    setAssets(newAssets);
    setTransactions(newTransactions);
    setCategoryBudgets(data.budgets);
    
    // Persist completion
    localStorage.setItem('nvk_onboarding_complete', 'true');
    setIsOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('nvk_onboarding_complete');
    localStorage.removeItem('nvk_user_profile');
    localStorage.removeItem('nvk_assets');
    localStorage.removeItem('nvk_transactions');
    localStorage.removeItem('nvk_category_budgets');
    window.location.reload();
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsConnectingWallet(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error('Failed to connect to MetaMask:', error);
        alert('Failed to connect to MetaMask. Please make sure it is installed and unlocked.');
      } finally {
        setIsConnectingWallet(false);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  const NavItem = ({ name, icon }: { name: string, icon: React.ReactNode }) => (
    <button 
      onClick={() => {
        setActiveTab(name);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 w-full ${
        activeTab === name 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{name}</span>
    </button>
  );

  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];
    
    // Group transactions by month and calculate cumulative balance
    const sortedTxs = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const monthlyData: Record<string, number> = {};
    let cumulative = 0;
    
    sortedTxs.forEach(tx => {
      const month = new Date(tx.date).toLocaleString('default', { month: 'short' });
      if (tx.type === 'Income') cumulative += tx.amount;
      else cumulative -= tx.amount;
      monthlyData[month] = cumulative;
    });
    
    return Object.entries(monthlyData).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const allocationData = useMemo(() => {
    return assets.reduce((acc, a) => {
      const existing = acc.find(x => x.name === a.type);
      if (existing) existing.value += a.value;
      else acc.push({ name: a.type, value: a.value });
      return acc;
    }, [] as {name: string, value: number}[]);
  }, [assets]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      {isOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      
      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      
      {/* Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-slate-900 border-r border-slate-800 p-6 flex flex-col transition-transform duration-300 ease-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
              N
            </div>
            <span className="text-lg font-bold text-white">NVK Finance</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem name="Overview" icon={<LayoutDashboard className="h-5 w-5" />} />
          <NavItem name="Investments" icon={<TrendingUp className="h-5 w-5" />} />
          <NavItem name="Budget" icon={<Wallet className="h-5 w-5" />} />
          <NavItem name="Planning" icon={<Target className="h-5 w-5" />} />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-800/50">
            <img src={userProfile.avatar} className="w-10 h-10 rounded-full border-2 border-slate-700 object-cover" alt="Avatar" referrerPolicy="no-referrer" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{userProfile.name}</p>
              <p className="text-[10px] text-slate-500 truncate">@{userProfile.username}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-6 shrink-0">
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            N
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">NVK Finance</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem name="Overview" icon={<LayoutDashboard className="h-5 w-5" />} />
          <NavItem name="Investments" icon={<TrendingUp className="h-5 w-5" />} />
          <NavItem name="Budget" icon={<Wallet className="h-5 w-5" />} />
          <NavItem name="Planning" icon={<Target className="h-5 w-5" />} />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <button 
            onClick={resetOnboarding}
            className="w-full flex items-center space-x-3 mb-4 p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors text-xs"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Reset Experience</span>
          </button>
          <div className="flex items-center space-x-3 mb-6 p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <img src={userProfile.avatar} className="w-10 h-10 rounded-full border-2 border-slate-700 object-cover" alt="Avatar" referrerPolicy="no-referrer" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{userProfile.name}</p>
              <p className="text-[10px] text-slate-500 truncate">
                {walletAddress ? `Wallet: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : `@${userProfile.username}`}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-8 py-4 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">{activeTab}</h1>
            <div className="hidden sm:flex items-center px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
              <Activity className="h-3 w-3 mr-1.5 animate-pulse" />
              Live Context
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {walletAddress ? (
              <div className="hidden sm:flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-xs font-mono text-slate-400 font-bold">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                disabled={isConnectingWallet}
                className="hidden sm:flex items-center space-x-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>{isConnectingWallet ? 'Init...' : 'Connect Auth'}</span>
              </button>
            )}
            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
            </button>
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="flex items-center bg-blue-600 hover:bg-blue-500 text-white p-2 sm:px-4 sm:py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20"
            >
              <MessageSquare className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">AI Advisor</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8">
          {activeTab === 'Overview' && (
            <>
              {assets.length === 0 && transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                    <History className="h-10 w-10 text-slate-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome to your new dashboard</h2>
                  <p className="text-slate-400 max-w-md mb-8">
                    Start by adding your first asset or transaction to see your financial overview come to life.
                  </p>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => setIsAddingAsset(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add First Asset
                    </button>
                    <button 
                      onClick={() => setIsAddingTransaction(true)}
                      className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all border border-slate-700 flex items-center"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Log Transaction
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Stats Overview */}
                  <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  label="Net Worth" 
                  value={`$${stats.netWorth.toLocaleString()}`} 
                  change="4.2%" 
                  isPositive={true}
                  icon={<History className="h-6 w-6 text-blue-400" />}
                />
                <StatCard 
                  label="Monthly Savings" 
                  value={`$${stats.monthlySavings.toLocaleString()}`} 
                  change="12%" 
                  isPositive={true}
                  icon={<TrendingUp className="h-6 w-6 text-emerald-400" />}
                />
                <StatCard 
                  label="Invested Capital" 
                  value={`$${stats.totalAssets.toLocaleString()}`} 
                  change="2.1%" 
                  isPositive={true}
                  icon={<Wallet className="h-6 w-6 text-amber-400" />}
                />
                <StatCard 
                  label="Emergency Runway" 
                  value={`${stats.runway} Months`} 
                  change="Cash Reserve" 
                  isPositive={Number(stats.runway) >= 6}
                  icon={<AlertCircle className="h-6 w-6 text-rose-400" />}
                />
              </section>

              {/* Charts Row */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-white">Portfolio Performance</h3>
                      <p className="text-xs text-slate-500">Wealth growth over time</p>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    {chartData.length < 2 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <p className="text-xs">More transaction data needed for growth chart</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 10 }} 
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 10 }} 
                            tickFormatter={(val) => `$${(val / 1000).toLocaleString()}k`}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-2">Asset Allocation</h3>
                  <p className="text-xs text-slate-500 mb-6">Distribution across your portfolio</p>
                  <div className="h-[250px] w-full flex items-center justify-center">
                    {assets.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600">
                        <p className="text-xs">No assets to display</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={8}
                            dataKey="value"
                          >
                            {allocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                            itemStyle={{ color: '#f8fafc' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {allocationData.length > 0 && allocationData.map((item, i) => (
                      <div key={item.name} className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span className="text-[10px] text-slate-400 font-medium truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Assets & Transactions */}
              <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-10">
                <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-white">Your Holdings</h3>
                    <button 
                      onClick={() => {
                        setEditingAsset(null);
                        setNewAsset({ type: 'Stock', allocation: 0, value: 0, change24h: 0 });
                        setIsAddingAsset(true);
                      }}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors"
                    >
                      Add Asset
                    </button>
                  </div>
                  <AssetTable 
                    assets={assets} 
                    onEdit={handleEditAsset}
                    onDelete={handleDeleteAsset}
                  />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-white">Recent Transactions</h3>
                    <button 
                      onClick={() => {
                        setEditingTransaction(null);
                        setNewTx({ type: 'Expense', date: new Date().toISOString().split('T')[0], category: 'Food' });
                        setIsAddingTransaction(true);
                      }}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors"
                    >
                      Add New
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    {transactions.length === 0 ? (
                      <p className="text-center py-6 text-slate-500 text-sm">No recent transactions</p>
                    ) : (
                      transactions.slice(0, 6).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 transition-colors group">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                              tx.type === 'Income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {tx.type === 'Income' ? '+$' : '-$'}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{tx.description}</p>
                              <p className="text-[10px] text-slate-500">{tx.category} • {tx.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <p className={`text-sm font-bold ${tx.type === 'Income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {tx.type === 'Expense' ? '-' : '+'}${tx.amount.toLocaleString()}
                            </p>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEditTransaction(tx)}
                                className="p-1 text-slate-400 hover:text-blue-400"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="p-1 text-slate-400 hover:text-rose-400"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </>
      )}

          {activeTab === 'Investments' && (
            <div className="space-y-8">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Investment Strategy</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                    <h4 className="text-slate-400 text-xs font-bold uppercase mb-2">Risk Profile</h4>
                    <p className="text-xl font-bold text-white">Moderate-Aggressive</p>
                    <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[75%]"></div>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                    <h4 className="text-slate-400 text-xs font-bold uppercase mb-2">Projected Annual Return</h4>
                    <p className="text-xl font-bold text-emerald-400">12.4%</p>
                    <p className="text-[10px] text-slate-500 mt-1">Based on historical performance</p>
                  </div>
                  <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                    <h4 className="text-slate-400 text-xs font-bold uppercase mb-2">Diversification Score</h4>
                    <p className="text-xl font-bold text-amber-400">84/100</p>
                    <p className="text-[10px] text-slate-500 mt-1">Good asset class mix</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-white">Detailed Asset List</h3>
                  <button 
                    onClick={() => {
                      setEditingAsset(null);
                      setNewAsset({ type: 'Stock', allocation: 0, value: 0, change24h: 0 });
                      setIsAddingAsset(true);
                    }}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors"
                  >
                    Add Asset
                  </button>
                </div>
                <AssetTable 
                  assets={assets} 
                  onEdit={handleEditAsset}
                  onDelete={handleDeleteAsset}
                />
              </div>
            </div>
          )}

          {activeTab === 'Budget' && (
            <div className="space-y-8">
              {/* Budget Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h4 className="text-slate-400 text-xs font-bold uppercase mb-2">Total Budget</h4>
                  <p className="text-2xl font-bold text-white">${Object.values(categoryBudgets).reduce((a, b) => a + b, 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h4 className="text-slate-400 text-xs font-bold uppercase mb-2">Actual Spending</h4>
                  <p className="text-2xl font-bold text-rose-400">
                    ${transactions
                      .filter(t => t.type === 'Expense')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h4 className="text-slate-400 text-xs font-bold uppercase mb-2">Remaining</h4>
                  <p className={`text-2xl font-bold ${
                    Object.values(categoryBudgets).reduce((a, b) => a + b, 0) - transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0) >= 0 
                      ? 'text-emerald-400' 
                      : 'text-rose-400'
                  }`}>
                    ${(Object.values(categoryBudgets).reduce((a, b) => a + b, 0) - transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0)).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Budget vs Actual</h3>
                    <button 
                      onClick={() => setIsEditingBudgets(true)}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded uppercase font-bold transition-colors"
                    >
                      Edit Limits
                    </button>
                  </div>
                  <div className="space-y-6">
                    {Object.entries(categoryBudgets).map(([cat, budget]) => {
                      const actual = transactions
                        .filter(t => t.category === cat && t.type === 'Expense')
                        .reduce((sum, t) => sum + t.amount, 0);
                      const percentage = budget > 0 ? (actual / budget) * 100 : 0;
                      const isOver = actual > budget;
                      
                      return (
                        <div key={cat} className="group">
                          <div className="flex justify-between text-sm mb-1.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-300 font-medium">{cat}</span>
                              {isOver && (
                                <span className="text-[10px] bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded font-bold">Over Budget</span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-white font-bold">${actual.toLocaleString()}</span>
                              <span className="text-slate-500 text-xs ml-1">/ ${budget.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
                            <div 
                              className={`h-full transition-all duration-500 ${isOver ? 'bg-rose-500' : percentage > 85 ? 'bg-amber-500' : 'bg-blue-500'}`} 
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                            {percentage > 100 && (
                              <div 
                                className="absolute top-0 left-0 h-full bg-rose-600/30" 
                                style={{ width: '100%' }}
                              ></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Savings Goals</h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300">Emergency Fund</span>
                          <span className="text-white font-bold">$18,500 / $25,000</span>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[74%]"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300">New Car</span>
                          <span className="text-white font-bold">$4,200 / $15,000</span>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-[28%]"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300">Vacation</span>
                          <span className="text-white font-bold">$1,200 / $3,000</span>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 w-[40%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-2">Financial Health Score</h3>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                          <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={226.2} strokeDashoffset={226.2 * (1 - 0.78)} className="text-blue-500" />
                        </svg>
                        <span className="absolute text-xl font-bold text-white">78</span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-300 font-medium">You're doing great!</p>
                        <p className="text-xs text-slate-500 mt-1">Your savings rate is 15% higher than last month. Keep it up!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-white">All Transactions</h3>
                  <button 
                    onClick={() => {
                      setEditingTransaction(null);
                      setNewTx({ type: 'Expense', date: new Date().toISOString().split('T')[0], category: 'Food' });
                      setIsAddingTransaction(true);
                    }}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Add Transaction
                  </button>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-2">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors group">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                            tx.type === 'Income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-900 text-slate-400'
                          }`}>
                            {tx.type === 'Income' ? '+$' : '-$'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{tx.description}</p>
                            <p className="text-[10px] text-slate-500">{tx.category} • {tx.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <p className={`text-sm font-bold ${tx.type === 'Income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {tx.type === 'Expense' ? '-' : '+'}${tx.amount.toLocaleString()}
                          </p>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEditTransaction(tx)}
                              className="p-1.5 text-slate-400 hover:text-blue-400"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Planning' && (
            <PlanningTools assets={assets} transactions={transactions} />
          )}
        </div>

        {/* Add Transaction Modal */}
        {isAddingTransaction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsAddingTransaction(false); setEditingTransaction(null); }}></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-white mb-6">{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setNewTx({...newTx, type: 'Expense'})}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${newTx.type === 'Expense' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      Expense
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewTx({...newTx, type: 'Income'})}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${newTx.type === 'Income' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      Income
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                  <input 
                    type="text" 
                    required
                    value={newTx.description || ''}
                    onChange={e => setNewTx({...newTx, description: e.target.value})}
                    className="w-full bg-slate-800 border-none rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g. Grocery Shopping"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Amount</label>
                    <input 
                      type="number" 
                      required
                      value={newTx.amount || ''}
                      onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})}
                      className="w-full bg-slate-800 border-none rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                    <select 
                      value={newTx.category}
                      onChange={e => setNewTx({...newTx, category: e.target.value})}
                      className="w-full bg-slate-800 border-none rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600"
                    >
                      <option>Food</option>
                      <option>Housing</option>
                      <option>Transport</option>
                      <option>Entertainment</option>
                      <option>Salary</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex space-x-3">
                  <button 
                    type="button"
                    onClick={() => { setIsAddingTransaction(false); setEditingTransaction(null); }}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                  >
                    {editingTransaction ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Asset Modal */}
        {isAddingAsset && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsAddingAsset(false); setEditingAsset(null); }}></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-white mb-6">{editingAsset ? 'Edit Asset' : 'Add Asset'}</h3>
              <form onSubmit={handleAddAsset} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
                    <input 
                      type="text" 
                      required
                      value={newAsset.name || ''}
                      onChange={e => setNewAsset({...newAsset, name: e.target.value})}
                      className="w-full bg-slate-800 border-none rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600"
                      placeholder="e.g. Apple Inc."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Symbol</label>
                    <input 
                      type="text" 
                      required
                      value={newAsset.symbol || ''}
                      onChange={e => setNewAsset({...newAsset, symbol: e.target.value.toUpperCase()})}
                      className="w-full bg-slate-800 border-none rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600"
                      placeholder="e.g. AAPL"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Units Owned</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      value={newAsset.units || ''}
                      onChange={e => setNewAsset({...newAsset, units: Number(e.target.value)})}
                      className="w-full bg-slate-800 border-none rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Cost Basis ($)</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      value={newAsset.costBasis || ''}
                      onChange={e => setNewAsset({...newAsset, costBasis: Number(e.target.value)})}
                      className="w-full bg-slate-800 border-none rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                  <select 
                    value={newAsset.type}
                    onChange={e => setNewAsset({...newAsset, type: e.target.value as any})}
                    className="w-full bg-slate-800 border-none rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Stock">Stock</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Cash">Cash</option>
                    <option value="Real Estate">Real Estate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Allocation (%)</label>
                  <input 
                    type="number" 
                    required
                    value={newAsset.allocation || ''}
                    onChange={e => setNewAsset({...newAsset, allocation: Number(e.target.value)})}
                    className="w-full bg-slate-800 border-none rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600"
                    placeholder="0"
                    max="100"
                  />
                </div>
                <div className="pt-4 flex space-x-3">
                  <button 
                    type="button"
                    onClick={() => { setIsAddingAsset(false); setEditingAsset(null); }}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                  >
                    {editingAsset ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Floating AI Panel Overlay (Mobile/Tablets) or Persistent on desktop if toggled */}
        {isChatOpen && (
          <div className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-10 flex flex-col h-full animate-in fade-in slide-in-from-right duration-300">
             <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={() => setIsChatOpen(false)}></div>
             <div className="absolute right-0 top-0 h-full w-full max-w-sm lg:max-w-none shadow-2xl">
                <ChatAssistant assets={assets} transactions={transactions} />
             </div>
          </div>
        )}
        {/* Edit Budgets Modal */}
        {isEditingBudgets && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditingBudgets(false)}></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-white mb-6">Edit Monthly Budgets</h3>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {Object.entries(categoryBudgets).map(([cat, budget]) => (
                  <div key={cat}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{cat}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <input 
                        type="number" 
                        value={budget}
                        onChange={e => setCategoryBudgets({...categoryBudgets, [cat]: Number(e.target.value)})}
                        className="w-full bg-slate-800 border-none rounded-lg pl-8 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6">
                <button 
                  onClick={() => setIsEditingBudgets(false)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
