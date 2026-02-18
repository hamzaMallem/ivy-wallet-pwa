import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLoans } from '@/store/slices/loansSlice';
import { fetchLoanRecords } from '@/store/slices/loanRecordsSlice';
import { selectLoansWithProgress } from '@/store/selectors/loanSelectors';
import { openModal } from '@/store/slices/uiSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { AmountDisplay } from '@/components/AmountDisplay';
import { Plus, Landmark, ArrowLeft } from 'lucide-react';

export function LoansPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loans = useAppSelector(selectLoansWithProgress);
  const settings = useAppSelector((state) => state.settings.data);

  useEffect(() => {
    dispatch(fetchLoans());
    dispatch(fetchLoanRecords());
  }, [dispatch]);

  const pending = loans.filter((l) => l.progress < 1);
  const completed = loans.filter((l) => l.progress >= 1);

  const renderLoan = (loan) => {
    const progressPct = Math.min(loan.progress * 100, 100);
    const colorHex = `#${(loan.color || 0x5c3df5).toString(16).padStart(6, '0')}`;

    return (
      <Card
        key={loan.id}
        className="cursor-pointer hover:shadow-md"
        onClick={() => navigate(`/loans/${loan.id}`)}
      >
        <CardContent className="pt-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="font-medium">{loan.name}</p>
              <Badge
                variant={loan.type === 'LEND' ? 'income' : 'expense'}
                className="mt-1"
              >
                {loan.type === 'LEND' ? 'Lent' : 'Borrowed'}
              </Badge>
            </div>
            <div className="text-right">
              <AmountDisplay
                amount={loan.amount}
                currency={settings.baseCurrency}
                type={loan.type === 'LEND' ? 'INCOME' : 'EXPENSE'}
                className="text-base"
              />
              <p className="text-xs text-outline">
                {loan.remaining.toFixed(2)} remaining
              </p>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-variant">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progressPct}%`, backgroundColor: colorHex }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-outline">
            {progressPct.toFixed(0)}% · {loan.recordCount} records
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-8 md:max-w-2xl lg:max-w-4xl">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="flex-1 text-xl font-bold">Loans</h1>
        <Button
          size="sm"
          onClick={() => dispatch(openModal({ modal: 'createLoan' }))}
        >
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      {loans.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No loans"
          description="Track money you lend or borrow"
        />
      ) : (
        <Tabs defaultValue="pending">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="pending" className="flex-1">
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              Completed ({completed.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            {pending.length === 0 ? (
              <p className="py-8 text-center text-sm text-outline">No pending loans</p>
            ) : (
              <div className="space-y-3">{pending.map(renderLoan)}</div>
            )}
          </TabsContent>
          <TabsContent value="completed">
            {completed.length === 0 ? (
              <p className="py-8 text-center text-sm text-outline">No completed loans</p>
            ) : (
              <div className="space-y-3">{completed.map(renderLoan)}</div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
