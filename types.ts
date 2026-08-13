
export interface Asset {
  id: string;
  name: string;
  symbol: string;
  units: number;      // Number of shares/coins/etc
  costBasis: number; // Price paid per unit
  value: number;     // Current market value (calculated)
  change24h: number;
  allocation: number;
  type: 'Stock' | 'Crypto' | 'Cash' | 'Real Estate';
}

export interface Transaction {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  type: 'Expense' | 'Income';
}

export interface PortfolioStats {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlySavings: number;
}

export interface UserProfile {
  name: string;
  username: string;
  avatar: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
