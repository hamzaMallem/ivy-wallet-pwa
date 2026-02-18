import {
  addDays,
  addWeeks,
  addMonths,
  addQuarters,
  addYears,
  startOfDay,
  isAfter,
  isBefore,
  isEqual,
} from 'date-fns';

/**
 * Mapping of interval types to date-fns functions
 */
const INTERVAL_FUNCTIONS = {
  DAILY: addDays,
  WEEKLY: addWeeks,
  BIWEEKLY: (date, n) => addWeeks(date, n * 2),
  MONTHLY: addMonths,
  QUARTERLY: addQuarters,
  YEARLY: addYears,
};

/**
 * Calculate the next occurrence date after a given reference date
 *
 * @param {string|Date} startDate - The start date of the recurring payment
 * @param {number} intervalN - Number of intervals (e.g., 2 for "every 2 months")
 * @param {string} intervalType - DAILY, WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, YEARLY
 * @param {string|Date} afterDate - Find next occurrence after this date
 * @returns {Date} - The next occurrence date
 */
export function calculateNextOccurrence(startDate, intervalN, intervalType, afterDate) {
  const addFn = INTERVAL_FUNCTIONS[intervalType];
  if (!addFn) {
    throw new Error(`Unknown interval type: ${intervalType}`);
  }

  let currentDate = startOfDay(new Date(startDate));
  const referenceDate = startOfDay(new Date(afterDate));

  // Find the next occurrence after the reference date
  while (isBefore(currentDate, referenceDate) || isEqual(currentDate, referenceDate)) {
    currentDate = addFn(currentDate, intervalN);
  }

  return currentDate;
}

/**
 * Generate all occurrence dates between two dates for a recurring payment
 *
 * @param {Object} plannedPayment - The planned payment object
 * @param {string|Date} fromDate - Start of date range
 * @param {string|Date} toDate - End of date range
 * @returns {Date[]} - Array of occurrence dates (normalized to start of day)
 */
export function getOccurrencesBetween(plannedPayment, fromDate, toDate) {
  const { startDate, intervalN, intervalType } = plannedPayment;

  if (!intervalType || !intervalN) {
    return [];
  }

  const addFn = INTERVAL_FUNCTIONS[intervalType];
  if (!addFn) {
    console.warn(`Unknown interval type: ${intervalType}`);
    return [];
  }

  const occurrences = [];
  const start = startOfDay(new Date(startDate));
  const from = startOfDay(new Date(fromDate));
  const to = startOfDay(new Date(toDate));

  // Start from the payment's start date
  let currentDate = start;

  // If fromDate is after startDate, find the first occurrence on or after fromDate
  if (isAfter(from, start)) {
    currentDate = start;
    // Fast-forward to first occurrence on or after fromDate
    while (isBefore(currentDate, from)) {
      currentDate = addFn(currentDate, intervalN);
    }
  }

  // Generate occurrences up to toDate (inclusive)
  let count = 0;
  const MAX_OCCURRENCES = 366; // Safety limit

  while (
    (isBefore(currentDate, to) || isEqual(currentDate, to)) &&
    count < MAX_OCCURRENCES
  ) {
    // Only include if it's on or after fromDate
    if (isAfter(currentDate, from) || isEqual(currentDate, from)) {
      occurrences.push(new Date(currentDate));
    }
    currentDate = addFn(currentDate, intervalN);
    count++;
  }

  return occurrences;
}

/**
 * Check if a planned payment should be processed for recurring transactions
 *
 * @param {Object} plannedPayment - The planned payment object
 * @param {string|Date} now - Current date/time
 * @returns {boolean} - True if payment should be processed
 */
export function shouldProcessPayment(plannedPayment, now) {
  // Must be recurring (not one-time)
  if (plannedPayment.oneTime) {
    return false;
  }

  // Must have auto-creation enabled (defaults to true if undefined)
  if (plannedPayment.autoCreateEnabled === false) {
    return false;
  }

  // Start date must have arrived
  const startDate = startOfDay(new Date(plannedPayment.startDate));
  const today = startOfDay(new Date(now));

  if (isAfter(startDate, today)) {
    return false;
  }

  // Must have valid interval configuration
  if (!plannedPayment.intervalType || !plannedPayment.intervalN) {
    return false;
  }

  return true;
}
