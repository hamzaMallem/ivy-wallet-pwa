import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLoans, removeLoan } from '@/store/slices/loansSlice';
import { fetchLoanRecords } from '@/store/slices/loanRecordsSlice';
import { openModal } from '@/store/slices/uiSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { ArrowLeft, Edit, Trash2, Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';

export function LoanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loan = useAppSelector((state) =>
    state.loans.items.find((l) => l.id === id)
  );
  const allRecords = useAppSelector((state) => state.loanRecords.items);
  const settings = useAppSelector((state) => state.settings.data);

  const records = useMemo(
    () =>
      allRecords
        .filter((r) => r.loanId === id)
        .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)),
    [allRecords, id]
  );

  const totalPaid = useMemo(
    () =>
      records
        .filter((r) => r.loanRecordType !== 'INCREASE')
        .reduce((s, r) => s + r.amount, 0),
    [records]
  );

  useEffect(() => {
    dispatch(fetchLoans());
    dispatch(fetchLoanRecords());
  }, [dispatch]);

  if (!loan) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <p className="mt-4 text-center text-outline">Loan not found</p>
      </div>
    );
  }

  const remaining = loan.amount - totalPaid;
  const progressPct = Math.min(
    loan.amount > 0 ? (totalPaid / loan.amount) * 100 : 0,
    100
  );
  const colorHex = `#${(loan.color || 0x5c3df5).toString(16).padStart(6, '0')}`;

  const handleDelete = () => {
    if (window.confirm(`Delete loan "${loan.name}"?`)) {
      dispatch(removeLoan(id));
      navigate('/loans');
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-8">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="flex-1 text-lg font-bold">{loan.name}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(openModal({ modal: 'editLoan', data: loan }))}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 text-error" />
        </Button>
      </div>

      {/* Summary */}
      <Card className="mb-4" style={{ borderColor: colorHex }}>
        <CardContent className="pt-4">
          <div className="mb-3 flex items-center justify-between">
            <Badge variant="secondary">
              {loan.type === 'LEND' ? 'You lent' : 'You borrowed'}
            </Badge>
            <p className="text-2xl font-bold">
              {loan.amount.toFixed(2)} {settings.baseCurrency}
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-variant">
            <div
              className="h-full rounded-full"
              style={{ width: `${progressPct}%`, backgroundColor: colorHex }}
            />
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-ivy-green">{totalPaid.toFixed(2)} paid</span>
            <span className="text-outline">{remaining.toFixed(2)} remaining</span>
          </div>
          {loan.note && (
            <p className="mt-2 text-sm text-outline">{loan.note}</p>
          )}
        </CardContent>
      </Card>

      {/* Add record button */}
      <Button
        className="mb-4 w-full"
        onClick={() =>
          dispatch(openModal({ modal: 'createLoanRecord', data: { loanId: id } }))
        }
      >
        <Plus className="mr-2 h-4 w-4" /> Add Payment Record
      </Button>

      {/* Records */}
      <h2 className="mb-2 text-sm font-medium text-outline">Payment Records</h2>
      {records.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No records"
          description="Add payment records to track progress"
        />
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <Card
              key={record.id}
              className="cursor-pointer hover:shadow-md"
              onClick={() =>
                dispatch(openModal({ modal: 'editLoanRecord', data: record }))
              }
            >
              <CardContent className="flex items-center justify-between pt-3 pb-3">
                <div>
                  <p className="text-sm font-medium">
                    {record.loanRecordType === 'INCREASE' ? 'Increase' : 'Payment'}
                  </p>
                  <p className="text-xs text-outline">
                    {record.dateTime
                      ? format(new Date(record.dateTime), 'MMM d, yyyy')
                      : ''}
                  </p>
                  {record.note && (
                    <p className="text-xs text-outline">{record.note}</p>
                  )}
                </div>
                <p
                  className={`font-semibold ${
                    record.loanRecordType === 'INCREASE'
                      ? 'text-ivy-red'
                      : 'text-ivy-green'
                  }`}
                >
                  {record.loanRecordType === 'INCREASE' ? '+' : '-'}
                  {record.amount.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
