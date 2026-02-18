import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { updateSettings } from '@/store/slices/settingsSlice';
import { addAccount } from '@/store/slices/accountsSlice';
import { addCategory } from '@/store/slices/categoriesSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const STEPS = ['currency', 'accounts', 'categories'];

const DEFAULT_ACCOUNTS = [
  { name: 'Cash', color: 0x12b880, icon: 'cash' },
  { name: 'Bank', color: 0x3193f5, icon: 'bank' },
  { name: 'Revolut', color: 0x5c3df5, icon: 'revolut' },
];

const DEFAULT_CATEGORIES = [
  { name: 'Food & Drinks', color: 0xf57a3d, icon: 'food' },
  { name: 'Shopping', color: 0xf53d99, icon: 'shopping' },
  { name: 'Transport', color: 0x3193f5, icon: 'transport' },
  { name: 'Bills', color: 0xf53d3d, icon: 'bills' },
  { name: 'Entertainment', color: 0x5c3df5, icon: 'entertainment' },
  { name: 'Health', color: 0x12b880, icon: 'health' },
  { name: 'Salary', color: 0x12b880, icon: 'salary' },
  { name: 'Gifts', color: 0xf5d018, icon: 'gifts' },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState('MAD');
  const [selectedAccounts, setSelectedAccounts] = useState(
    DEFAULT_ACCOUNTS.map((a) => a.name)
  );
  const [selectedCategories, setSelectedCategories] = useState(
    DEFAULT_CATEGORIES.map((c) => c.name)
  );

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await dispatch(updateSettings({ baseCurrency: currency, onboardingCompleted: true }));

    for (const acc of DEFAULT_ACCOUNTS) {
      if (selectedAccounts.includes(acc.name)) {
        await dispatch(addAccount(acc));
      }
    }

    for (const cat of DEFAULT_CATEGORIES) {
      if (selectedCategories.includes(cat.name)) {
        await dispatch(addCategory(cat));
      }
    }

    navigate('/');
  };

  const toggleItem = (item, list, setList) => {
    setList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-primary">
          Ivy Wallet
        </h1>
        <p className="mb-8 text-center text-sm text-outline">
          Step {step + 1} of {STEPS.length}
        </p>

        {step === 0 && (
          <Card>
            <CardContent className="space-y-4 pt-4">
              <h2 className="text-lg font-semibold">Select your currency</h2>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                maxLength={3}
                placeholder="MAD"
                className="text-center text-2xl font-bold"
              />
              <p className="text-center text-xs text-outline">
                You can change this later in Settings
              </p>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardContent className="space-y-3 pt-4">
              <h2 className="text-lg font-semibold">Choose your accounts</h2>
              {DEFAULT_ACCOUNTS.map((acc) => (
                <label
                  key={acc.name}
                  className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-variant"
                >
                  <input
                    type="checkbox"
                    checked={selectedAccounts.includes(acc.name)}
                    onChange={() =>
                      toggleItem(acc.name, selectedAccounts, setSelectedAccounts)
                    }
                    className="h-4 w-4 accent-primary"
                  />
                  <div
                    className="h-8 w-8 rounded-lg"
                    style={{
                      backgroundColor: `#${acc.color.toString(16).padStart(6, '0')}`,
                    }}
                  />
                  <span className="font-medium">{acc.name}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardContent className="space-y-3 pt-4">
              <h2 className="text-lg font-semibold">Choose your categories</h2>
              {DEFAULT_CATEGORIES.map((cat) => (
                <label
                  key={cat.name}
                  className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-variant"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.name)}
                    onChange={() =>
                      toggleItem(
                        cat.name,
                        selectedCategories,
                        setSelectedCategories
                      )
                    }
                    className="h-4 w-4 accent-primary"
                  />
                  <div
                    className="h-8 w-8 rounded-lg"
                    style={{
                      backgroundColor: `#${cat.color.toString(16).padStart(6, '0')}`,
                    }}
                  />
                  <span className="font-medium">{cat.name}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          )}
          <Button className="flex-1" onClick={handleNext}>
            {step === STEPS.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
