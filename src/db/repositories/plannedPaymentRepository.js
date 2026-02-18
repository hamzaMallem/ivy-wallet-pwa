import { db } from '../database';

export const getAllPlannedPayments = () => db.plannedPayments.toArray();

export const getPlannedPaymentById = (id) => db.plannedPayments.get(id);

export const getByAccountId = (accountId) =>
  db.plannedPayments.where('accountId').equals(accountId).toArray();

export const getOneTime = async () => {
  const all = await db.plannedPayments.toArray();
  return all.filter((p) => p.oneTime);
};

export const getRecurring = async () => {
  const all = await db.plannedPayments.toArray();
  return all.filter((p) => !p.oneTime);
};

export const createPlannedPayment = (payment) =>
  db.plannedPayments.add({
    id: crypto.randomUUID(),
    ...payment,
  });

export const updatePlannedPayment = (id, changes) =>
  db.plannedPayments.update(id, changes);

export const deletePlannedPayment = (id) => db.plannedPayments.delete(id);
