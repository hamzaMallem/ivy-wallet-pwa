import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSettings, updateSettings } from '@/store/slices/settingsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Moon, Sun, Download, Upload, Trash2, Database,
  Target, CalendarClock, Landmark, DollarSign, FileSpreadsheet,
} from 'lucide-react';
import { seedDatabase, clearDatabase } from '@/db/seed';
import { db } from '@/db/database';
import Papa from 'papaparse';

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const settings = useAppSelector((state) => state.settings.data);
  const [exportStatus, setExportStatus] = useState('');

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    dispatch(updateSettings({ theme: newTheme }));
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleExportCsv = async () => {
    try {
      setExportStatus('Exporting...');
      const transactions = await db.transactions.toArray();
      const accounts = await db.accounts.toArray();
      const categories = await db.categories.toArray();

      const rows = transactions.map((tx) => {
        const account = accounts.find((a) => a.id === tx.accountId);
        const toAccount = accounts.find((a) => a.id === tx.toAccountId);
        const category = categories.find((c) => c.id === tx.categoryId);
        return {
          Date: tx.dateTime || '',
          Title: tx.title || '',
          Type: tx.type,
          Amount: tx.amount,
          Currency: account?.currency || settings.baseCurrency,
          Account: account?.name || '',
          ToAccount: toAccount?.name || '',
          Category: category?.name || '',
          Description: tx.description || '',
        };
      });

      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ivy-wallet-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus('Exported!');
      setTimeout(() => setExportStatus(''), 2000);
    } catch {
      setExportStatus('Export failed');
    }
  };

  const handleDeleteAllData = async () => {
    if (
      window.confirm(
        'Delete ALL data? This will remove all accounts, categories, transactions, and settings. This cannot be undone.'
      )
    ) {
      await clearDatabase();
      dispatch(fetchSettings());
      navigate('/onboarding');
    }
  };

  const handleSeedData = async () => {
    const seeded = await seedDatabase();
    if (seeded) {
      window.location.reload();
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <h1 className="mb-4 text-xl font-bold">Settings</h1>

      <div className="space-y-4">
        {/* Currency */}
        <Card>
          <CardHeader>
            <CardTitle>Base Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={settings.baseCurrency}
              onChange={(e) =>
                dispatch(
                  updateSettings({ baseCurrency: e.target.value.toUpperCase() })
                )
              }
              maxLength={3}
              placeholder="MAD"
            />
          </CardContent>
        </Card>

        {/* Name */}
        <Card>
          <CardHeader>
            <CardTitle>Your Name</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={settings.name}
              onChange={(e) =>
                dispatch(updateSettings({ name: e.target.value }))
              }
              placeholder="Enter your name"
            />
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={toggleTheme} className="w-full">
              {settings.theme === 'dark' ? (
                <>
                  <Sun className="mr-2 h-4 w-4" /> Switch to Light Mode
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" /> Switch to Dark Mode
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Start Day of Month */}
        <Card>
          <CardHeader>
            <CardTitle>Start Day of Month</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              min="1"
              max="28"
              value={settings.startDayOfMonth}
              onChange={(e) =>
                dispatch(
                  updateSettings({
                    startDayOfMonth: parseInt(e.target.value) || 1,
                  })
                )
              }
            />
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm">Hide current balance</span>
              <input
                type="checkbox"
                checked={settings.hideCurrentBalance}
                onChange={(e) =>
                  dispatch(
                    updateSettings({ hideCurrentBalance: e.target.checked })
                  )
                }
                className="h-4 w-4 rounded accent-primary"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Hide income</span>
              <input
                type="checkbox"
                checked={settings.hideIncome}
                onChange={(e) =>
                  dispatch(updateSettings({ hideIncome: e.target.checked }))
                }
                className="h-4 w-4 rounded accent-primary"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">
                Treat transfers as income/expense
              </span>
              <input
                type="checkbox"
                checked={settings.treatTransfersAsIncomeExpense}
                onChange={(e) =>
                  dispatch(
                    updateSettings({
                      treatTransfersAsIncomeExpense: e.target.checked,
                    })
                  )
                }
                className="h-4 w-4 rounded accent-primary"
              />
            </label>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/budgets')}
            >
              <Target className="mr-2 h-4 w-4" /> Budgets
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/planned')}
            >
              <CalendarClock className="mr-2 h-4 w-4" /> Planned Payments
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/loans')}
            >
              <Landmark className="mr-2 h-4 w-4" /> Loans
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/exchange-rates')}
            >
              <DollarSign className="mr-2 h-4 w-4" /> Exchange Rates
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/categories')}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Categories
            </Button>
          </CardContent>
        </Card>

        {/* Data */}
        <Card>
          <CardHeader>
            <CardTitle>Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleExportCsv}
            >
              <Download className="mr-2 h-4 w-4" />
              {exportStatus || 'Export to CSV'}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/import')}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import from CSV
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSeedData}
            >
              <Database className="mr-2 h-4 w-4" />
              Load Sample Data
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDeleteAllData}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All Data
            </Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-outline">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Storage</span>
              <span className="font-medium">IndexedDB (Local)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Build</span>
              <span className="font-medium">PWA</span>
            </div>
            <p className="pt-2 text-xs text-outline">
              Ivy Wallet is a local-first money manager. All your data stays on your
              device. No cloud sync, no tracking.
            </p>
            <p className="text-xs text-outline">
              Built with React, Redux, and Dexie.js.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
