import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addLoan, editLoan } from '@/store/slices/loansSlice';
import { closeModal } from '@/store/slices/uiSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ColorPicker } from '@/components/ColorPicker';

export function LoanModal({ open, loan }) {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((state) => state.accounts.items);
  const isEdit = !!loan;

  const [form, setForm] = useState({
    name: '',
    amount: '',
    type: 'LEND',
    color: 0x5c3df5,
    accountId: '',
    note: '',
  });

  // Reset form when modal opens/closes or loan changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (loan) {
      setForm({
        name: loan.name || '',
        amount: String(loan.amount || ''),
        type: loan.type || 'LEND',
        color: loan.color || 0x5c3df5,
        accountId: loan.accountId || '',
        note: loan.note || '',
      });
    } else {
      setForm({
        name: '',
        amount: '',
        type: 'LEND',
        color: 0x5c3df5,
        accountId: accounts[0]?.id || '',
        note: '',
      });
    }
  }, [loan, accounts]);

  const handleSave = () => {
    const amount = parseFloat(form.amount);
    if (!form.name.trim() || isNaN(amount) || amount <= 0) return;

    const data = {
      name: form.name,
      amount,
      type: form.type,
      color: form.color,
      accountId: form.accountId || undefined,
      note: form.note || undefined,
      dateTime: new Date().toISOString(),
    };

    if (isEdit) {
      dispatch(editLoan({ id: loan.id, changes: data }));
    } else {
      dispatch(addLoan(data));
    }
    dispatch(closeModal());
  };

  return (
    <Dialog open={open} onOpenChange={() => dispatch(closeModal())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Loan' : 'New Loan'}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto pt-2">
          <div className="flex gap-2">
            {['LEND', 'BORROW'].map((t) => (
              <Button
                key={t}
                variant={form.type === t ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setForm((f) => ({ ...f, type: t }))}
              >
                {t === 'LEND' ? 'I Lend' : 'I Borrow'}
              </Button>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-sm text-outline">Name</label>
            <Input
              placeholder="Person or reason"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              autoFocus
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
            <label className="mb-1 block text-sm text-outline">
              Associated Account (optional)
            </label>
            <select
              className="flex h-10 w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm"
              value={form.accountId}
              onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
            >
              <option value="">None</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-outline">Color</label>
            <ColorPicker
              value={form.color}
              onChange={(color) => setForm((f) => ({ ...f, color }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-outline">Note</label>
            <textarea
              className="flex min-h-[60px] w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm placeholder:text-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Add a note..."
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </div>

          <Button className="w-full" onClick={handleSave}>
            {isEdit ? 'Save Changes' : 'Create Loan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
