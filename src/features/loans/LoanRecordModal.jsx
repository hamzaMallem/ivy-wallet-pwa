import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import {
  addLoanRecord,
  editLoanRecord,
  removeLoanRecord,
} from '@/store/slices/loanRecordsSlice';
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

export function LoanRecordModal({ open, record }) {
  const dispatch = useAppDispatch();
  const isEdit = !!record?.id;

  const [form, setForm] = useState({
    amount: '',
    loanRecordType: 'DECREASE',
    note: '',
    dateTime: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (record?.id) {
      setForm({
        amount: String(record.amount || ''),
        loanRecordType: record.loanRecordType || 'DECREASE',
        note: record.note || '',
        dateTime: record.dateTime
          ? record.dateTime.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      });
    } else {
      setForm({
        amount: '',
        loanRecordType: 'DECREASE',
        note: '',
        dateTime: new Date().toISOString().slice(0, 10),
      });
    }
  }, [record]);

  const handleSave = () => {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return;

    const data = {
      amount,
      loanRecordType: form.loanRecordType,
      note: form.note || undefined,
      dateTime: new Date(form.dateTime).toISOString(),
      loanId: record?.loanId,
    };

    if (isEdit) {
      dispatch(editLoanRecord({ id: record.id, changes: data }));
    } else {
      dispatch(addLoanRecord(data));
    }
    dispatch(closeModal());
  };

  const handleDelete = () => {
    if (isEdit && window.confirm('Delete this record?')) {
      dispatch(removeLoanRecord(record.id));
      dispatch(closeModal());
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => dispatch(closeModal())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Record' : 'New Payment Record'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex gap-2">
            {['DECREASE', 'INCREASE'].map((t) => (
              <Button
                key={t}
                variant={form.loanRecordType === t ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setForm((f) => ({ ...f, loanRecordType: t }))}
              >
                {t === 'DECREASE' ? 'Payment' : 'Increase'}
              </Button>
            ))}
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
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-outline">Date</label>
            <Input
              type="date"
              value={form.dateTime}
              onChange={(e) => setForm((f) => ({ ...f, dateTime: e.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-outline">Note</label>
            <Input
              placeholder="Optional note"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSave}>
              {isEdit ? 'Save' : 'Add Record'}
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
