import React, { useEffect, useState } from 'react';
import { getAppData } from '../services/storage';
import { getFinancialInsight } from '../services/geminiService';
import { AppData, TransactionType } from '../types';
import { Card } from '../components/Card';
import { ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    const loadedData = getAppData();
    setData(loadedData);
  }, []);

  const handleGenerateInsight = async () => {
    if (!data) return;
    setLoadingInsight(true);
    const text = await getFinancialInsight(data.transactions);
    setInsight(text);
    setLoadingInsight(false);
  };

  if (!data) return <div className="p-8 text-center text-slate-500">Loading Nimbus...</div>;

  const totalBalance = data.transactions.reduce((acc, tx) => {
    return tx.type === TransactionType.INCOME ? acc + tx.amount : acc - tx.amount;
  }, 0);

  const monthlyIncome = data.transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyExpense = data.transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);

  // Prepare chart data (cumulative balance over time approx)
  const chartData = data.transactions
    .slice()
    .reverse()
    .map((t, index) => ({
      name: index.toString(),
      amount: t.amount,
      type: t.type
    }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good Morning</h1>
          <p className="text-slate-500">Here is your financial overview.</p>
        </div>
        <div className="text-right">
            <span className="block text-sm text-slate-500">Total Balance</span>
            <span className="text-2xl font-bold text-slate-900">₹{totalBalance.toLocaleString()}</span>
        </div>
      </header>

      {/* AI Insight Section */}
      <Card className="p-1 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100">
        <div className="p-5 flex items-start gap-4">
          <div className="bg-white p-2.5 rounded-xl shadow-sm border border-indigo-50 text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-indigo-900 mb-1">Nimbus Insight</h3>
            {insight ? (
              <p className="text-sm text-indigo-800 leading-relaxed">{insight}</p>
            ) : (
              <p className="text-sm text-indigo-700/70">Tap the button to analyze your spending habits and get a smart tip.</p>
            )}
          </div>
          <button 
            onClick={handleGenerateInsight}
            disabled={loadingInsight}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loadingInsight ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Income</p>
              <p className="text-xl font-bold text-slate-900">+₹{monthlyIncome.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-full">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Expenses</p>
              <p className="text-xl font-bold text-slate-900">-₹{monthlyExpense.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Cash Flow</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
            </div>
            <div className="space-y-3">
                {data.transactions.slice(0, 4).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${tx.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                {tx.category.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">{tx.description}</p>
                                <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <span className={`font-semibold ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {tx.type === TransactionType.INCOME ? '+' : '-'}₹{tx.amount.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900">Goals</h3>
            </div>
             <div className="space-y-3">
                {data.goals.map(goal => (
                    <Card key={goal.id} className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-slate-900 text-sm">{goal.name}</span>
                            <span className="text-xs text-slate-500">₹{goal.currentAmount} / ₹{goal.targetAmount}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-indigo-500 rounded-full" 
                                style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%`}}
                            />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};