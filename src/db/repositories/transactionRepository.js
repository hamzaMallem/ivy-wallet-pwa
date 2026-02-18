import { db } from '../database';

export const getAllTransactions = () =>
  db.transactions.orderBy('dateTime').reverse().toArray();

export const getTransactionById = (id) => db.transactions.get(id);

export const getByDateRange = (from, to) =>
  db.transactions
    .where('dateTime')
    .between(from, to, true, true)
    .reverse()
    .toArray();

export const getByAccountId = (accountId) =>
  db.transactions
    .where('accountId')
    .equals(accountId)
    .reverse()
    .sortBy('dateTime');

export const getByCategoryId = (categoryId) =>
  db.transactions
    .where('categoryId')
    .equals(categoryId)
    .reverse()
    .sortBy('dateTime');

export const getByType = (type) =>
  db.transactions.where('type').equals(type).reverse().sortBy('dateTime');

export const createTransaction = (transaction) =>
  db.transactions.add({
    id: crypto.randomUUID(),
    dateTime: new Date().toISOString(),
    tags: [],
    ...transaction,
  });

export const createTransactionFromPlanned = (transaction, plannedPaymentId, scheduledDate) =>
  db.transactions.add({
    id: crypto.randomUUID(),
    dateTime: scheduledDate,
    tags: [],
    ...transaction,
    plannedPaymentId,
  });

export const updateTransaction = (id, changes) =>
  db.transactions.update(id, changes);

export const deleteTransaction = (id) => db.transactions.delete(id);

export const searchTransactions = async (query) => {
  const lowerQuery = query.toLowerCase();
  const all = await db.transactions.toArray();
  return all.filter(
    (t) =>
      t.title?.toLowerCase().includes(lowerQuery) ||
      t.description?.toLowerCase().includes(lowerQuery)
  );
};
