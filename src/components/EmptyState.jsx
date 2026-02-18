import { cn } from '@/lib/utils';

export function EmptyState({ icon: Icon, title, description, className, iconClassName, children }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {Icon && <Icon className={iconClassName ?? 'mb-4 h-12 w-12 text-outline'} />}
      <h3 className="mb-1 text-lg font-medium text-on-surface">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-outline">{description}</p>
      )}
      {children}
    </div>
  );
}
