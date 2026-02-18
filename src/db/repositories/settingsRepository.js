import { db } from '../database';

const SETTINGS_ID = 'app-settings';

const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  baseCurrency: 'MAD',
  theme: 'light',
  name: '',
  bufferAmount: 0,
  showNotifications: true,
  hideCurrentBalance: false,
  hideIncome: false,
  startDayOfMonth: 1,
  treatTransfersAsIncomeExpense: false,
  onboardingCompleted: false,
};

export const getSettings = async () => {
  const settings = await db.settings.get(SETTINGS_ID);
  if (!settings) {
    await db.settings.add(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  return { ...DEFAULT_SETTINGS, ...settings };
};

export const updateSettings = (changes) =>
  db.settings.update(SETTINGS_ID, changes);

export const initSettings = async () => {
  const existing = await db.settings.get(SETTINGS_ID);
  if (!existing) {
    await db.settings.add(DEFAULT_SETTINGS);
  }
};
