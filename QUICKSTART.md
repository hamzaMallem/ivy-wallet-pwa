# Quick Start Guide

## Installation

```bash
cd web
npm install
```

## Development

```bash
npm run dev
```

Visit http://localhost:5173

## First Time Setup

1. **Onboarding** will appear on first launch
2. Choose your base currency (e.g., USD)
3. Create your first accounts (Cash, Bank, etc.)
4. Set up categories (Food, Transport, Salary, etc.)
5. Click "Finish" to complete setup

## Adding Sample Data

Settings → Data → "Load Sample Data"

This creates:
- 3 accounts (Cash, Bank, Savings)
- 8 categories
- ~68 sample transactions over 3 months

## Daily Usage

### Add a Transaction
1. Tap the **+** button in bottom navigation
2. Select type: **INCOME** / **EXPENSE** / **TRANSFER**
3. Enter amount, title, account, category
4. Choose date/time
5. Save

### View Reports
1. Tap **Reports** in bottom nav
2. See pie charts and category breakdown
3. Toggle between Expenses and Income tabs
4. Navigate months with ← → arrows

### Manage Budget
1. Settings → Features → **Budgets**
2. Create budget with monthly limit
3. Select categories to track (or leave empty for all)
4. View progress bars showing spent vs limit

### Schedule Payments
1. Settings → Features → **Planned Payments**
2. Create one-time or recurring payment
3. Choose interval: daily, weekly, monthly, yearly

### Track Loans
1. Settings → Features → **Loans**
2. Create loan (LEND or BORROW)
3. Add payment records as you repay/receive
4. View progress with color-coded bars

## Keyboard Shortcuts

- `/` — Focus search
- `Esc` — Close modal
- `Ctrl/Cmd + S` — Save form (in modals)

## Data Export

Settings → Data → **Export to CSV**

Creates timestamped CSV file with all transactions.

## Data Import

Settings → Data → **Import from CSV**

CSV format:
```csv
Date,Title,Type,Amount,Account,Category,Description
2024-01-15,Grocery Store,EXPENSE,45.20,Cash,Food & Drinks,Weekly shopping
2024-01-01,Salary,INCOME,5000.00,Bank,Salary,Monthly salary
```

## Themes

Settings → Appearance → Switch between Light/Dark modes

## PWA Installation

### Desktop (Chrome/Edge)
1. Click install icon in address bar
2. Or Settings menu → "Install Ivy Wallet"

### Mobile (Android/iOS)
1. Open in browser
2. Menu → "Add to Home Screen"
3. App installs and works offline

## Troubleshooting

### Data not showing?
- Check Settings → verify onboarding completed
- Try "Load Sample Data" to test the app

### Can't create transaction?
- Ensure at least one account exists
- Check account has valid currency

### Import failed?
- Verify CSV has required columns (Date, Type, Amount, Account)
- Type must be: INCOME, EXPENSE, or TRANSFER
- Amount must be numeric

### Reset app?
Settings → Data → **Delete All Data** (cannot be undone)

## Building for Production

```bash
npm run build
```

Output in `dist/` folder. Deploy to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag `dist/` folder to netlify.app

## Tech Notes

- All data stored locally in IndexedDB (browser database)
- No backend/server required
- PWA works offline once installed
- Service worker caches assets for fast loading
