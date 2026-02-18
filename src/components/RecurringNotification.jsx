import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearRecentlyCreated } from '@/store/slices/recurringSlice';
import { CheckCircle2, X } from 'lucide-react';

export function RecurringNotification() {
  const dispatch = useAppDispatch();
  const recentlyCreated = useAppSelector((state) => state.recurring.recentlyCreated);

  if (recentlyCreated.length === 0) return null;

  const handleDismiss = () => {
    dispatch(clearRecentlyCreated());
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-lg">
      <div className="rounded-xl bg-primary p-4 text-on-primary shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">
                {recentlyCreated.length} recurring transaction
                {recentlyCreated.length > 1 ? 's' : ''} created
              </p>
              <p className="mt-1 text-sm opacity-90">
                {recentlyCreated
                  .slice(0, 2)
                  .map((t) => t.paymentTitle)
                  .join(', ')}
                {recentlyCreated.length > 2 && `, +${recentlyCreated.length - 2} more`}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 transition-opacity hover:opacity-70"
            aria-label="Dismiss notification"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
