import { getCache, setCache } from './ip-api-cache.js';

const CACHE_KEY = 'userGeo';
const TTL = 24 * 60 * 60 * 1000; // 24 hours
const RATE_CACHE_PREFIX = 'exchangeRate';
const RATE_TTL = 12 * 60 * 60 * 1000; // 12 hours

export async function fetchLocalCurrency(baseCurrency, price) {
      const data = await getUserCurrency();
      const rate = await getExchangeRate(baseCurrency, data.currency);
      const convertedPrice = price * rate;
      return formatCurrency(convertedPrice, data.currency);
}

async function getUserCurrency() {

  const cached = getCache(CACHE_KEY);
  if (cached) return cached;

  try {
    const currency = 'USD';
    const res = await fetch('https://ipinfo.io/json');
     if (!res.ok) {
       throw new Error('Invalid API response');
    }
    const data = await res.json();
    currency = data.currency || 'USD';
    setCache(CACHE_KEY, currency, TTL);

    return currency;

  } catch (e) {
    console.error('Geo API failed:', e);

    const fallback = { country: 'US', currency: 'USD' };
    setCache(CACHE_KEY, fallback, 60 * 60 * 1000); // 1 hour fallback

    return fallback;
  }
}

async function getExchangeRate(from, to) {
  if (from === to) return 1;

  const cacheKey = `${RATE_CACHE_PREFIX}_${from}_${to}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await res.json();

    if (!data || !data.rates || !data.rates[to]) {
      console.error('Invalid exchange API response:', data);
      return 1;
    }
    setCache(cacheKey, data.rates[to], RATE_TTL);

    return data.rates[to];

  } catch (error) {
    console.error('Exchange rate fetch failed:', error);
    return 1;
  }
}

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency
  }).format(amount);
}