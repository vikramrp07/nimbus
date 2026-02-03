import React, { useEffect, useState } from 'react';
import { getAppData, updateGoal, addGoal, deleteGoal } from '../services/storage';
import { AppData } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Trophy, Calendar, Plus, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const Goals: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'CREATE' | 'DEPOSIT' | 'WITHDRAW'>('CREATE');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  // Form State
  const [amountInput, setAmountInput] = useState('');
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setData(getAppData());
  };

  const openCreateModal = () => {
    setModalType('CREATE');
    setGoalName('');
    setTargetAmount('');
    setDueDate('');
    setIsModalOpen(true);
  };

  const openTransactionModal = (type: 'DEPOSIT' | 'WITHDRAW', goalId: string) => {
    setModalType(type);
    setSelectedGoalId(goalId);
    setAmountInput('');
    setIsModalOpen(true);
  };

  const handleDeleteGoal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this goal?")) {
      deleteGoal(id);
      loadData();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalType === 'CREATE') {
      if (!goalName || !targetAmount) return;
      
      addGoal(
        goalName, 
        parseFloat(targetAmount), 
        dueDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
      );
    } 
    else if (selectedGoalId && data) {
      if (!amountInput) return;
      const goal = data.goals.find(g => g.id === selectedGoalId);
      if (!goal) return;

      const amount = parseFloat(amountInput);
      let newAmount = goal.currentAmount;

      if (modalType === 'DEPOSIT') {
        newAmount += amount;
      } else {
        newAmount = Math.max(0, newAmount - amount);
      }
      
      updateGoal(selectedGoalId, newAmount);
    }

    setIsModalOpen(false);
    loadData();
  };

  if (!data) return null;

  const getModalTitle = () => {
    switch (modalType) {
      case 'CREATE': return 'Create New Savings Goal';
      case 'DEPOSIT': return 'Add Money to Goal';
      case 'WITHDRAW': return 'Withdraw from Goal';
      default: return '';
    }
  };

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
            <Card key={goal.id} className="p-0 overflow-hidden flex flex-col h-full group relative">
              <div className="p-6 flex-1">
                <button 
                  onClick={(e) => handleDeleteGoal(goal.id, e)}
                  className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl inline-block">
                        <Trophy className="w-6 h-6" />
                    </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-1">{goal.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                   <Calendar className="w-4 h-4" />
                   <span>Target: {new Date(goal.dueDate).toLocaleDateString()}</span>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                           <span className="text-xs font-medium text-slate-500">Saved</span>
                           <span className="text-lg font-bold text-slate-900">₹{goal.currentAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col text-right">
                           <span className="text-xs font-medium text-slate-500">Target</span>
                           <span className="text-sm font-semibold text-slate-700">₹{goal.targetAmount.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                            style={{ width: `${percentage}%`}}
                        />
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-bold text-indigo-600">{percentage.toFixed(0)}% Complete</span>
                    </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                <button 
                  onClick={() => openTransactionModal('WITHDRAW', goal.id)}
                  className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowDownRight className="w-4 h-4" /> Withdraw
                </button>
                <button 
                  onClick={() => openTransactionModal('DEPOSIT', goal.id)}
                  className="flex-1 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Money
                </button>
              </div>
            </Card>
          );
        })}
         
        <button 
          onClick={openCreateModal}
          className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors min-h-[300px] bg-slate-50/50 hover:bg-slate-50"
        >
           <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 text-slate-400">
             <Plus className="w-6 h-6" />
           </div>
           <span className="font-medium">Create New Goal</span>
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={getModalTitle()}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalType === 'CREATE' ? (
            <>
              <Input
                label="Goal Name"
                placeholder="e.g. New Car, Wedding"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                autoFocus
              />
              <div className="relative">
                <span className="absolute left-3 top-[34px] text-slate-400 font-bold z-10">₹</span>
                <Input
                  label="Target Amount"
                  type="number"
                  placeholder="0"
                  className="pl-7"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>
              <Input
                label="Target Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </>
          ) : (
             <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">₹</span>
                <Input
                  autoFocus
                  type="number"
                  placeholder="0.00"
                  className="pl-8 text-2xl font-bold h-16"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                />
             </div>
          )}

          <div className="pt-2">
            <Button type="submit" className="w-full h-12 text-base">
              {modalType === 'CREATE' ? 'Create Goal' : 'Confirm Transaction'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};