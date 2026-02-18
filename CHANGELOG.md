# Changelog

All notable changes to Ivy Wallet Web will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2026-02-15

### 🎉 Initial Release

Complete Progressive Web App built from ground-up, mirroring the Android Ivy Wallet functionality.

### Added

#### Core Features
- **Onboarding** — 3-step wizard for first-time setup
- **Accounts** — Multi-account support with custom icons and colors
- **Categories** — Visual category system with 24 icons and 12 colors
- **Transactions** — Full CRUD for Income, Expense, and Transfer types
- **Home Dashboard** — Balance card, period selector, grouped transactions
- **Search** — Full-text search across all transactions
- **Reports** — Pie charts for income/expense breakdown by category

#### Advanced Features
- **Budgets** — Monthly spending limits with progress tracking
- **Planned Payments** — One-time and recurring payments (daily/weekly/monthly/yearly)
- **Loans** — Track money lent/borrowed with payment records
- **Exchange Rates** — Manual currency rates with inline editing
- **CSV Import** — Import transactions from CSV files
- **CSV Export** — Export all transactions to CSV
- **Settings** — Comprehensive configuration (currency, theme, privacy, data management)

#### PWA Features
- **Offline Support** — Service worker with Workbox for offline functionality
- **Installable** — PWA manifest with proper icons
- **Code Splitting** — Optimized chunks (vendor, redux, charts, db, app)
- **Responsive Design** — Mobile-first layout that works on all screen sizes
- **Light/Dark Themes** — Theme switcher with system preference detection

#### Developer Features
- **Dev Tools** — Browser console utilities (window.IvyDev)
- **Sample Data** — One-click seed function with 68 sample transactions
- **Error Boundary** — Graceful error handling with recovery options
- **Loading States** — Professional loading screen

### Technical Stack

- **React 18.3.1** — UI framework
- **Redux Toolkit 2.3.0** — State management
- **Dexie.js 4.0.9** — IndexedDB wrapper
- **Vite 6.0.3** — Build tool
- **Tailwind CSS 3.4.16** — Styling
- **Shadcn/UI** — Component library
- **Recharts 2.13.3** — Data visualization
- **React Router 6.28.0** — Routing
- **PapaParse 5.4.1** — CSV parsing
- **date-fns 4.1.0** — Date utilities
- **Lucide React 0.460.0** — Icons

### Database Schema

10 IndexedDB stores via Dexie.js:
- accounts
- categories
- transactions
- budgets
- plannedPayments
- loans
- loanRecords
- tags
- exchangeRates
- settings

### Routes

15 routes covering all app functionality:
- `/` — Home dashboard
- `/onboarding` — First-time setup
- `/accounts` — Accounts list
- `/accounts/:id` — Account detail
- `/categories` — Categories grid
- `/transactions/new` — Add transaction
- `/transactions/:id` — Edit transaction
- `/search` — Global search
- `/reports` — Reports with charts
- `/budgets` — Budget tracking
- `/planned` — Planned payments
- `/loans` — Loans list
- `/loans/:id` — Loan detail
- `/exchange-rates` — Currency rates
- `/import` — CSV import

### Documentation

- **README.md** — Project overview and quick start
- **QUICKSTART.md** — Step-by-step usage guide
- **ARCHITECTURE.md** — Technical documentation
- **DEPLOYMENT.md** — Deployment instructions
- **TESTING.md** — Manual testing checklist
- **PROJECT_SUMMARY.md** — Complete project summary

### Performance

- Build size: ~263 KB gzipped (JS)
- Build time: ~30 seconds
- Code splitting: 5 optimized chunks
- Lighthouse scores (expected): 90+ across all metrics

### Design System

- 8 color families (56 total colors)
- Light and dark themes
- CSS custom properties for theming
- Responsive breakpoints
- Accessible components (ARIA labels, keyboard navigation)

---

## [Unreleased]

### Planned for Future Releases

#### v1.1.0 (Future)
- Cloud sync (Firebase/Supabase)
- Push notifications for planned payments
- Recurring transaction auto-creation
- Budget alerts and warnings
- Advanced reporting (trends, forecasts)

#### v1.2.0 (Future)
- End-to-end encryption
- Multi-device sync with conflict resolution
- Receipt photo attachments
- Backup to Google Drive/Dropbox
- Multi-currency transaction support

#### v2.0.0 (Future)
- TypeScript migration
- E2E tests with Playwright
- Performance monitoring
- Virtual scrolling for large lists
- API integration for exchange rates

---

## Notes

### Breaking Changes
- None (initial release)

### Migration Guide
- Not applicable (initial release)

### Known Issues
- None reported

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Dependencies
- Requires IndexedDB support
- Requires Service Worker support for offline mode
- Requires ES2021+ JavaScript support

---

**For detailed release notes and migration guides, see the documentation.**
