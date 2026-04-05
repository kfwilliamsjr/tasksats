import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSats(sats: number) {
  return new Intl.NumberFormat('en-US').format(sats);
}

// TODO: Replace with live BTC price feed (e.g. CoinGecko API) before production
export function satsToUsd(sats: number, pricePerBtc: number = 85000) {
  const btc = sats / 100_000_000;
  return (btc * pricePerBtc).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}
