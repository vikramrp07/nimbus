import React, { useEffect, useState } from 'react';
import { getAppData, addBudget, deleteBudget } from '../services/storage';
import { AppData, CategoryItem } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input, Select } from '../components/Input';
import { Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Budget: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limitAmount, setLimitAmount] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setData(getAppData());
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !limitAmount || !data) return;

    const categoryItem = data.categories.find(c => c.name === selectedCategory);
    const color = categoryItem?.color || '#6366f1';

    addBudget(selectedCategory, parseFloat(limitAmount), color);
    
    // Reset and reload
    setSelectedCategory('');
    setLimitAmount('');
    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteBudget = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this budget envelope?")) {
      deleteBudget(id);
      loadData();
    }
  };

  if (!data) return null;

  const totalBudget = data.budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = data.budgets.reduce((acc, b) => acc + b.spent, 0);
  
  // Filter categories that don't have a budget yet
  const availableCategories = data.categories.filter(
    c => !data.budgets.some(b => b.category === c.name)
  );

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
          const remaining = budget.limit - budget.spent;

          return (
            <Card key={budget.id} className={`p-6 relative overflow-hidden group border-2 transition-colors ${isOver ? 'border-red-100 bg-red-50/10' : 'border-transparent'}`}>
              <button 
                onClick={(e) => handleDeleteBudget(budget.id, e)}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{budget.category}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Limit: ₹{budget.limit.toLocaleString()}
                  </p>
                </div>
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm
                    ${isOver ? 'bg-red-500 text-white' : 'text-white'}
                  `}
                  style={{ backgroundColor: isOver ? undefined : budget.color }}
                >
                  {Math.round(percentage)}%
                </div>
              </div>
              
              <div className="space-y-3">
                  <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`absolute h-full rounded-full transition-all duration-1000 ease-out ${isOver ? 'bg-red-500' : ''}`}
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: isOver ? undefined : budget.color 
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Spent: ₹{budget.spent.toLocaleString()}</span>
                      
                      {isOver ? (
                          <div className="flex items-center gap-1.5 text-red-600 font-bold bg-white px-2 py-0.5 rounded-full shadow-sm">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>₹{Math.abs(remaining).toLocaleString()} over</span>
                          </div>
                      ) : (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>₹{remaining.toLocaleString()} left</span>
                          </div>
                      )}
                  </div>
              </div>
            </Card>
          );
        })}

        {/* Add Budget Card */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all h-[200px] group"
        >
           <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-white border border-slate-100 flex items-center justify-center mb-3 transition-colors shadow-sm">
             <Plus className="w-6 h-6" />
           </div>
           <span className="font-medium">Create Envelope</span>
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Create Budget Envelope"
      >
        <form onSubmit={handleCreateBudget} className="space-y-4">
          <Select
            label="Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { value: '', label: 'Select a category' },
              ...availableCategories.map(c => ({ value: c.name, label: c.name }))
            ]}
          />
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
            <Input
              label="Monthly Limit"
              type="number"
              placeholder="0.00"
              className="pl-8"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full h-12 text-base" disabled={!selectedCategory || !limitAmount}>
              Create Budget
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};