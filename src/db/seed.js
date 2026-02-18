import { db } from './database';

const ACCOUNTS = [
  { id: crypto.randomUUID(), name: 'Cash', currency: 'USD', color: 0x12b880, icon: 'cash', orderNum: 0, includeInBalance: true },
  { id: crypto.randomUUID(), name: 'Bank', currency: 'USD', color: 0x3193f5, icon: 'bank', orderNum: 1, includeInBalance: true },
  { id: crypto.randomUUID(), name: 'Savings', currency: 'USD', color: 0x5c3df5, icon: 'savings', orderNum: 2, includeInBalance: true },
];

const CATEGORIES = [
  { id: crypto.randomUUID(), name: 'Food & Drinks', color: 0xf57a3d, icon: 'food', orderNum: 0 },
  { id: crypto.randomUUID(), name: 'Shopping', color: 0xf53d99, icon: 'shopping', orderNum: 1 },
  { id: crypto.randomUUID(), name: 'Transport', color: 0x3193f5, icon: 'transport', orderNum: 2 },
  { id: crypto.randomUUID(), name: 'Bills', color: 0xf53d3d, icon: 'bills', orderNum: 3 },
  { id: crypto.randomUUID(), name: 'Entertainment', color: 0x5c3df5, icon: 'entertainment', orderNum: 4 },
  { id: crypto.randomUUID(), name: 'Health', color: 0x12b880, icon: 'health', orderNum: 5 },
  { id: crypto.randomUUID(), name: 'Salary', color: 0x12b880, icon: 'salary', orderNum: 6 },
  { id: crypto.randomUUID(), name: 'Gifts', color: 0xf5d018, icon: 'gifts', orderNum: 7 },
];

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60));
  return d.toISOString();
}

function randomAmount(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function generateTransactions(accounts, categories) {
  const txs = [];
  const expenseCats = categories.filter((c) => c.name !== 'Salary');
  const incomeCat = categories.find((c) => c.name === 'Salary');

  // Generate salary income for last 3 months
  for (let m = 0; m < 3; m++) {
    const date = new Date();
    date.setMonth(date.getMonth() - m, 1);
    date.setHours(9, 0, 0, 0);
    txs.push({
      id: crypto.randomUUID(),
      accountId: accounts[1].id,
      type: 'INCOME',
      amount: 5000,
      title: 'Monthly Salary',
      categoryId: incomeCat.id,
      dateTime: date.toISOString(),
      tags: [],
    });
  }

  // Generate random expenses
  const expenseNames = {
    'Food & Drinks': ['Grocery Store', 'Coffee Shop', 'Restaurant', 'Fast Food', 'Bakery'],
    'Shopping': ['Amazon', 'Clothing Store', 'Electronics', 'Home Goods'],
    'Transport': ['Gas Station', 'Uber', 'Bus Ticket', 'Parking'],
    'Bills': ['Electricity', 'Internet', 'Phone Bill', 'Water Bill', 'Rent'],
    'Entertainment': ['Netflix', 'Movie Tickets', 'Concert', 'Books'],
    'Health': ['Pharmacy', 'Gym Membership', 'Doctor Visit'],
    'Gifts': ['Birthday Gift', 'Anniversary Gift'],
  };

  for (let i = 0; i < 60; i++) {
    const cat = expenseCats[Math.floor(Math.random() * expenseCats.length)];
    const titles = expenseNames[cat.name] || ['Expense'];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const account = accounts[Math.floor(Math.random() * 2)]; // Cash or Bank

    let amount;
    switch (cat.name) {
      case 'Bills': amount = randomAmount(50, 300); break;
      case 'Food & Drinks': amount = randomAmount(5, 80); break;
      case 'Shopping': amount = randomAmount(15, 200); break;
      case 'Transport': amount = randomAmount(5, 60); break;
      case 'Entertainment': amount = randomAmount(10, 50); break;
      case 'Health': amount = randomAmount(20, 150); break;
      case 'Gifts': amount = randomAmount(20, 100); break;
      default: amount = randomAmount(5, 100);
    }

    txs.push({
      id: crypto.randomUUID(),
      accountId: account.id,
      type: 'EXPENSE',
      amount,
      title,
      categoryId: cat.id,
      dateTime: randomDate(90),
      tags: [],
    });
  }

  // Generate a few transfers
  for (let i = 0; i < 5; i++) {
    txs.push({
      id: crypto.randomUUID(),
      accountId: accounts[1].id,
      toAccountId: accounts[2].id,
      type: 'TRANSFER',
      amount: randomAmount(200, 1000),
      toAmount: randomAmount(200, 1000),
      title: 'Transfer to Savings',
      dateTime: randomDate(90),
      tags: [],
    });
  }

  return txs;
}

export async function seedDatabase() {
  const existingAccounts = await db.accounts.count();
  if (existingAccounts > 0) {
    console.log('Database already has data, skipping seed.');
    return false;
  }

  console.log('Seeding database with sample data...');

  await db.transaction('rw', [db.accounts, db.categories, db.transactions, db.settings], async () => {
    await db.accounts.bulkAdd(ACCOUNTS);
    await db.categories.bulkAdd(CATEGORIES);
    await db.transactions.bulkAdd(generateTransactions(ACCOUNTS, CATEGORIES));
    await db.settings.put({
      id: 'app-settings',
      baseCurrency: 'USD',
      theme: 'light',
      name: 'Demo User',
      bufferAmount: 1000,
      showNotifications: true,
      hideCurrentBalance: false,
      hideIncome: false,
      startDayOfMonth: 1,
      treatTransfersAsIncomeExpense: false,
      onboardingCompleted: true,
    });
  });

  console.log('Seed complete: 3 accounts, 8 categories, 68 transactions');
  return true;
}

export async function clearDatabase() {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      await table.clear();
    }
  });
  console.log('Database cleared.');
}
