import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-on-primary',
        secondary: 'bg-surface-variant text-on-surface',
        outline: 'border border-outline text-outline',
        income: 'bg-ivy-green-extra-light text-ivy-green-dark',
        expense: 'bg-ivy-red-extra-light text-ivy-red-dark',
        transfer: 'bg-ivy-blue-extra-light text-ivy-blue-dark',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
