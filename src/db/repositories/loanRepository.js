import { db } from '../database';

export const getAllLoans = () => db.loans.toArray();

export const getLoanById = (id) => db.loans.get(id);

export const createLoan = (loan) =>
  db.loans.add({
    id: crypto.randomUUID(),
    orderNum: 0,
    ...loan,
  });

export const updateLoan = (id, changes) => db.loans.update(id, changes);

export const deleteLoan = (id) => db.loans.delete(id);
