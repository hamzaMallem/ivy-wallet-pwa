# Testing Guide

## Manual Testing Checklist

### Initial Setup
- [ ] Open app in browser (localhost:5173)
- [ ] Onboarding screen appears on first launch
- [ ] Can select currency
- [ ] Can add accounts
- [ ] Can add categories
- [ ] Finish onboarding → redirects to home

### Home Screen
- [ ] Balance card displays "0.00 USD"
- [ ] Period selector shows current month
- [ ] Income/Expense cards show "0.00"
- [ ] Empty state: "No transactions"
- [ ] Bottom nav visible with 4 tabs + center button
- [ ] Search button in header

### Add Transaction
- [ ] Click + button → opens transaction form
- [ ] Can switch type: INCOME / EXPENSE / TRANSFER
- [ ] Amount input accepts decimal numbers
- [ ] Account dropdown shows created accounts
- [ ] Category dropdown shows created categories
- [ ] Date/time picker works
- [ ] Save → returns to home
- [ ] Transaction appears in list

### Transaction List
- [ ] Transactions grouped by date (Today, Yesterday, etc.)
- [ ] Correct icon from category shown
- [ ] Amount displays with correct color (green/red)
- [ ] Click transaction → opens edit form
- [ ] Can edit all fields
- [ ] Delete button works
- [ ] Changes reflect immediately

### Accounts Tab
- [ ] All accounts listed with balances
- [ ] Click account → opens detail page
- [ ] Detail shows filtered transactions
- [ ] Balance calculated correctly
- [ ] Edit/Delete buttons work
- [ ] Create new account modal works
- [ ] Color picker functional
- [ ] Icon picker functional

### Categories Tab
- [ ] Categories displayed in grid
- [ ] Icons and colors shown
- [ ] Click category → opens edit modal
- [ ] Create new category works
- [ ] Changes save correctly

### Reports Tab
- [ ] Period selector works
- [ ] Income/Expense summary cards
- [ ] Net income calculated
- [ ] Pie chart renders for expenses
- [ ] Pie chart renders for income
- [ ] Tab switching works
- [ ] Category breakdown list accurate
- [ ] Percentages add up to 100%

### Settings
- [ ] All setting categories present
- [ ] Currency change works
- [ ] Name input saves
- [ ] Theme toggle works (light/dark)
- [ ] Privacy toggles work
- [ ] Feature links navigate correctly

### Budgets
- [ ] Navigate from Settings → Budgets
- [ ] Create budget modal works
- [ ] Can set monthly limit
- [ ] Category selection (multi-select)
- [ ] Progress bar shows correctly
- [ ] Spent amount accurate
- [ ] Remaining shows green/red
- [ ] Edit/Delete work

### Planned Payments
- [ ] Navigate from Settings → Planned Payments
- [ ] Create one-time payment
- [ ] Create recurring payment
- [ ] Interval types work (daily/weekly/monthly/yearly)
- [ ] Displays in correct section
- [ ] Edit/Delete work

### Loans
- [ ] Navigate from Settings → Loans
- [ ] Create loan (LEND / BORROW)
- [ ] Click loan → detail page
- [ ] Add payment record
- [ ] Progress bar updates
- [ ] Remaining amount accurate
- [ ] Edit/Delete work

### Exchange Rates
- [ ] Navigate from Settings → Exchange Rates
- [ ] Shows base currency
- [ ] Can add new rate
- [ ] Inline edit works
- [ ] Manual override badge shows

### Search
- [ ] Click search icon in home header
- [ ] Type query (min 2 chars)
- [ ] Results filter in real-time
- [ ] Click result → opens transaction
- [ ] Clear search works
- [ ] Back button returns to home

### CSV Export
- [ ] Settings → Export to CSV
- [ ] File downloads
- [ ] Open CSV → data correct
- [ ] Columns: Date, Title, Type, Amount, etc.

### CSV Import
- [ ] Settings → Import from CSV
- [ ] Upload valid CSV file
- [ ] Preview table shows data
- [ ] Import creates transactions
- [ ] Auto-creates missing accounts/categories
- [ ] Success message shows
- [ ] Navigate to home → data visible

### Sample Data
- [ ] Settings → Load Sample Data
- [ ] Page refreshes
- [ ] 3 accounts created
- [ ] 8 categories created
- [ ] ~68 transactions created
- [ ] Balance updates
- [ ] Reports show data

### Delete All Data
- [ ] Settings → Delete All Data
- [ ] Confirmation dialog appears
- [ ] Confirm → data cleared
- [ ] Redirects to onboarding

## Theme Testing

### Light Mode
- [ ] Background is white (#FAFAFC)
- [ ] Text is dark
- [ ] Cards have light borders
- [ ] All colors visible

### Dark Mode
- [ ] Background is black (#09090A)
- [ ] Text is white
- [ ] Cards have dark borders
- [ ] All colors visible
- [ ] Contrast sufficient

## Responsive Testing

### Desktop (1920x1080)
- [ ] Max-width container (max-w-lg)
- [ ] Bottom nav centered
- [ ] All pages layout correctly

### Tablet (768x1024)
- [ ] Layout adapts
- [ ] Touch targets large enough
- [ ] Bottom nav works

### Mobile (375x667)
- [ ] Full-width layout
- [ ] Bottom nav spans screen
- [ ] All interactive elements accessible
- [ ] No horizontal scroll

## PWA Testing

### Installation
- [ ] Browser shows install prompt
- [ ] Click install → app installs
- [ ] App opens in standalone mode
- [ ] Icon appears on home screen/desktop

### Offline Mode
- [ ] Install app
- [ ] Turn off network
- [ ] App still loads
- [ ] Can view existing data
- [ ] Can create transactions
- [ ] Turn on network → data persists

### Service Worker
- [ ] Open DevTools → Application → Service Workers
- [ ] Service worker registered
- [ ] Status: "activated and is running"
- [ ] Update on reload enabled

## Performance Testing

### Lighthouse Audit
```bash
npm run build
npm run preview
# Chrome DevTools → Lighthouse → Run audit
```

Target scores:
- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] Best Practices: 95+
- [ ] SEO: 90+
- [ ] PWA: 100

### Load Times
- [ ] Initial load < 2s (fast 3G)
- [ ] Time to interactive < 3s
- [ ] No layout shift
- [ ] Smooth animations

## Data Integrity Testing

### Balance Calculation
- [ ] Add income → balance increases
- [ ] Add expense → balance decreases
- [ ] Add transfer → both accounts update
- [ ] Delete transaction → recalculates
- [ ] Multi-account balances accurate

### Date Filtering
- [ ] Change month → transactions filter
- [ ] Only current month shown
- [ ] Navigate months → updates correctly
- [ ] Reports filter by period

### Category Filtering
- [ ] Account detail → only account txs
- [ ] Budget → only category txs
- [ ] Reports → correct categorization

## Edge Cases

### Empty States
- [ ] No accounts → appropriate message
- [ ] No categories → appropriate message
- [ ] No transactions → empty state component
- [ ] No budgets → empty state
- [ ] Search no results → message

### Invalid Input
- [ ] Negative amount → validation
- [ ] Empty required fields → disabled save
- [ ] Invalid date → fallback to today
- [ ] Delete with dependencies → confirmation

### Large Data Sets
- [ ] 1000+ transactions → smooth scroll
- [ ] Reports render correctly
- [ ] Search still fast
- [ ] No memory leaks

## Browser Compatibility

- [ ] Chrome 90+ (desktop/mobile)
- [ ] Firefox 88+ (desktop/mobile)
- [ ] Safari 14+ (desktop/mobile)
- [ ] Edge 90+

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals
- [ ] Focus visible

### Screen Reader
- [ ] Labels on inputs
- [ ] Button purposes clear
- [ ] Error messages announced
- [ ] Landmark regions

### Color Contrast
- [ ] Text readable in both themes
- [ ] WCAG AA compliance
- [ ] Interactive elements distinguishable

## Bug Reports

Document bugs found:
```
**Bug**: [Short description]
**Steps**:
1. Step one
2. Step two
**Expected**: [What should happen]
**Actual**: [What actually happens]
**Browser**: [Chrome 120, Firefox 121, etc.]
**Screenshot**: [If applicable]
```

## Automated Testing (Future)

### Unit Tests
```bash
npm test
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

Test scenarios:
- Complete user flow (onboarding → add transaction → view reports)
- CRUD operations for all entities
- Navigation between screens
- Modal interactions
