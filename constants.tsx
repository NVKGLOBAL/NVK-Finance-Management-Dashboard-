
import React from 'react';
import { Asset, Transaction, PortfolioStats } from './types';

export const MOCK_ASSETS: Asset[] = [
  { id: '1', name: 'S&P 500 Index', symbol: 'VOO', units: 300, costBasis: 450, value: 145000, change24h: 1.2, allocation: 45, type: 'Stock' },
  { id: '2', name: 'Bitcoin', symbol: 'BTC', units: 1.2, costBasis: 45000, value: 85000, change24h: -2.4, allocation: 25, type: 'Crypto' },
  { id: '3', name: 'Apple Inc.', symbol: 'AAPL', units: 200, costBasis: 180, value: 45000, change24h: 0.8, allocation: 15, type: 'Stock' },
  { id: '4', name: 'Cash (Savings)', symbol: 'USD', units: 35000, costBasis: 1, value: 35000, change24h: 0, allocation: 10, type: 'Cash' },
  { id: '5', name: 'Ethereum', symbol: 'ETH', units: 4, costBasis: 2200, value: 12000, change24h: 4.5, allocation: 5, type: 'Crypto' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2023-11-20', category: 'Housing', amount: 2500, description: 'Monthly Rent', type: 'Expense' },
  { id: 't2', date: '2023-11-18', category: 'Salary', amount: 8500, description: 'Principal Income', type: 'Income' },
  { id: 't3', date: '2023-11-15', category: 'Food', amount: 150, description: 'Whole Foods Market', type: 'Expense' },
  { id: 't4', date: '2023-11-12', category: 'Transport', amount: 65, description: 'Uber Rides', type: 'Expense' },
  { id: 't5', date: '2023-11-10', category: 'Entertainment', amount: 45, description: 'Netflix & Spotify', type: 'Expense' },
];

export const PORTFOLIO_STATS: PortfolioStats = {
  netWorth: 322000,
  totalAssets: 350000,
  totalLiabilities: 28000,
  monthlySavings: 3200,
};

export const PERFORMANCE_DATA = [
  { name: 'Jan', value: 280000 },
  { name: 'Feb', value: 295000 },
  { name: 'Mar', value: 290000 },
  { name: 'Apr', value: 310000 },
  { name: 'May', value: 315000 },
  { name: 'Jun', value: 330000 },
  { name: 'Jul', value: 325000 },
  { name: 'Aug', value: 340000 },
  { name: 'Sep', value: 335000 },
  { name: 'Oct', value: 350000 },
];
