import { db } from '../database';

export const getAllBudgets = () => db.budgets.toArray();

export const getBudgetById = (id) => db.budgets.get(id);

export const createBudget = (budget) =>
  db.budgets.add({
    id: crypto.randomUUID(),
    categoryIds: [],
    accountIds: [],
    ...budget,
  });

export const updateBudget = (id, changes) => db.budgets.update(id, changes);

export const deleteBudget = (id) => db.budgets.delete(id);
