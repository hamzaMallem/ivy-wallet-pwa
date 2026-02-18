import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTags, editTag, removeTag } from '@/store/slices/tagsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { ArrowLeft, Tag, Pencil, Trash2, Check, X } from 'lucide-react';

export function TagsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const tags = useAppSelector((state) => state.tags.items);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  const startEdit = (tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setConfirmDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = async (id) => {
    const name = editName.trim();
    if (!name) return;
    await dispatch(editTag({ id, changes: { name } }));
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (id) => {
    await dispatch(removeTag(id));
    setConfirmDeleteId(null);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-8 md:max-w-2xl lg:max-w-4xl">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Tags</h1>
      </div>

      {tags.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No tags yet"
          description="Create tags when adding a transaction to organize your spending."
        />
      ) : (
        <Card>
          <CardContent className="divide-y divide-outline/20 p-0">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center gap-2 px-4 py-3">
                {editingId === tag.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(tag.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="h-8 flex-1 text-sm"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-ivy-green"
                      onClick={() => handleSaveEdit(tag.id)}
                      disabled={!editName.trim()}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={cancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : confirmDeleteId === tag.id ? (
                  <>
                    <span className="flex-1 text-sm text-error">
                      Delete #{tag.name}?
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleDelete(tag.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium">
                      #{tag.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => startEdit(tag)}
                    >
                      <Pencil className="h-4 w-4 text-outline" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => {
                        setConfirmDeleteId(tag.id);
                        setEditingId(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-error" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
