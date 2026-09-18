// Real live exchange rates — ported from currency-converter.jsx's own
// fetch(FX_API)/localStorage cache, just AsyncStorage instead of
// localStorage. No API key needed; open.er-api.com is a free, unauthenticated
// endpoint the reference itself already used.
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'dhan-fx-rates-v1';
const FX_API = 'https://open.er-api.com/v6/latest/USD';

export interface FxCache {
  rates: Record<string, number>;
  fetchedAt: number;
}

export const FX_NAMES: Record<string, string> = {
  INR: 'Indian Rupee',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  AED: 'UAE Dirham',
  SGD: 'Singapore Dollar',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  HKD: 'Hong Kong Dollar',
  THB: 'Thai Baht',
  MYR: 'Malaysian Ringgit',
  NZD: 'New Zealand Dollar',
  SAR: 'Saudi Riyal',
  QAR: 'Qatari Riyal',
  KWD: 'Kuwaiti Dinar',
  OMR: 'Omani Rial',
  BHD: 'Bahraini Dinar',
  LKR: 'Sri Lankan Rupee',
  NPR: 'Nepalese Rupee',
  IDR: 'Indonesian Rupiah',
  PHP: 'Philippine Peso',
  KRW: 'South Korean Won',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  DKK: 'Danish Krone',
  ZAR: 'South African Rand',
  TRY: 'Turkish Lira',
  RUB: 'Russian Ruble',
  BRL: 'Brazilian Real',
  MXN: 'Mexican Peso',
  ILS: 'Israeli Shekel',
  VND: 'Vietnamese Dong',
  TWD: 'Taiwan Dollar',
  BDT: 'Bangladeshi Taka',
  MVR: 'Maldivian Rufiyaa',
  EGP: 'Egyptian Pound',
  PKR: 'Pakistani Rupee',
};

// Currencies with no minor unit — same list the reference formats with 0
// decimal places.
const ZERO_DECIMAL = ['JPY', 'KRW', 'IDR', 'VND'];
export function decimalPlaces(code: string): number {
  return ZERO_DECIMAL.includes(code) ? 0 : 2;
}

export async function readFxCache(): Promise<FxCache | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && parsed.rates && parsed.fetchedAt ? parsed : null;
  } catch {
    return null;
  }
}

// Always tries the network first; falls back to whatever's cached (and
// reports `offline: true`) rather than blocking the screen when there's
// no connection — same shape as the reference's own load().
export async function fetchFxRates(): Promise<{ cache: FxCache | null; offline: boolean }> {
  try {
    const res = await fetch(FX_API);
    const json = await res.json();
    if (!json || !json.rates) throw new Error('bad fx payload');
    const next: FxCache = { rates: json.rates, fetchedAt: Date.now() };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return { cache: next, offline: false };
  } catch {
    const cached = await readFxCache();
    return { cache: cached, offline: true };
  }
}
