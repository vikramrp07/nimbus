import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Budget } from './pages/Budget';
import { Goals } from './pages/Goals';
import { Settings } from './pages/Settings';
import { Modal } from './components/Modal';
import { Input, Select } from './components/Input';
import { Button } from './components/Button';
import { Category, TransactionType, CategoryItem } from './types';
import { addTransaction, getAppData } from './services/storage';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(Category.FOOD);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [availableCategories, setAvailableCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const data = getAppData();
    setAvailableCategories(data.categories || []);
  }, [isModalOpen]); // Reload categories when modal opens in case they changed

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    addTransaction({
      amount: parseFloat(amount),
      description,
      category,
      type,
      date: new Date().toISOString(),
    });

    // Reset and close
    setAmount('');
    setDescription('');
    setIsModalOpen(false);
    
    // Simple way to refresh data without complex state management for this MVP
    window.location.reload(); 
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50/50 flex">
        <Navbar onAddTransaction={() => setIsModalOpen(true)} />
        
        <main className="flex-1 md:ml-64 p-4 md:p-8 pb-32 md:pb-8 overflow-y-auto min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="Add Transaction"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === TransactionType.EXPENSE ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setType(TransactionType.EXPENSE)}
              >
                Expense
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === TransactionType.INCOME ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setType(TransactionType.INCOME)}
              >
                Income
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <Input
                autoFocus
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8 text-2xl font-bold"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <Input
              label="Description"
              placeholder="What is this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={availableCategories.map(c => ({ value: c.name, label: c.name }))}
            />

            <div className="pt-2">
              <Button type="submit" className="w-full h-12 text-base">
                Save Transaction
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Router>
  );
};

export default App;