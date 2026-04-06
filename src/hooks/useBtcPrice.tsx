import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface BtcPriceContextType {
  price: number | null;
  loading: boolean;
  error: string | null;
}

const BtcPriceContext = createContext<BtcPriceContextType>({
  price: null,
  loading: true,
  error: null,
});

const CACHE_KEY = 'tasksats_btc_price';
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const REFRESH_INTERVAL = 60 * 1000; // 60 seconds

function getCachedPrice(): number | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { price, ts } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL) return price;
  } catch {}
  return null;
}

function setCachedPrice(price: number) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ price, ts: Date.now() }));
  } catch {}
}

export function BtcPriceProvider({ children }: { children: React.ReactNode }) {
  const [price, setPrice] = useState<number | null>(getCachedPrice);
  const [loading, setLoading] = useState(!getCachedPrice());
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        { signal: AbortSignal.timeout(10000) }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const usd = data?.bitcoin?.usd;
      if (typeof usd === 'number') {
        setPrice(usd);
        setCachedPrice(usd);
        setError(null);
      }
    } catch (err: any) {
      // Keep stale price on error, just flag it
      if (!price) setError('Unable to fetch BTC price');
    } finally {
      setLoading(false);
    }
  }, [price]);

  useEffect(() => {
    fetchPrice();
    const id = setInterval(fetchPrice, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchPrice]);

  return (
    <BtcPriceContext.Provider value={{ price, loading, error }}>
      {children}
    </BtcPriceContext.Provider>
  );
}

export function useBtcPrice() {
  return useContext(BtcPriceContext);
}
