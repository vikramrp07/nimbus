import React, { useEffect, useState } from 'react';
import { getAppData } from '../services/storage';
import { AppData } from '../types';
import { Card } from '../components/Card';

export const Budget: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    setData(getAppData());
  }, []);

  if (!data) return null;

  const totalBudget = data.budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = data.budgets.reduce((acc, b) => acc + b.spent, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Monthly Budget</h1>
           <p className="text-slate-500 mt-1">
             You've spent <span className="font-semibold text-slate-900">₹{totalSpent.toFixed(0)}</span> of <span className="font-semibold text-slate-900">₹{totalBudget.toFixed(0)}</span> total budget.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.budgets.map((budget) => {
          const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
          const isOver = budget.spent > budget.limit;

          return (
            <Card key={budget.id} className="p-6 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{budget.category}</h3>
                  <p className="text-sm text-slate-500">
                    ₹{budget.spent.toFixed(0)} <span className="text-slate-300">/</span> ₹{budget.limit}
                  </p>
                </div>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold opacity-80"
                  style={{ backgroundColor: budget.color }}
                >
                  {Math.round(percentage)}%
                </div>
              </div>
              
              <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${percentage}%`, 
                    backgroundColor: isOver ? '#ef4444' : budget.color 
                  }}
                />
              </div>
              
              {isOver && (
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg w-fit">
                  Over budget by ₹{(budget.spent - budget.limit).toFixed(0)}
                </div>
              )}
            </Card>
          );
        })}

        {/* Add Budget Card Placeholder */}
        <button className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors h-[180px]">
           <span className="text-3xl font-light mb-2">+</span>
           <span className="font-medium text-sm">Create Envelope</span>
        </button>
      </div>
    </div>
  );
};