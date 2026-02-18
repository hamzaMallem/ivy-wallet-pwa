import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addTransaction,
  editTransaction,
  removeTransaction,
} from '@/store/slices/transactionsSlice';
import { fetchTags } from '@/store/slices/tagsSlice';
import { createTag } from '@/db/repositories/tagRepository';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Trash2, X } from 'lucide-react';

const TYPES = ['INCOME', 'EXPENSE', 'TRANSFER'];

export function EditTransactionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isEdit = id && id !== 'new';

  const accounts = useAppSelector((state) => state.accounts.items);
  const categories = useAppSelector((state) => state.categories.items);
  const allTags = useAppSelector((state) => state.tags.items);
  const existingTx = useAppSelector((state) =>
    state.transactions.items.find((t) => t.id === id)
  );

  const [form, setForm] = useState({
    type: 'EXPENSE',
    title: '',
    amount: '',
    accountId: '',
    toAccountId: '',
    categoryId: '',
    description: '',
    dateTime: new Date().toISOString().slice(0, 16),
    tags: [],
  });

  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit && existingTx) {
      setForm({
        type: existingTx.type,
        title: existingTx.title || '',
        amount: String(existingTx.amount),
        accountId: existingTx.accountId || '',
        toAccountId: existingTx.toAccountId || '',
        categoryId: existingTx.categoryId || '',
        description: existingTx.description || '',
        dateTime: existingTx.dateTime
          ? existingTx.dateTime.slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        tags: existingTx.tags || [],
      });
    }
  }, [isEdit, existingTx]);

  useEffect(() => {
    if (!form.accountId && accounts.length > 0) {
      setForm((f) => ({ ...f, accountId: accounts[0].id }));
    }
  }, [accounts, form.accountId]);

  const toggleTag = (tagId) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tagId)
        ? f.tags.filter((t) => t !== tagId)
        : [...f.tags, tagId],
    }));
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    // Check it doesn't already exist (case-insensitive)
    const existing = allTags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (!form.tags.includes(existing.id)) toggleTag(existing.id);
      setNewTagName('');
      return;
    }
    const newId = await createTag({ name, orderNum: allTags.length });
    dispatch(fetchTags());
    setForm((f) => ({ ...f, tags: [...f.tags, newId] }));
    setNewTagName('');
  };

  const handleSave = async () => {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return;
    if (!form.accountId) return;

    const data = {
      type: form.type,
      title: form.title || undefined,
      amount,
      accountId: form.accountId,
      toAccountId: form.type === 'TRANSFER' ? form.toAccountId : undefined,
      categoryId: form.categoryId || undefined,
      description: form.description || undefined,
      dateTime: new Date(form.dateTime).toISOString(),
      tags: form.tags,
    };

    if (isEdit) {
      await dispatch(editTransaction({ id, changes: data }));
    } else {
      await dispatch(addTransaction(data));
    }
    navigate(-1);
  };

  const handleDelete = async () => {
    if (isEdit) {
      await dispatch(removeTransaction(id));
      navigate(-1);
    }
  };

  const availableTags = allTags.filter((t) => !form.tags.includes(t.id));
  const selectedTagObjects = form.tags
    .map((tagId) => allTags.find((t) => t.id === tagId))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-8">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">
          {isEdit ? 'Edit Transaction' : 'New Transaction'}
        </h1>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-4">
          {/* Type selector */}
          <div className="flex gap-2">
            {TYPES.map((t) => (
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

          {/* Amount */}
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

          {/* Title */}
          <div>
            <label className="mb-1 block text-sm text-outline">Title</label>
            <Input
              placeholder="Transaction title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Account */}
          <div>
            <label className="mb-1 block text-sm text-outline">Account</label>
            <select
              className="flex h-10 w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm"
              value={form.accountId}
              onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* To Account (transfers) */}
          {form.type === 'TRANSFER' && (
            <div>
              <label className="mb-1 block text-sm text-outline">To Account</label>
              <select
                className="flex h-10 w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm"
                value={form.toAccountId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, toAccountId: e.target.value }))
                }
              >
                <option value="">Select account</option>
                {accounts
                  .filter((a) => a.id !== form.accountId)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Category */}
          {form.type !== 'TRANSFER' && (
            <div>
              <label className="mb-1 block text-sm text-outline">Category</label>
              <select
                className="flex h-10 w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm"
                value={form.categoryId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoryId: e.target.value }))
                }
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="mb-1 block text-sm text-outline">Date</label>
            <Input
              type="datetime-local"
              value={form.dateTime}
              onChange={(e) => setForm((f) => ({ ...f, dateTime: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm text-outline">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm placeholder:text-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Add a note..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          {/* Tags */}
          <div>
            <label className="mb-2 block text-sm text-outline">Tags</label>

            {/* Selected tags — removable chips */}
            {selectedTagObjects.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {selectedTagObjects.map((tag) => (
                  <span
                    key={tag.id}
                    className="flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    #{tag.name}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="ml-0.5 opacity-70 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Available tags to add */}
            {availableTags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className="rounded-full border border-outline px-2.5 py-0.5 text-xs text-outline transition-colors hover:border-primary hover:text-primary"
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            )}

            {/* Create new tag inline */}
            <div className="flex gap-2">
              <Input
                placeholder="New tag name…"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                className="h-8 text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                className="h-8 shrink-0"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleSave}>
              {isEdit ? 'Save Changes' : 'Add Transaction'}
            </Button>
            {isEdit && (
              <Button variant="destructive" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
