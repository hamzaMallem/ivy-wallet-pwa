import { db } from '../database';

export const getAllRates = () => db.exchangeRates.toArray();

export const getRate = (baseCurrency, currency) =>
  db.exchangeRates.get({ baseCurrency, currency });

export const getRatesByBase = (baseCurrency) =>
  db.exchangeRates.where('baseCurrency').equals(baseCurrency).toArray();

export const setRate = (baseCurrency, currency, rate, manualOverride = false) =>
  db.exchangeRates.put({ baseCurrency, currency, rate, manualOverride });

export const bulkSetRates = (rates) => db.exchangeRates.bulkPut(rates);

export const deleteRate = (baseCurrency, currency) =>
  db.exchangeRates.delete([baseCurrency, currency]);
