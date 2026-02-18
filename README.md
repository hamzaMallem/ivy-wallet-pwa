# Ivy Wallet Web — Progressive Web App

A complete money manager and budget tracker built as a PWA, mirroring the Android app functionality.

## Tech Stack

- **React 18** + **Redux Toolkit** for state management
- **Dexie.js** (IndexedDB) for local-first data storage
- **Shadcn/UI** components with **Tailwind CSS**
- **Vite** build system with PWA plugin
- **Recharts** for data visualization
- **JavaScript** (no TypeScript)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## Features

### Core Features
- ✅ **Accounts** — Multiple accounts with balances, currencies, custom colors & icons
- ✅ **Categories** — Organize transactions with visual icons
- ✅ **Transactions** — Income, Expense, Transfer types with full CRUD
- ✅ **Reports** — Pie charts for income/expense breakdown by category
- ✅ **Search** — Full-text search across all transactions

### Advanced Features
- ✅ **Budgets** — Monthly spending limits with progress tracking
- ✅ **Planned Payments** — One-time and recurring payments
- ✅ **Loans** — Track money lent/borrowed with payment records
- ✅ **Exchange Rates** — Multi-currency support with custom rates
- ✅ **CSV Import/Export** — Data portability

### PWA Features
- ✅ Offline support via service worker
- ✅ Installable on mobile & desktop
- ✅ Fast loading with code splitting
- ✅ Responsive design

## Project Structure

```
web/
├── src/
│   ├── db/                  # Dexie database + repositories
│   ├── store/               # Redux slices + selectors
│   ├── features/            # Feature modules (pages + modals)
│   ├── components/          # Shared UI components
│   ├── lib/                 # Utilities
│   └── styles/              # Global CSS + design tokens
├── public/                  # Static assets
└── dist/                    # Production build output
```

## Data Model

### Database Stores (Dexie/IndexedDB)
- `accounts` — Bank accounts, wallets
- `categories` — Transaction categories
- `transactions` — All financial transactions
- `budgets` — Monthly spending limits
- `plannedPayments` — Scheduled payments
- `loans` — Money lent/borrowed
- `loanRecords` — Loan payment history
- `tags` — Transaction tags
- `exchangeRates` — Currency conversion rates
- `settings` — App settings

### State Management (Redux)
All database entities are cached in Redux with async thunks for CRUD operations. Derived data (balances, stats) computed via memoized selectors.

## Design System

Based on the Android app's Material 3 theme:
- **Primary**: Ivy Purple (`#5C3DF5`)
- **Secondary**: Ivy Green (`#12B880`)
- **Error**: Ivy Red (`#F53D3D`)
- **8 color families** with 7 shades each
- **Light/Dark themes** via `data-theme` attribute

## Development

### Sample Data
Load sample data via Settings → "Load Sample Data" button. Generates:
- 3 accounts (Cash, Bank, Savings)
- 8 categories
- ~68 transactions over 3 months

### CSV Import
Import transactions from CSV with columns: `Date`, `Title`, `Type`, `Amount`, `Account`, `Category`, `Description`

### Code Splitting
Vite automatically splits into chunks:
- `vendor` — React, React Router
- `redux` — Redux Toolkit
- `charts` — Recharts
- `db` — Dexie
- `index` — App code

## Deployment

Optimized for **Vercel** or **Netlify**:

```bash
npm run build
# Deploy dist/ folder
```

PWA manifest and service worker auto-generated via `vite-plugin-pwa`.

## License

Open source — same as Ivy Wallet Android app.
