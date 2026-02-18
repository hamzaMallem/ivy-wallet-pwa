import { db } from '../database';

/**
 * Create a new recurring history record
 * @param {Object} record - History record data
 * @returns {Promise<string>} - The created record ID
 */
export const createHistoryRecord = (record) =>
  db.recurringHistory.add({
    id: crypto.randomUUID(),
    createdDate: new Date().toISOString(),
    ...record,
  });

/**
 * Get all history records for a specific planned payment
 * @param {string} plannedPaymentId - The planned payment ID
 * @returns {Promise<Array>} - Array of history records
 */
export const getByPlannedPaymentId = (plannedPaymentId) =>
  db.recurringHistory.where('plannedPaymentId').equals(plannedPaymentId).toArray();

/**
 * Get all history records within a date range
 * @param {string} from - Start date (ISO string)
 * @param {string} to - End date (ISO string)
 * @returns {Promise<Array>} - Array of history records
 */
export const getByDateRange = (from, to) =>
  db.recurringHistory.where('scheduledDate').between(from, to, true, true).toArray();

/**
 * Get all recurring history records
 * @returns {Promise<Array>} - Array of all history records
 */
export const getAllRecurringHistory = () => db.recurringHistory.toArray();

/**
 * Delete a history record by ID
 * @param {string} id - The history record ID
 * @returns {Promise<void>}
 */
export const deleteHistoryRecord = (id) => db.recurringHistory.delete(id);

/**
 * Delete all history records for a specific planned payment
 * @param {string} plannedPaymentId - The planned payment ID
 * @returns {Promise<number>} - Number of deleted records
 */
export const deleteByPlannedPaymentId = (plannedPaymentId) =>
  db.recurringHistory.where('plannedPaymentId').equals(plannedPaymentId).delete();
