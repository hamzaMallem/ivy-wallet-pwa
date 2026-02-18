import { db } from '../database';

export const getAllLoanRecords = () => db.loanRecords.toArray();

export const getLoanRecordById = (id) => db.loanRecords.get(id);

export const getByLoanId = (loanId) =>
  db.loanRecords.where('loanId').equals(loanId).reverse().sortBy('dateTime');

export const createLoanRecord = (record) =>
  db.loanRecords.add({
    id: crypto.randomUUID(),
    dateTime: new Date().toISOString(),
    ...record,
  });

export const updateLoanRecord = (id, changes) =>
  db.loanRecords.update(id, changes);

export const deleteLoanRecord = (id) => db.loanRecords.delete(id);
