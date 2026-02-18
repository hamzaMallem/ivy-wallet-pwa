import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchExchangeRates,
  setExchangeRate,
} from '@/store/slices/exchangeRatesSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/EmptyState';
import { ArrowLeft, Plus, DollarSign } from 'lucide-react';

export function ExchangeRatesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const rates = useAppSelector((state) => state.exchangeRates.items);
  const settings = useAppSelector((state) => state.settings.data);

  const [showAdd, setShowAdd] = useState(false);
  const [newCurrency, setNewCurrency] = useState('');
  const [newRate, setNewRate] = useState('');

  useEffect(() => {
    dispatch(fetchExchangeRates());
  }, [dispatch]);

  const handleAddRate = () => {
    const rate = parseFloat(newRate);
    if (!newCurrency.trim() || isNaN(rate) || rate <= 0) return;

    dispatch(
      setExchangeRate({
        baseCurrency: settings.baseCurrency,
        currency: newCurrency.toUpperCase(),
        rate,
        manualOverride: true,
      })
    );
    setNewCurrency('');
    setNewRate('');
    setShowAdd(false);
  };

  const handleUpdateRate = (baseCurrency, currency, newRateValue) => {
    const rate = parseFloat(newRateValue);
    if (isNaN(rate) || rate <= 0) return;
    dispatch(
      setExchangeRate({ baseCurrency, currency, rate, manualOverride: true })
    );
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-8">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="flex-1 text-xl font-bold">Exchange Rates</h1>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      <p className="mb-4 text-sm text-outline">
        Base currency: <strong>{settings.baseCurrency}</strong>
      </p>

      {/* Add new rate */}
      {showAdd && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Input
                placeholder="EUR"
                value={newCurrency}
                onChange={(e) => setNewCurrency(e.target.value.toUpperCase())}
                maxLength={3}
                className="w-20"
              />
              <Input
                type="number"
                placeholder="Rate"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                step="0.0001"
                min="0"
                className="flex-1"
              />
              <Button onClick={handleAddRate}>Save</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {rates.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No exchange rates"
          description="Add custom exchange rates for multi-currency tracking"
        />
      ) : (
        <div className="space-y-2">
          {rates.map((rate) => (
            <Card key={`${rate.baseCurrency}-${rate.currency}`}>
              <CardContent className="flex items-center gap-3 pt-3 pb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    1 {rate.baseCurrency} = {rate.currency}
                  </p>
                  {rate.manualOverride && (
                    <p className="text-xs text-primary">Manual override</p>
                  )}
                </div>
                <Input
                  type="number"
                  value={rate.rate}
                  onChange={(e) =>
                    handleUpdateRate(
                      rate.baseCurrency,
                      rate.currency,
                      e.target.value
                    )
                  }
                  step="0.0001"
                  min="0"
                  className="w-28 text-right"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
