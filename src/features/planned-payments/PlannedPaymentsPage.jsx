import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPlannedPayments } from '@/store/slices/plannedPaymentsSlice';
import { fetchAccounts } from '@/store/slices/accountsSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { openModal } from '@/store/slices/uiSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { AmountDisplay } from '@/components/AmountDisplay';
import { Plus, CalendarClock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export function PlannedPaymentsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const payments = useAppSelector((state) => state.plannedPayments.items);
  const accounts = useAppSelector((state) => state.accounts.items);
  const categories = useAppSelector((state) => state.categories.items);
  const settings = useAppSelector((state) => state.settings.data);

  useEffect(() => {
    dispatch(fetchPlannedPayments());
    dispatch(fetchAccounts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const oneTime = payments.filter((p) => p.oneTime);
  const recurring = payments.filter((p) => !p.oneTime);

  const renderPayment = (payment) => {
    const account = accounts.find((a) => a.id === payment.accountId);
    const category = categories.find((c) => c.id === payment.categoryId);
    const badgeVariant = payment.type === 'INCOME' ? 'income' : 'expense';

    return (
      <Card
        key={payment.id}
        className="cursor-pointer hover:shadow-md"
        onClick={() =>
          dispatch(openModal({ modal: 'editPlannedPayment', data: payment }))
        }
      >
        <CardContent className="flex items-center justify-between pt-4">
          <div>
            <p className="font-medium">{payment.title || category?.name || 'Untitled'}</p>
            <div className="flex items-center gap-2 text-xs text-outline">
              <span>{account?.name}</span>
              {payment.startDate && (
                <span>{format(new Date(payment.startDate), 'MMM d, yyyy')}</span>
              )}
              {!payment.oneTime && payment.intervalType && (
                <span>
                  Every {payment.intervalN || 1} {payment.intervalType.toLowerCase()}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <AmountDisplay
              amount={payment.amount}
              currency={settings.baseCurrency}
              type={payment.type}
            />
            <Badge variant={badgeVariant}>{payment.type}</Badge>
          </div>
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
        <h1 className="flex-1 text-xl font-bold">Planned Payments</h1>
        <Button
          size="sm"
          onClick={() => dispatch(openModal({ modal: 'createPlannedPayment' }))}
        >
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No planned payments"
          description="Schedule recurring or one-time future payments"
        />
      ) : (
        <div className="space-y-6">
          {oneTime.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-outline">
                One-time ({oneTime.length})
              </h2>
              <div className="space-y-3">{oneTime.map(renderPayment)}</div>
            </div>
          )}
          {recurring.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-outline">
                Recurring ({recurring.length})
              </h2>
              <div className="space-y-3">{recurring.map(renderPayment)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
