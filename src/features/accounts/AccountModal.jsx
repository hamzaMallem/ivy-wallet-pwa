import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addAccount, editAccount } from '@/store/slices/accountsSlice';
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
import { IconPicker } from '@/components/IconPicker';

export function AccountModal({ open, account }) {
  const dispatch = useAppDispatch();
  const isEdit = !!account;

  const [form, setForm] = useState({
    name: '',
    currency: '',
    color: 0x5c3df5,
    icon: 'wallet',
    includeInBalance: true,
  });

  // Reset form when modal opens/closes or account changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (account) {
      setForm({
        name: account.name || '',
        currency: account.currency || '',
        color: account.color || 0x5c3df5,
        icon: account.icon || 'wallet',
        includeInBalance: account.includeInBalance !== false,
      });
    } else {
      setForm({
        name: '',
        currency: '',
        color: 0x5c3df5,
        icon: 'wallet',
        includeInBalance: true,
      });
    }
  }, [account]);

  const handleSave = () => {
    if (!form.name.trim()) return;

    if (isEdit) {
      dispatch(editAccount({ id: account.id, changes: form }));
    } else {
      dispatch(addAccount(form));
    }
    dispatch(closeModal());
  };

  return (
    <Dialog open={open} onOpenChange={() => dispatch(closeModal())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Account' : 'New Account'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-1 block text-sm text-outline">Name</label>
            <Input
              placeholder="Account name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-outline">
              Currency (leave empty for base currency)
            </label>
            <Input
              placeholder="MAD"
              value={form.currency}
              onChange={(e) =>
                setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))
              }
              maxLength={3}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-outline">Color</label>
            <ColorPicker
              value={form.color}
              onChange={(color) => setForm((f) => ({ ...f, color }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-outline">Icon</label>
            <IconPicker
              value={form.icon}
              onChange={(icon) => setForm((f) => ({ ...f, icon }))}
              color={form.color}
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.includeInBalance}
              onChange={(e) =>
                setForm((f) => ({ ...f, includeInBalance: e.target.checked }))
              }
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm">Include in total balance</span>
          </label>

          <Button className="w-full" onClick={handleSave}>
            {isEdit ? 'Save Changes' : 'Create Account'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
