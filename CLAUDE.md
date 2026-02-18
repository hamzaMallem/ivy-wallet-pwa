# Ivy Wallet PWA — Claude Code Instructions

## Project Identity
A local-first personal finance PWA replicating the Ivy Wallet Android app.
No backend. No auth. IndexedDB only (Dexie.js). Targeting full Android feature parity, then Vercel deployment.

## Absolute Constraints
- **No TypeScript** — pure JavaScript (.js / .jsx) only
- **No new npm packages** without explicit user approval
- **No backend** — all data lives in IndexedDB via Dexie
- **No new features beyond Android parity** unless explicitly requested
- **No breaking existing patterns** — match conventions in surrounding code

## Stack
| Layer | Technology |
|---|---|
| UI | React 18 + Shadcn/UI components |
| Styling | Tailwind CSS v3.4 + Ivy CSS custom properties |
| State | Redux Toolkit (RTK) + async thunks |
| DB | Dexie.js v4 (IndexedDB) |
| Routing | React Router v6 |
| Build | Vite v6 + vite-plugin-pwa |
| Charts | Recharts |
| Icons | Lucide React |

## Path Alias
`@/` → `web/src/`

## Architecture Layers (never mix concerns)
```
UI Layer         → features/**/*.jsx, components/*.jsx
State Layer      → store/slices/*.js, store/selectors/*.js
DB Layer         → db/repositories/*.js
Service Layer    → services/*.js, lib/recurringUtils.js
```

## Coding Standards

### Redux Pattern
```js
// Slice thunk (standard pattern)
export const fetchFoo = createAsyncThunk('foo/fetchAll', () => fooRepo.getAll());
export const addFoo   = createAsyncThunk('foo/add', async (data, { dispatch }) => {
  await fooRepo.create(data);
  dispatch(fetchFoo());
});
```

### Selector Pattern
```js
export const selectDerivedValue = createSelector(
  [selectBaseSlice, selectOtherSlice],
  (base, other) => /* compute */
);
```

### Repository Pattern
```js
// db/repositories/fooRepository.js
export const getAll    = () => db.foo.orderBy('orderNum').toArray();
export const create    = (obj) => db.foo.add({ id: crypto.randomUUID(), ...obj });
export const update    = (id, changes) => db.foo.update(id, changes);
export const remove    = (id) => db.foo.delete(id);
```

### Component Pattern
```jsx
// Named export, no default export (except App.jsx / main.jsx)
export function FooPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.foo.items);
  useEffect(() => { dispatch(fetchFoo()); }, [dispatch]);
  return <div className="mx-auto max-w-lg px-4 pt-6 pb-8"> ... </div>;
}
```

## Styling Rules
- Use semantic tokens: `text-primary`, `bg-surface`, `text-outline`, `text-error`
- Use Ivy palette tokens: `text-ivy-green`, `bg-ivy-red-extra-light`
- **Never use Tailwind `/opacity` on CSS-variable colors** — use `color-mix()` utilities:
  - `.bg-primary-subtle` (10% primary)
  - `.bg-error-subtle` (5% error)
  - `.border-error-subtle` (30% error border)
- Responsive breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px)
- Page wrapper standard: `mx-auto max-w-lg px-4 pt-6 pb-8` (mobile)
- Desktop-aware wrapper: `mx-auto max-w-2xl px-4 pt-6 pb-8 md:max-w-4xl`

## DB Schema (Dexie v2)
```
accounts         &id, name, orderNum
categories       &id, name, orderNum
transactions     &id, accountId, type, categoryId, dateTime, plannedPaymentId, *tags
budgets          &id, name
plannedPayments  &id, accountId, type, startDate
loans            &id, name, type, accountId
loanRecords      &id, loanId, dateTime
tags             &id, name, orderNum
exchangeRates    [baseCurrency+currency], baseCurrency, currency
settings         &id
recurringHistory &id, plannedPaymentId, scheduledDate, createdDate
```

## File Naming Conventions
- Pages: `FooPage.jsx`
- Modals: `FooModal.jsx`
- Slices: `fooSlice.js`
- Selectors: `fooSelectors.js`
- Repositories: `fooRepository.js`

## What NOT To Do
- Don't add `console.log` to production paths (debug only)
- Don't use `any` or non-semantic color values (use tokens)
- Don't create new Dexie versions without a migration `.upgrade()` function
- Don't dispatch fetchAll in render — only in `useEffect`
- Don't use `window.confirm` — use a proper confirmation modal
- Don't hardcode currency strings — always read from `settings.baseCurrency`

## Recurring Engine Status
- **RELIABLE** — do not refactor without cause
- Idempotency: `recurringHistory` table prevents duplicate transactions
- Catchup: `getOccurrencesBetween` handles missed days on restart
- Schedule: runs on app startup + every 6 hours while app is open

## Dev Tools
Open browser console → `IvyDev.dbStats()`, `IvyDev.dbDump()`, `IvyDev.exportJson()`, `IvyDev.getState()`

## Reference Files
- Parity checklist: `.claude/parity-checklist.md`
- Agent responsibilities: `.claude/main-agent.md`, `.claude/sub-agents.md`
- Coding skills & patterns: `.claude/skills.md`
