import { startOfDay } from 'date-fns';
import * as ppRepo from '@/db/repositories/plannedPaymentRepository';
import * as txRepo from '@/db/repositories/transactionRepository';
import * as historyRepo from '@/db/repositories/recurringHistoryRepository';
import { getOccurrencesBetween, shouldProcessPayment } from '@/lib/recurringUtils';

/**
 * Process all recurring payments and create transactions for due occurrences
 *
 * This function:
 * 1. Fetches all planned payments
 * 2. Filters to recurring payments that should be processed
 * 3. For each payment, calculates due occurrences since last processed date
 * 4. Creates transactions for each occurrence (with idempotency check)
 * 5. Records creation in recurringHistory
 * 6. Updates lastProcessedDate on the planned payment
 *
 * @returns {Promise<Array>} - Array of created transaction info for UI notification
 */
export async function processRecurringTransactions() {
  const now = new Date();
  const today = startOfDay(now);

  try {
    // Fetch all planned payments
    const allPayments = await ppRepo.getAllPlannedPayments();

    // Filter to recurring payments that should be processed
    const recurringPayments = allPayments.filter((payment) =>
      shouldProcessPayment(payment, today)
    );

    const created = [];

    // Process each recurring payment
    for (const payment of recurringPayments) {
      try {
        // Determine date range to process
        const fromDate = payment.lastProcessedDate
          ? new Date(payment.lastProcessedDate)
          : new Date(payment.startDate);

        // Get all occurrences between last processed and today
        const occurrences = getOccurrencesBetween(payment, fromDate, today);

        // Get existing history to check for duplicates
        const existingHistory = await historyRepo.getByPlannedPaymentId(payment.id);

        // Create transactions for each occurrence
        for (const scheduledDate of occurrences) {
          try {
            // Idempotency check: skip if already created
            const scheduledTimestamp = startOfDay(scheduledDate).getTime();
            const alreadyCreated = existingHistory.some(
              (h) => startOfDay(new Date(h.scheduledDate)).getTime() === scheduledTimestamp
            );

            if (alreadyCreated) {
              continue;
            }

            // Create the transaction
            const transaction = {
              type: payment.type,
              amount: payment.amount,
              accountId: payment.accountId,
              categoryId: payment.categoryId || undefined,
              title: payment.title || undefined,
              description: payment.description || undefined,
            };

            const transactionId = await txRepo.createTransactionFromPlanned(
              transaction,
              payment.id,
              scheduledDate.toISOString()
            );

            // Record in history
            await historyRepo.createHistoryRecord({
              plannedPaymentId: payment.id,
              transactionId,
              scheduledDate: scheduledDate.toISOString(),
              amount: payment.amount,
            });

            // Add to created list for notification
            created.push({
              paymentTitle: payment.title || 'Recurring Payment',
              date: scheduledDate,
              amount: payment.amount,
              type: payment.type,
            });
          } catch (error) {
            console.error(
              `Failed to create transaction for payment ${payment.id} on ${scheduledDate}:`,
              error
            );
            // Continue with next occurrence
          }
        }

        // Update lastProcessedDate for this payment
        await ppRepo.updatePlannedPayment(payment.id, {
          lastProcessedDate: today.toISOString(),
        });
      } catch (error) {
        console.error(`Failed to process payment ${payment.id}:`, error);
        // Continue with next payment
      }
    }

    if (created.length > 0) {
      console.log(`Created ${created.length} recurring transaction(s)`);
    }

    return created;
  } catch (error) {
    console.error('Failed to process recurring transactions:', error);
    return [];
  }
}
