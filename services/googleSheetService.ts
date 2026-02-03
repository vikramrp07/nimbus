import { AppData } from '../types';

export const APPS_SCRIPT_TEMPLATE = `
// ----------------------------------------------------------
// COPY THIS CODE INTO EXTENSIONS > APPS SCRIPT IN YOUR GOOGLE SHEET
// ----------------------------------------------------------

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const data = JSON.parse(e.postData.contents);
    
    // Sync Transactions
    updateSheet('Transactions', ['ID', 'Date', 'Amount', 'Type', 'Category', 'Description'], data.transactions.map(t => [
      t.id, t.date, t.amount, t.type, t.category, t.description
    ]));

    // Sync Categories
    updateSheet('Categories', ['ID', 'Name', 'Color', 'Default'], data.categories.map(c => [
      c.id, c.name, c.color, c.isDefault || false
    ]));

    // Sync Goals
    updateSheet('Goals', ['ID', 'Name', 'Target', 'Current', 'Due Date'], data.goals.map(g => [
      g.id, g.name, g.targetAmount, g.currentAmount, g.dueDate
    ]));

    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": e }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function updateSheet(sheetName, headers, rows) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  
  // Add Headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
  
  // Add Rows
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}
`;

export const syncToGoogleSheets = async (url: string, data: AppData): Promise<boolean> => {
  try {
    // We send a POST request with 'no-cors' initially to check reachability, 
    // but Google Apps Script returns a 302 redirect which fetch follows.
    // The standard way to handle GAS web apps from client-side JS is using Content-Type text/plain
    // to avoid CORS preflight options request which GAS doesn't handle well.
    
    const response = await fetch(url, {
      method: 'POST',
      mode: 'no-cors', // Important: GAS Web Apps often require this for simple POSTs
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
      body: JSON.stringify(data)
    });

    // With mode: 'no-cors', we get an opaque response. We can't check status.
    // We assume success if no network error occurred.
    return true;
  } catch (error) {
    console.error("Sync failed:", error);
    throw error;
  }
};
