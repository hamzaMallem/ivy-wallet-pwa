import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addCategory, editCategory } from '@/store/slices/categoriesSlice';
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

export function CategoryModal({ open, category }) {
  const dispatch = useAppDispatch();
  const isEdit = !!category;

  const [form, setForm] = useState({
    name: '',
    color: 0xf57a3d,
    icon: 'food',
  });

  // Reset form when modal opens/closes or category changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        color: category.color || 0xf57a3d,
        icon: category.icon || 'food',
      });
    } else {
      setForm({ name: '', color: 0xf57a3d, icon: 'food' });
    }
  }, [category]);

  const handleSave = () => {
    if (!form.name.trim()) return;

    if (isEdit) {
      dispatch(editCategory({ id: category.id, changes: form }));
    } else {
      dispatch(addCategory(form));
    }
    dispatch(closeModal());
  };

  return (
    <Dialog open={open} onOpenChange={() => dispatch(closeModal())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Category' : 'New Category'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-1 block text-sm text-outline">Name</label>
            <Input
              placeholder="Category name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              autoFocus
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

          <Button className="w-full" onClick={handleSave}>
            {isEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
