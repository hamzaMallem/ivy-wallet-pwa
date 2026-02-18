import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTransactions } from '@/store/slices/transactionsSlice';
import { fetchAccounts } from '@/store/slices/accountsSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { db } from '@/db/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { ArrowLeft, Upload, FileSpreadsheet, Check, AlertTriangle } from 'lucide-react';
import Papa from 'papaparse';

const VALID_TYPES = ['INCOME', 'EXPENSE', 'TRANSFER'];

function parseDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function validateRows(rows) {
  const valid = [];
  const skipped = [];

  for (const row of rows) {
    const type = (row.Type || row.type || '').toUpperCase();
    const amount = parseFloat(row.Amount || row.amount || '');
    const account = (row.Account || row.account || '').trim();
    const dateTime = parseDate(row.Date || row.date);
    const reason = [];

    if (!VALID_TYPES.includes(type)) reason.push(`invalid type "${type}"`);
    if (isNaN(amount) || amount <= 0) reason.push('invalid amount');
    if (!account) reason.push('missing account');
    if (!dateTime) reason.push('invalid date');

    if (reason.length > 0) {
      skipped.push({ row, reason: reason.join(', ') });
    } else {
      valid.push({ ...row, _type: type, _amount: amount, _account: account, _dateTime: dateTime });
    }
  }

  return { valid, skipped };
}

export function CsvImportPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fileRef = useRef(null);
  const accounts = useAppSelector((state) => state.accounts.items);
  const categories = useAppSelector((state) => state.categories.items);
  const baseCurrency = useAppSelector((state) => state.settings.data.baseCurrency);

  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState({ imported: 0, skipped: 0 });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { valid, skipped } = validateRows(results.data);
        setPreview({
          headers: results.meta.fields || [],
          rows: results.data,
          valid,
          skipped,
          fileName: file.name,
        });
        setStatus('preview');
      },
      error: () => {
        setStatus('error');
      },
    });
  };

  const handleImport = async () => {
    if (!preview || preview.valid.length === 0) return;
    setStatus('importing');

    try {
      const accountMap = {};
      accounts.forEach((a) => {
        accountMap[a.name.toLowerCase()] = a;
      });

      const categoryMap = {};
      categories.forEach((c) => {
        categoryMap[c.name.toLowerCase()] = c.id;
      });

      const resolveOrCreateAccount = async (name, currency) => {
        const key = name.toLowerCase();
        if (accountMap[key]) return accountMap[key].id;

        const newId = crypto.randomUUID();
        await db.accounts.add({
          id: newId,
          name,
          color: 0x74747a,
          currency: currency || baseCurrency,
          orderNum: Object.keys(accountMap).length,
          includeInBalance: true,
        });
        accountMap[key] = { id: newId };
        return newId;
      };

      const resolveOrCreateCategory = async (name) => {
        const key = name.toLowerCase();
        if (categoryMap[key]) return categoryMap[key];

        const newId = crypto.randomUUID();
        await db.categories.add({
          id: newId,
          name,
          color: 0x74747a,
          orderNum: Object.keys(categoryMap).length,
        });
        categoryMap[key] = newId;
        return newId;
      };

      const transactions = [];
      for (const row of preview.valid) {
        const currency = (row.Currency || row.currency || '').trim() || undefined;
        const accountId = await resolveOrCreateAccount(row._account, currency);

        const categoryName = (row.Category || row.category || '').trim();
        const categoryId = categoryName
          ? await resolveOrCreateCategory(categoryName)
          : undefined;

        let toAccountId;
        if (row._type === 'TRANSFER') {
          const toAccountName = (row.ToAccount || row.toAccount || '').trim();
          if (toAccountName) {
            toAccountId = await resolveOrCreateAccount(toAccountName, currency);
          }
        }

        transactions.push({
          id: crypto.randomUUID(),
          accountId,
          type: row._type,
          amount: row._amount,
          toAccountId,
          title: (row.Title || row.title || '').trim() || undefined,
          description: (row.Description || row.description || '').trim() || undefined,
          categoryId,
          dateTime: row._dateTime,
          tags: [],
        });
      }

      if (transactions.length > 0) {
        await db.transactions.bulkAdd(transactions);
      }

      setResult({ imported: transactions.length, skipped: preview.skipped.length });
      setStatus('done');
      dispatch(fetchTransactions());
      dispatch(fetchAccounts());
      dispatch(fetchCategories());
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    setPreview(null);
    setStatus('idle');
    setResult({ imported: 0, skipped: 0 });
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-8">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Import CSV</h1>
      </div>

      {status === 'idle' && (
        <>
          <EmptyState
            icon={FileSpreadsheet}
            title="Import transactions"
            description="Select a CSV file exported from Ivy Wallet, or any file with columns: Date, Title, Type (INCOME/EXPENSE/TRANSFER), Amount, Account, Category"
          >
            <Button onClick={() => fileRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Select CSV File
            </Button>
          </EmptyState>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </>
      )}

      {status === 'preview' && preview && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="truncate text-base">{preview.fileName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Validation summary */}
              <div className="flex gap-3 text-sm">
                <span className="font-medium text-green-600 dark:text-green-400">
                  ✓ {preview.valid.length} valid
                </span>
                {preview.skipped.length > 0 && (
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    ⚠ {preview.skipped.length} will be skipped
                  </span>
                )}
              </div>

              <p className="text-xs text-outline">Columns: {preview.headers.join(', ')}</p>

              {/* Preview table — first 10 rows */}
              <div className="max-h-60 overflow-auto rounded border border-surface-variant">
                <table className="w-full text-xs">
                  <thead className="bg-surface-variant">
                    <tr>
                      {preview.headers.slice(0, 5).map((h) => (
                        <th key={h} className="px-2 py-1 text-left font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-t border-surface-variant">
                        {preview.headers.slice(0, 5).map((h) => (
                          <td key={h} className="max-w-[100px] truncate px-2 py-1">
                            {row[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.rows.length > 10 && (
                  <p className="px-2 py-1 text-xs text-outline">
                    … and {preview.rows.length - 10} more rows
                  </p>
                )}
              </div>

              {/* Skipped rows detail */}
              {preview.skipped.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-amber-600 dark:text-amber-400">
                    Show skipped rows
                  </summary>
                  <ul className="mt-1 space-y-1 pl-2">
                    {preview.skipped.slice(0, 10).map((s, i) => (
                      <li key={i} className="text-outline">
                        Row {i + 1}: {s.reason}
                      </li>
                    ))}
                    {preview.skipped.length > 10 && (
                      <li className="text-outline">… and {preview.skipped.length - 10} more</li>
                    )}
                  </ul>
                </details>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={reset}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleImport}
              disabled={preview.valid.length === 0}
            >
              Import {preview.valid.length} row{preview.valid.length !== 1 ? 's' : ''}
            </Button>
          </div>

          {preview.valid.length === 0 && (
            <p className="text-center text-sm text-amber-600 dark:text-amber-400">
              No valid rows to import. Check the format and try again.
            </p>
          )}
        </div>
      )}

      {status === 'importing' && (
        <div className="py-12 text-center">
          <p className="text-lg font-medium">Importing…</p>
        </div>
      )}

      {status === 'done' && (
        <EmptyState
          icon={Check}
          title="Import complete!"
          description={
            result.skipped > 0
              ? `Imported ${result.imported} transaction${result.imported !== 1 ? 's' : ''}, skipped ${result.skipped} invalid row${result.skipped !== 1 ? 's' : ''}`
              : `Successfully imported ${result.imported} transaction${result.imported !== 1 ? 's' : ''}`
          }
        >
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset}>
              Import another file
            </Button>
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </div>
        </EmptyState>
      )}

      {status === 'error' && (
        <EmptyState
          icon={AlertTriangle}
          title="Import failed"
          description="Could not parse or save the CSV file. Please check the format and try again."
        >
          <Button variant="outline" onClick={reset}>
            Try Again
          </Button>
        </EmptyState>
      )}
    </div>
  );
}
