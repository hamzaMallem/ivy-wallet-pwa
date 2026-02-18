import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { Plus, FolderOpen } from 'lucide-react';
import { openModal } from '@/store/slices/uiSlice';
import { getIconComponent } from '@/components/IconPicker';

export function CategoriesPage() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.items);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 md:max-w-2xl lg:max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Categories</h1>
        <Button
          size="sm"
          onClick={() => dispatch(openModal({ modal: 'createCategory' }))}
        >
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No categories yet"
          description="Create categories to organize your transactions"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => {
            const Icon = getIconComponent(category.icon);
            return (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-md"
                onClick={() =>
                  dispatch(
                    openModal({ modal: 'editCategory', data: category })
                  )
                }
              >
                <CardContent className="flex items-center gap-3 pt-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{
                      backgroundColor: `#${(category.color || 0x5c3df5).toString(16).padStart(6, '0')}`,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-medium">{category.name}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
