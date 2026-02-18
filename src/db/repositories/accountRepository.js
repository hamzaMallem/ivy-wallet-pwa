import { db } from '../database';

export const getAllAccounts = () => db.accounts.orderBy('orderNum').toArray();

export const getAccountById = (id) => db.accounts.get(id);

export const createAccount = (account) =>
  db.accounts.add({
    id: crypto.randomUUID(),
    orderNum: 0,
    includeInBalance: true,
    ...account,
  });

export const updateAccount = (id, changes) => db.accounts.update(id, changes);

export const deleteAccount = (id) => db.accounts.delete(id);

export const reorderAccounts = async (orderedIds) => {
  await db.transaction('rw', db.accounts, async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.accounts.update(orderedIds[i], { orderNum: i });
    }
  });
};
