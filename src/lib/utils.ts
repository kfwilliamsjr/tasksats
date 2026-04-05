import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSats(sats: number) {
  return new Intl.NumberFormat('en-US').format(sats);
}

export function satsToUsd(sats: number, pricePerBtc: number = 65000) {
  const btc = sats / 100_000_000;
  return (btc * pricePerBtc).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}
