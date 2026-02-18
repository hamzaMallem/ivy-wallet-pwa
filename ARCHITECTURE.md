# Architecture Documentation

## Overview

Ivy Wallet Web is a **local-first Progressive Web App** built with React, Redux, and Dexie.js. All data is stored in the browser's IndexedDB — no backend required.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | React 18 | Component-based UI |
| **State Management** | Redux Toolkit | Global state + async actions |
| **Database** | Dexie.js (IndexedDB) | Client-side persistent storage |
| **Styling** | Tailwind CSS | Utility-first styling |
| **Components** | Shadcn/UI | Accessible UI primitives |
| **Charts** | Recharts | Data visualization |
| **Build Tool** | Vite | Fast dev server + bundling |
| **PWA** | vite-plugin-pwa | Service worker + manifest |
| **Router** | React Router v6 | Client-side routing |
| **CSV** | PapaParse | CSV parsing/generation |

## Architecture Layers

```
┌─────────────────────────────────────┐
│  UI Components (React)              │
│  - Feature pages                    │
│  - Shared components                │
│  - Modals                           │
└─────────────────────────────────────┘
           ↕ (dispatch/subscribe)
┌─────────────────────────────────────┐
│  Redux Store (State)                │
│  - Slices (entities)                │
│  - Selectors (derived data)         │
│  - Async thunks                     │
└─────────────────────────────────────┘
           ↕ (CRUD operations)
┌─────────────────────────────────────┐
│  Repository Layer                   │
│  - Account, Category, Transaction   │
│  - Budget, Loan, PlannedPayment     │
└─────────────────────────────────────┘
           ↕ (Dexie API)
┌─────────────────────────────────────┐
│  Dexie.js (IndexedDB wrapper)       │
│  - 10 object stores                 │
│  - Indexes for fast queries         │
└─────────────────────────────────────┘
           ↕
┌─────────────────────────────────────┐
│  Browser IndexedDB                  │
│  - Persistent local storage         │
└─────────────────────────────────────┘
```

## Data Flow

### Read Flow (Display Data)
1. Component mounts → dispatches `fetchXXX()` thunk
2. Thunk calls repository function
3. Repository queries Dexie → IndexedDB
4. Data returned → Redux state updated
5. Component re-renders with new data

### Write Flow (Create/Update/Delete)
1. User submits form → dispatches `addXXX()` / `editXXX()` thunk
2. Thunk calls repository function
3. Repository writes to Dexie → IndexedDB
4. On success → dispatch `fetchXXX()` to refresh
5. Redux state updates → components re-render

### Derived Data (Selectors)
```javascript
// Example: Calculate account balance
const selectAccountBalances = createSelector(
  [selectTransactions, selectAccounts],
  (transactions, accounts) => {
    // Compute balances from transactions
    // Memoized — only recalculates when inputs change
  }
);
```

## Database Schema (Dexie)

### Stores
```javascript
db.version(1).stores({
  accounts:       '&id, name, orderNum',
  categories:     '&id, name, orderNum',
  transactions:   '&id, accountId, type, categoryId, dateTime, *tags',
  budgets:        '&id, name',
  plannedPayments:'&id, accountId, type, startDate',
  loans:          '&id, name, type, accountId',
  loanRecords:    '&id, loanId, dateTime',
  tags:           '&id, name, orderNum',
  exchangeRates:  '[baseCurrency+currency], baseCurrency, currency',
  settings:       '&id',
});
```

**Key design decisions**:
- `&id` = Primary key (UUIDs via `crypto.randomUUID()`)
- Indexes on foreign keys (e.g., `accountId`) for fast lookups
- `*tags` = Multi-entry index (Dexie feature for arrays)
- Compound key for exchange rates: `[baseCurrency+currency]`
- Dates stored as ISO 8601 strings (not epoch millis)

## State Management (Redux)

### Store Structure
```
store/
├── index.js              # Configure store
├── hooks.js              # Typed hooks
├── slices/               # Entity slices
│   ├── accountsSlice.js
│   ├── transactionsSlice.js
│   ├── budgetsSlice.js
│   └── ...
└── selectors/            # Memoized selectors
    ├── balanceSelectors.js
    ├── statsSelectors.js
    └── ...
```

### Slice Pattern
```javascript
const xxxSlice = createSlice({
  name: 'xxx',
  initialState: { items: [], status: 'idle' },
  reducers: { /* sync actions */ },
  extraReducers: (builder) => {
    builder.addCase(fetchXxx.fulfilled, (state, action) => {
      state.items = action.payload;
    });
  },
});
```

### Async Thunks
```javascript
export const fetchXxx = createAsyncThunk(
  'xxx/fetchAll',
  () => xxxRepository.getAll()
);

export const addXxx = createAsyncThunk(
  'xxx/add',
  async (data, { dispatch }) => {
    await xxxRepository.create(data);
    dispatch(fetchXxx()); // Refresh after write
  }
);
```

## Component Architecture

### Feature-Based Structure
```
features/
├── home/
│   └── HomePage.jsx
├── accounts/
│   ├── AccountsPage.jsx
│   ├── AccountDetailPage.jsx
│   └── AccountModal.jsx
├── transactions/
│   └── EditTransactionPage.jsx
└── ...
```

**Benefits**:
- Related code co-located
- Easy to find components
- Mirrors Android app structure

### Component Patterns

**Page Component**:
```javascript
export function XxxPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectXxx);

  useEffect(() => {
    dispatch(fetchXxx());
  }, [dispatch]);

  return <div>...</div>;
}
```

**Modal Component**:
```javascript
export function XxxModal({ open, item }) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({...});

  const handleSave = () => {
    dispatch(isEdit ? editXxx(...) : addXxx(...));
    dispatch(closeModal());
  };

  return <Dialog open={open}>...</Dialog>;
}
```

## Routing Strategy

### Route Types
1. **Layout routes** — Bottom nav pages (/, /accounts, /reports, /settings)
2. **Detail routes** — Full-screen pages (/accounts/:id, /loans/:id)
3. **Form routes** — Transaction editor (/transactions/new, /transactions/:id)
4. **Utility routes** — Search, import, onboarding

### Navigation Guard
```javascript
if (!settings.onboardingCompleted) {
  return <Routes>
    <Route path="/onboarding" element={<OnboardingPage />} />
    <Route path="*" element={<Navigate to="/onboarding" replace />} />
  </Routes>;
}
```

## Design System

### Color Tokens (CSS Custom Properties)
```css
:root {
  --ivy-purple: #5C3DF5;
  --ivy-green: #12B880;
  --ivy-red: #F53D3D;
  /* 8 color families × 7 shades = 56 colors */
}

[data-theme="light"] {
  --primary: var(--ivy-purple);
  --background: var(--ivy-white);
  /* ... */
}

[data-theme="dark"] {
  --primary: var(--ivy-purple);
  --background: var(--ivy-black);
  /* ... */
}
```

### Tailwind Integration
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: 'var(--primary)',
      background: 'var(--background)',
      // Access Ivy colors: bg-ivy-purple, text-ivy-green
    }
  }
}
```

## PWA Features

### Service Worker (Workbox)
- **Precaching**: All static assets cached on install
- **Runtime caching**: API responses, images
- **Auto-update**: New versions activate on next visit

### Offline Strategy
1. App shell cached → works offline
2. IndexedDB persists data → full functionality offline
3. No network requests needed (local-only app)

### Install Prompt
```javascript
// Automatically handled by browser
// Shows "Add to Home Screen" when criteria met:
// - HTTPS (or localhost)
// - Valid manifest.json
// - Service worker registered
// - User engagement threshold
```

## Performance Optimizations

### Code Splitting
```javascript
// vite.config.js
manualChunks: {
  vendor: ['react', 'react-dom', 'react-router-dom'],
  redux: ['@reduxjs/toolkit', 'react-redux'],
  charts: ['recharts'],
  db: ['dexie'],
}
```

**Result**: Charts loaded only when needed (lazy load).

### Memoization
- Redux selectors use `createSelector` (Reselect)
- React components use `useMemo` for expensive computations
- Prevents unnecessary re-renders

### Indexes
Dexie indexes speed up queries:
```javascript
transactions: '&id, accountId, type, categoryId, dateTime'
```
Query by `accountId` → uses index → fast lookup.

## Testing Strategy

### Unit Tests (Vitest)
```bash
npm test
```

Test files:
- `xxx.test.js` — Component tests
- `xxxSlice.test.js` — Redux tests
- `xxxRepository.test.js` — DB tests

### E2E Tests (Future)
- Playwright or Cypress
- Test full user flows

## Security Considerations

### No Backend = No Server Attacks
- No SQL injection (client-side only)
- No CSRF (no server sessions)
- No XSS from API (no external data)

### Data Privacy
- All data local to user's browser
- No analytics/tracking by default
- Export/delete data anytime

### Risks
- Browser storage can be cleared
- No encryption at rest (IndexedDB plaintext)
- No multi-device sync (local-only)

## Future Enhancements

### Planned Features
- [ ] Cloud sync (Firebase/Supabase)
- [ ] Encryption for sensitive data
- [ ] Recurring transaction auto-creation
- [ ] Budget alerts/notifications
- [ ] Advanced reporting (trends, forecasts)
- [ ] Multi-currency transaction support
- [ ] Receipt photo attachments
- [ ] Backup to Google Drive / Dropbox

### Architecture Changes Needed
- Backend API for sync
- Authentication layer
- Conflict resolution for offline edits
- E2E encryption

## Contributing

See main repo for contribution guidelines.

## References

- [Dexie.js Docs](https://dexie.org/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Recharts Docs](https://recharts.org/)
