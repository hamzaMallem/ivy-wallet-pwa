import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSettings } from '@/store/slices/settingsSlice';
import { processRecurring } from '@/store/slices/recurringSlice';
import { Layout } from '@/components/Layout';
import { ModalManager } from '@/components/ModalManager';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { HomePage } from '@/features/home/HomePage';
import { AccountsPage } from '@/features/accounts/AccountsPage';
import { AccountDetailPage } from '@/features/accounts/AccountDetailPage';
import { CategoriesPage } from '@/features/categories/CategoriesPage';
import { EditTransactionPage } from '@/features/transactions/EditTransactionPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { SearchPage } from '@/features/search/SearchPage';
import { BudgetsPage } from '@/features/budgets/BudgetsPage';
import { PlannedPaymentsPage } from '@/features/planned-payments/PlannedPaymentsPage';
import { LoansPage } from '@/features/loans/LoansPage';
import { LoanDetailPage } from '@/features/loans/LoanDetailPage';
import { ExchangeRatesPage } from '@/features/exchange-rates/ExchangeRatesPage';
import { CsvImportPage } from '@/features/import-export/CsvImportPage';

function AppRoutes() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings.data);
  const settingsStatus = useAppSelector((state) => state.settings.status);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
  }, [settings.theme]);

  // Process recurring transactions on startup and periodically
  useEffect(() => {
    if (settingsStatus === 'succeeded' && settings.onboardingCompleted) {
      // Process immediately on startup
      dispatch(processRecurring());

      // Set up periodic check every 6 hours (21600000 ms)
      const interval = setInterval(() => {
        dispatch(processRecurring());
      }, 21600000);

      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }
  }, [dispatch, settingsStatus, settings.onboardingCompleted]);

  if (settingsStatus === 'idle' || settingsStatus === 'loading') {
    return <LoadingScreen />;
  }

  if (!settings.onboardingCompleted) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="/accounts/:id" element={<AccountDetailPage />} />
        <Route path="/transactions/new" element={<EditTransactionPage />} />
        <Route path="/transactions/:id" element={<EditTransactionPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/planned" element={<PlannedPaymentsPage />} />
        <Route path="/loans" element={<LoansPage />} />
        <Route path="/loans/:id" element={<LoanDetailPage />} />
        <Route path="/exchange-rates" element={<ExchangeRatesPage />} />
        <Route path="/import" element={<CsvImportPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ModalManager />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
