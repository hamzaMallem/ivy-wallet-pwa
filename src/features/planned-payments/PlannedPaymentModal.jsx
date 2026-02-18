import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addPlannedPayment,
  editPlannedPayment,
  removePlannedPayment,
} from '@/store/slices/plannedPaymentsSlice';
import { closeModal } from '@/store/slices/uiSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';

const INTERVAL_TYPES = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];

export function PlannedPaymentModal({ open, payment }) {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((state) => state.accounts.items);
  const categories = useAppSelector((state) => state.categories.items);
  const isEdit = !!payment;

  const [form, setForm] = useState({
    type: 'EXPENSE',
    title: '',
    amount: '',
    accountId: '',
    categoryId: '',
    oneTime: false,
    intervalN: '1',
    intervalType: 'MONTHLY',
    startDate: new Date().toISOString().slice(0, 10),
    description: '',
    autoCreateEnabled: true,
  });

  useEffect(() => {
    if (payment) {
      setForm({
        type: payment.type || 'EXPENSE',
        title: payment.title || '',
        amount: String(payment.amount || ''),
        accountId: payment.accountId || '',
        categoryId: payment.categoryId || '',
        oneTime: payment.oneTime || false,
        intervalN: String(payment.intervalN || '1'),
        intervalType: payment.intervalType || 'MONTHLY',
        startDate: payment.startDate
          ? payment.startDate.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        description: payment.description || '',
        autoCreateEnabled: payment.autoCreateEnabled !== false,
      });
    } else {
      setForm({
        type: 'EXPENSE',
        title: '',
        amount: '',
        accountId: accounts[0]?.id || '',
        categoryId: '',
        oneTime: false,
        intervalN: '1',
        intervalType: 'MONTHLY',
        startDate: new Date().toISOString().slice(0, 10),
        description: '',
        autoCreateEnabled: true,
      });
    }
  }, [payment, accounts]);

  const handleSave = () => {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0 || !form.accountId) return;

    const data = {
      type: form.type,
      title: form.title || undefined,
      amount,
      accountId: form.accountId,
      categoryId: form.categoryId || undefined,
      oneTime: form.oneTime,
      intervalN: form.oneTime ? null : parseInt(form.intervalN) || 1,
      intervalType: form.oneTime ? null : form.intervalType,
      startDate: new Date(form.startDate).toISOString(),
      description: form.description || undefined,
      autoCreateEnabled: form.oneTime ? false : form.autoCreateEnabled,
    };

    if (isEdit) {
      dispatch(editPlannedPayment({ id: payment.id, changes: data }));
    } else {
      dispatch(addPlannedPayment(data));
    }
    dispatch(closeModal());
  };

  const handleDelete = () => {
    if (isEdit && window.confirm('Delete this planned payment?')) {
      dispatch(removePlannedPayment(payment.id));
      dispatch(closeModal());
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => dispatch(closeModal())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Planned Payment' : 'New Planned Payment'}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto pt-2">
          {/* Type */}
          <div className="flex gap-2">
            {['INCOME', 'EXPENSE'].map((t) => (
              <Button
                key={t}
                variant={form.type === t ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setForm((f) => ({ ...f, type: t }))}
              >
                {t}
              </Button>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-sm text-outline">Title</label>
            <Input
              placeholder="Payment name"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-outline">Amount</label>
            <Input
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-outline">Account</label>
            <select
              className="flex h-10 w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm"
              value={form.accountId}
              onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-outline">Category</label>
            <select
              className="flex h-10 w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm"
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-outline">Start Date</label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>

          {/* One-time toggle */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.oneTime}
              onChange={(e) => setForm((f) => ({ ...f, oneTime: e.target.checked }))}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm">One-time payment</span>
          </label>

          {/* Interval (only for recurring) */}
          {!form.oneTime && (
            <>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-sm text-outline">Every</label>
                  <Input
                    type="number"
                    min="1"
                    value={form.intervalN}
                    onChange={(e) => setForm((f) => ({ ...f, intervalN: e.target.value }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm text-outline">Period</label>
                  <select
                    className="flex h-10 w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm"
                    value={form.intervalType}
                    onChange={(e) => setForm((f) => ({ ...f, intervalType: e.target.value }))}
                  >
                    {INTERVAL_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0) + t.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Auto-create toggle */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.autoCreateEnabled}
                  onChange={(e) => setForm((f) => ({ ...f, autoCreateEnabled: e.target.checked }))}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm">Auto-create transactions</span>
              </label>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleSave}>
              {isEdit ? 'Save' : 'Create'}
            </Button>
            {isEdit && (
              <Button variant="destructive" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
