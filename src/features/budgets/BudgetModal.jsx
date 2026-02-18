import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addBudget, editBudget, removeBudget } from '@/store/slices/budgetsSlice';
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

export function BudgetModal({ open, budget }) {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.items);
  const isEdit = !!budget;

  const [form, setForm] = useState({
    name: '',
    amount: '',
    categoryIds: [],
  });

  // Reset form when modal opens/closes or budget changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (budget) {
      setForm({
        name: budget.name || '',
        amount: String(budget.amount || ''),
        categoryIds: budget.categoryIds || [],
      });
    } else {
      setForm({ name: '', amount: '', categoryIds: [] });
    }
  }, [budget]);

  const toggleCategory = (catId) => {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(catId)
        ? f.categoryIds.filter((id) => id !== catId)
        : [...f.categoryIds, catId],
    }));
  };

  const handleSave = () => {
    const amount = parseFloat(form.amount);
    if (!form.name.trim() || isNaN(amount) || amount <= 0) return;

    const data = { name: form.name, amount, categoryIds: form.categoryIds };
    if (isEdit) {
      dispatch(editBudget({ id: budget.id, changes: data }));
    } else {
      dispatch(addBudget(data));
    }
    dispatch(closeModal());
  };

  const handleDelete = () => {
    if (isEdit && window.confirm('Delete this budget?')) {
      dispatch(removeBudget(budget.id));
      dispatch(closeModal());
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => dispatch(closeModal())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Budget' : 'New Budget'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-1 block text-sm text-outline">Name</label>
            <Input
              placeholder="Budget name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-outline">
              Monthly Limit
            </label>
            <Input
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-outline">
              Categories (optional — empty means all)
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    form.categoryIds.includes(cat.id)
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-variant text-on-surface'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSave}>
              {isEdit ? 'Save Changes' : 'Create Budget'}
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
