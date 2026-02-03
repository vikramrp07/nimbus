import React, { useEffect, useState, useRef } from 'react';
import { getAppData, addCategory, deleteCategory, saveAppData, updateSyncConfig, updateLastSync } from '../services/storage';
import { generateCSV, downloadFile, parseBackupFile } from '../services/exportService';
import { syncToGoogleSheets, APPS_SCRIPT_TEMPLATE } from '../services/googleSheetService';
import { CategoryItem } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Trash2, Check, Download, Upload, FileSpreadsheet, Database, CloudLightning, Copy, ExternalLink, RefreshCw } from 'lucide-react';

export const Settings: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Sync States
  const [scriptUrl, setScriptUrl] = useState('');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = getAppData();
    setCategories(data.categories || []);
    if (data.syncConfig) {
      setScriptUrl(data.syncConfig.googleScriptUrl || '');
      setLastSynced(data.syncConfig.lastSynced);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;

    addCategory(newCategoryName, newCategoryColor);
    setNewCategoryName('');
    setIsAdding(false);
    loadData();
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
      loadData();
    }
  };

  const handleExportCSV = () => {
    const data = getAppData();
    const csvContent = generateCSV(data.transactions);
    const filename = `nimbus_export_${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  };

  const handleBackupJSON = () => {
    const data = getAppData();
    const jsonContent = JSON.stringify(data, null, 2);
    const filename = `nimbus_backup_${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(jsonContent, filename, 'application/json');
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Restoring a backup will overwrite your current data. Continue?")) {
        e.target.value = ''; // Reset input
        return;
    }

    try {
        const data = await parseBackupFile(file);
        saveAppData(data);
        alert("Data restored successfully!");
        window.location.reload();
    } catch (error) {
        alert("Failed to restore data. Please ensure the file is a valid Nimbus JSON backup.");
        console.error(error);
    }
    e.target.value = ''; // Reset input
  };

  const handleSyncNow = async () => {
    if (!scriptUrl) {
      setIsSyncModalOpen(true);
      return;
    }

    setIsSyncing(true);
    try {
      const data = getAppData();
      await syncToGoogleSheets(scriptUrl, data);
      updateSyncConfig(scriptUrl);
      updateLastSync();
      setLastSynced(new Date().toISOString());
      alert("Sync completed! Check your Google Sheet.");
    } catch (error) {
      alert("Sync failed. Check console for details.");
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Code copied to clipboard!");
  };

  const colors = [
    '#6366f1', // Indigo
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#0ea5e9', // Sky
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#64748b', // Slate
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your application preferences.</p>
      </header>

      {/* Categories Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900">Categories</h2>
          <Button size="sm" onClick={() => setIsAdding(!isAdding)} variant="secondary">
            {isAdding ? 'Cancel' : 'Add Category'}
          </Button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddCategory} className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Category Name"
                placeholder="e.g. Gym, Subscriptions"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
              />
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Color Tag</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCategoryColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform ${newCategoryColor === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="gap-2">
                <Check className="w-4 h-4" /> Save Category
              </Button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="font-medium text-slate-700">{cat.name}</span>
                {cat.isDefault && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">Default</span>}
              </div>
              
              {!cat.isDefault && (
                <button 
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Google Sheets Sync Section */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                 <CloudLightning className="w-5 h-5" />
               </div>
               <h2 className="text-lg font-bold text-slate-900">Google Sheets Sync</h2>
            </div>
            <p className="text-sm text-slate-600">Connect a Google Sheet to use as your backend database.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setIsSyncModalOpen(true)}>
             Setup Guide
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
           <Input 
             label="Google Apps Script URL" 
             placeholder="https://script.google.com/macros/s/..." 
             value={scriptUrl}
             onChange={(e) => {
               setScriptUrl(e.target.value);
               updateSyncConfig(e.target.value);
             }}
           />
           <Button 
             onClick={handleSyncNow} 
             isLoading={isSyncing}
             disabled={!scriptUrl}
             className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
           >
             <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
             Sync Now
           </Button>
        </div>
        {lastSynced && (
          <p className="mt-3 text-xs text-slate-400">
            Last synced: {new Date(lastSynced).toLocaleString()}
          </p>
        )}
      </Card>

      {/* Data & Sync Section */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Manual Export</h2>
        <p className="text-sm text-slate-500 mb-6">Export your transactions for external analysis or backup your entire account.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
                onClick={handleExportCSV}
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group"
            >
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-900">Download CSV</span>
                <span className="text-xs text-slate-500 mt-1">For Excel / Sheets</span>
            </button>

            <button 
                onClick={handleBackupJSON}
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group"
            >
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Download className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-900">Backup JSON</span>
                <span className="text-xs text-slate-500 mt-1">Save all app data</span>
            </button>

            <button 
                onClick={handleRestoreClick}
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group"
            >
                <div className="p-3 bg-purple-50 text-purple-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-900">Restore Backup</span>
                <span className="text-xs text-slate-500 mt-1">Import JSON file</span>
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".json"
            />
        </div>
      </Card>

      {/* Reset Section */}
      <Card className="p-6 border-red-100 bg-red-50/30">
          <div className="flex items-center gap-3 mb-2 text-red-700">
             <Database className="w-5 h-5" />
             <h2 className="text-lg font-bold">Danger Zone</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4">Clear all your local data and reset to default state. This action cannot be undone.</p>
          <Button variant="danger" onClick={() => {
              if (window.confirm("This will delete all your transactions, categories, and goals. Are you sure?")) {
                  localStorage.clear();
                  window.location.reload();
              }
          }}>
              Reset App Data
          </Button>
      </Card>

      {/* Setup Modal */}
      <Modal 
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)} 
        title="Setup Google Sheets Backend"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-slate-600">
            Follow these steps to connect Nimbus to a private Google Sheet. This allows you to own your data and access it from anywhere.
          </p>
          
          <ol className="list-decimal list-inside space-y-3 text-sm text-slate-700 marker:font-bold">
            <li>Create a new <strong>Google Sheet</strong> in your Drive.</li>
            <li>Go to <strong>Extensions {'>'} Apps Script</strong>.</li>
            <li>Delete any existing code and paste the script below:</li>
            <div className="relative group">
              <pre className="bg-slate-900 text-slate-50 p-3 rounded-lg text-xs overflow-x-auto font-mono border border-slate-700">
                {APPS_SCRIPT_TEMPLATE.split('\n').slice(0, 10).join('\n')}... (full code below)
              </pre>
              <Button 
                size="sm" 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyToClipboard(APPS_SCRIPT_TEMPLATE)}
              >
                <Copy className="w-3 h-3 mr-1" /> Copy Full Code
              </Button>
            </div>
            <li>Click <strong>Deploy {'>'} New deployment</strong>.</li>
            <li>Select type: <strong>Web app</strong>.</li>
            <li>Set "Who has access" to <strong>"Anyone"</strong> (This is required for the app to post data without complex login).</li>
            <li>Click <strong>Deploy</strong> and copy the <strong>Web App URL</strong>.</li>
            <li>Paste the URL into the input field in Settings.</li>
          </ol>
        </div>
      </Modal>
    </div>
  );
};
