import { AppData, Transaction } from '../types';

/**
 * Generates a CSV string optimized for Google Sheets / Excel.
 * Includes BOM for UTF-8 support and handles escaping.
 */
export const generateCSV = (transactions: Transaction[]): string => {
  const BOM = '\uFEFF';
  const headers = ['Date', 'Amount', 'Type', 'Category', 'Description', 'ID'];
  
  const rows = transactions.map(t => {
    // Format date as YYYY-MM-DD for unambiguous spreadsheet parsing
    const date = new Date(t.date).toISOString().split('T')[0];
    // Escape quotes by doubling them, wrap fields in quotes
    const cleanDesc = t.description.replace(/"/g, '""');
    
    return [
      date,
      t.amount.toFixed(2),
      t.type,
      `"${t.category}"`,
      `"${cleanDesc}"`,
      `"${t.id}"`
    ].join(',');
  });
  
  return BOM + [headers.join(','), ...rows].join('\n');
};

export const downloadFile = (content: string, filename: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseBackupFile = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) throw new Error("File is empty");
        const json = JSON.parse(text);
        resolve(json as AppData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};