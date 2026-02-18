import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  searchTransactions,
  clearSearch,
} from '@/store/slices/transactionsSlice';
import { fetchTags } from '@/store/slices/tagsSlice';
import { Input } from '@/components/ui/input';
import { TransactionItem } from '@/components/TransactionItem';
import { EmptyState } from '@/components/EmptyState';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SearchPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const results = useAppSelector((state) => state.transactions.searchResults);

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    if (query.trim().length >= 2) {
      const timer = setTimeout(() => {
        dispatch(searchTransactions(query.trim()));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      dispatch(clearSearch());
    }
  }, [query, dispatch]);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <X className="h-5 w-5" />
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
          <Input
            className="pl-9"
            placeholder="Search transactions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {query.trim().length < 2 ? (
        <EmptyState
          icon={Search}
          title="Search transactions"
          description="Type at least 2 characters to search"
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No results"
          description={`No transactions matching "${query}"`}
        />
      ) : (
        <div className="space-y-1">
          <p className="mb-2 text-xs text-outline">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          {results.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onClick={() => navigate(`/transactions/${tx.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
