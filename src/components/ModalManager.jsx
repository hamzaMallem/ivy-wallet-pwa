import { useAppSelector } from '@/store/hooks';
import { AccountModal } from '@/features/accounts/AccountModal';
import { CategoryModal } from '@/features/categories/CategoryModal';
import { BudgetModal } from '@/features/budgets/BudgetModal';
import { PlannedPaymentModal } from '@/features/planned-payments/PlannedPaymentModal';
import { LoanModal } from '@/features/loans/LoanModal';
import { LoanRecordModal } from '@/features/loans/LoanRecordModal';

export function ModalManager() {
  const { activeModal, modalData } = useAppSelector((state) => state.ui);

  return (
    <>
      <AccountModal
        open={activeModal === 'createAccount' || activeModal === 'editAccount'}
        account={activeModal === 'editAccount' ? modalData : null}
      />
      <CategoryModal
        open={activeModal === 'createCategory' || activeModal === 'editCategory'}
        category={activeModal === 'editCategory' ? modalData : null}
      />
      <BudgetModal
        open={activeModal === 'createBudget' || activeModal === 'editBudget'}
        budget={activeModal === 'editBudget' ? modalData : null}
      />
      <PlannedPaymentModal
        open={
          activeModal === 'createPlannedPayment' ||
          activeModal === 'editPlannedPayment'
        }
        payment={activeModal === 'editPlannedPayment' ? modalData : null}
      />
      <LoanModal
        open={activeModal === 'createLoan' || activeModal === 'editLoan'}
        loan={activeModal === 'editLoan' ? modalData : null}
      />
      <LoanRecordModal
        open={
          activeModal === 'createLoanRecord' ||
          activeModal === 'editLoanRecord'
        }
        record={
          activeModal === 'editLoanRecord'
            ? modalData
            : activeModal === 'createLoanRecord'
              ? modalData
              : null
        }
      />
    </>
  );
}
