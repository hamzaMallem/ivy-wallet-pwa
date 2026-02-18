import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchBudgets } from '@/store/slices/budgetsSlice';
import { fetchTransactions } from '@/store/slices/transactionsSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { selectBudgetsWithProgress } from '@/store/selectors/budgetSelectors';
import { openModal } from '@/store/slices/uiSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { AmountDisplay } from '@/components/AmountDisplay';
import { Plus, Target } from 'lucide-react';

export function BudgetsPage() {
  const dispatch = useAppDispatch();
  const budgets = useAppSelector(selectBudgetsWithProgress);
  const categories = useAppSelector((state) => state.categories.items);
  const settings = useAppSelector((state) => state.settings.data);

  useEffect(() => {
    dispatch(fetchBudgets());
    dispatch(fetchTransactions());
    dispatch(fetchCategories());
  }, [dispatch]);

  const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining, 0);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8 md:max-w-2xl lg:max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Budgets</h1>
        <Button
          size="sm"
          onClick={() => dispatch(openModal({ modal: 'createBudget' }))}
        >
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      {budgets.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No budgets yet"
          description="Create budgets to track your spending limits"
        />
      ) : (
        <>
          <Card className="mb-4">
            <CardContent className="pt-4">
              <p className="text-xs text-outline">Total Remaining</p>
              <AmountDisplay
                amount={Math.abs(totalRemaining)}
                currency={settings.baseCurrency}
                type={totalRemaining >= 0 ? 'INCOME' : 'EXPENSE'}
                className="text-xl"
              />
            </CardContent>
          </Card>

          <div className="space-y-3">
            {budgets.map((budget) => {
              const catNames = budget.categoryIds
                ?.map((id) => categories.find((c) => c.id === id)?.name)
                .filter(Boolean)
                .join(', ');

              const progressPct = Math.min(budget.progress * 100, 100);
              const isOver = budget.progress > 1;

              return (
                <Card
                  key={budget.id}
                  className="cursor-pointer hover:shadow-md"
                  onClick={() =>
                    dispatch(openModal({ modal: 'editBudget', data: budget }))
                  }
                >
                  <CardContent className="pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{budget.name}</p>
                        {catNames && (
                          <p className="text-xs text-outline">{catNames}</p>
                        )}
                      </div>
                      <AmountDisplay
                        amount={budget.remaining}
                        currency={settings.baseCurrency}
                        type={budget.remaining >= 0 ? 'INCOME' : 'EXPENSE'}
                        className="text-sm"
                      />
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 overflow-hidden rounded-full bg-surface-variant">
                      <div
                        className={`h-full rounded-full transition-all ${isOver ? 'bg-ivy-red' : 'bg-ivy-green'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-outline">
                      <span>{budget.spent.toFixed(2)} spent</span>
                      <span>{budget.amount.toFixed(2)} limit</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
