/**
 * Development utilities
 * Available in browser console as window.IvyDev
 */

import { db } from '@/db/database';
import { store } from '@/store';
import { seedDatabase, clearDatabase } from '@/db/seed';

export const devUtils = {
  // Database inspection
  async dbStats() {
    const stats = {};
    for (const table of db.tables) {
      stats[table.name] = await table.count();
    }
    console.table(stats);
    return stats;
  },

  async dbDump() {
    const dump = {};
    for (const table of db.tables) {
      dump[table.name] = await table.toArray();
    }
    console.log('Database dump:', dump);
    return dump;
  },

  async clearAll() {
    await clearDatabase();
    console.log('Database cleared. Refresh page to reset.');
    return true;
  },

  async seedData() {
    await seedDatabase();
    console.log('Sample data loaded. Refresh page to see changes.');
    return true;
  },

  // Redux inspection
  getState() {
    const state = store.getState();
    console.log('Redux state:', state);
    return state;
  },

  // Export data as JSON
  async exportJson() {
    const data = {};
    for (const table of db.tables) {
      data[table.name] = await table.toArray();
    }
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ivy-wallet-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('Exported to JSON');
  },

  // Import data from JSON
  async importJson(jsonData) {
    await clearDatabase();
    for (const [tableName, records] of Object.entries(jsonData)) {
      if (db[tableName]) {
        await db[tableName].bulkAdd(records);
      }
    }
    console.log('Imported from JSON. Refresh page to see changes.');
    return true;
  },

  // Helper: Create test transaction
  async addTestTransaction(type = 'EXPENSE') {
    const accounts = await db.accounts.toArray();
    const categories = await db.categories.toArray();

    if (accounts.length === 0 || categories.length === 0) {
      console.error('No accounts or categories found. Run seedData() first.');
      return;
    }

    const tx = {
      id: crypto.randomUUID(),
      accountId: accounts[0].id,
      type,
      amount: Math.round(Math.random() * 100 * 100) / 100,
      categoryId: categories[0].id,
      title: `Test ${type}`,
      dateTime: new Date().toISOString(),
      tags: [],
    };

    await db.transactions.add(tx);
    console.log('Added test transaction:', tx);
    return tx;
  },

  // Helper: Check PWA install status
  checkPWA() {
    const info = {
      serviceWorker: 'serviceWorker' in navigator,
      swRegistered: navigator.serviceWorker?.controller ? 'Yes' : 'No',
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      installed: window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches,
    };
    console.table(info);
    return info;
  },
};

// Expose to window for console access
if (typeof window !== 'undefined') {
  window.IvyDev = devUtils;
  console.log(
    '%cIvy Wallet Dev Tools',
    'background: #5C3DF5; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
  );
  console.log('Available commands:');
  console.log('  IvyDev.dbStats()       - Show database row counts');
  console.log('  IvyDev.dbDump()        - Dump all database data');
  console.log('  IvyDev.getState()      - Show Redux state');
  console.log('  IvyDev.seedData()      - Load sample data');
  console.log('  IvyDev.clearAll()      - Clear all data');
  console.log('  IvyDev.exportJson()    - Export data as JSON');
  console.log('  IvyDev.checkPWA()      - Check PWA install status');
}
