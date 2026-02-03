import React, { useEffect, useState } from 'react';
import { getAppData } from '../services/storage';
import { AppData } from '../types';
import { Card } from '../components/Card';
import { Trophy, Calendar } from 'lucide-react';

export const Goals: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    setData(getAppData());
  }, []);

  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Savings Goals</h1>
        <p className="text-slate-500">Track your progress towards financial freedom.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.goals.map((goal) => {
          const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          return (
            <Card key={goal.id} className="p-0 overflow-hidden flex flex-col h-full">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-4 inline-block">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                         <span className="text-2xl font-bold text-slate-900">₹{goal.currentAmount.toLocaleString()}</span>
                         <span className="block text-xs text-slate-500">of ₹{goal.targetAmount.toLocaleString()}</span>
                    </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-1">{goal.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                   <Calendar className="w-4 h-4" />
                   <span>Target: {new Date(goal.dueDate).toLocaleDateString()}</span>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>Progress</span>
                        <span>{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                            style={{ width: `${percentage}%`}}
                        />
                    </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                <button className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    Withdraw
                </button>
                <button className="flex-1 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
                    Add Money
                </button>
              </div>
            </Card>
          );
        })}
         
        <button className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors min-h-[300px]">
           <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
             <span className="text-2xl font-light">+</span>
           </div>
           <span className="font-medium">Create New Goal</span>
        </button>
      </div>
    </div>
  );
};