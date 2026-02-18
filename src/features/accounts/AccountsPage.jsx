import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAccounts } from '@/store/slices/accountsSlice';
import { selectAccountBalances } from '@/store/selectors/balanceSelectors';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { AmountDisplay } from '@/components/AmountDisplay';
import { Plus, Wallet } from 'lucide-react';
import { openModal } from '@/store/slices/uiSlice';
import { getIconComponent } from '@/components/IconPicker';

export function AccountsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const accounts = useAppSelector((state) => state.accounts.items);
  const settings = useAppSelector((state) => state.settings.data);
  const balances = useAppSelector(selectAccountBalances);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 md:max-w-2xl lg:max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Accounts</h1>
        <Button
          size="sm"
          onClick={() => dispatch(openModal({ modal: 'createAccount' }))}
        >
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No accounts yet"
          description="Create your first account to start tracking"
        />
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <Card
              key={account.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => navigate(`/accounts/${account.id}`)}
            >
              <CardContent className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getIconComponent(account.icon);
                    return (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                        style={{
                          backgroundColor: `#${(account.color || 0x5c3df5).toString(16).padStart(6, '0')}`,
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    );
                  })()}
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-xs text-outline">
                      {account.currency || settings.baseCurrency}
                    </p>
                  </div>
                </div>
                <AmountDisplay
                  amount={balances[account.id] || 0}
                  currency={account.currency || settings.baseCurrency}
                  className="text-base"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
