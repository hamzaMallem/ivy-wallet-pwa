import { createSelector } from '@reduxjs/toolkit';

const selectLoans = (state) => state.loans.items;
const selectLoanRecords = (state) => state.loanRecords.items;

export const selectLoansWithProgress = createSelector(
  [selectLoans, selectLoanRecords],
  (loans, records) => {
    return loans.map((loan) => {
      const loanRecords = records.filter((r) => r.loanId === loan.id);
      const totalPaid = loanRecords
        .filter((r) => r.loanRecordType !== 'INCREASE')
        .reduce((sum, r) => sum + r.amount, 0);

      return {
        ...loan,
        totalPaid,
        remaining: loan.amount - totalPaid,
        progress: loan.amount > 0 ? totalPaid / loan.amount : 0,
        recordCount: loanRecords.length,
      };
    });
  }
);
