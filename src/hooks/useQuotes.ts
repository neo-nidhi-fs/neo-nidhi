'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface StockQuote {
  symbol: string;
  price: number | null;
  currency: string;
  lastUpdated: string;
  source: string;
  error?: string;
}

export interface MutualFundQuote {
  fundCode: string;
  nav: number | null;
  currency: string;
  lastUpdated: string;
  source: string;
  error?: string;
}

export interface CommodityQuote {
  symbol: string;
  price: number | null;
  currency: string;
  lastUpdated: string;
  source: string;
  error?: string;
}

export function useQuotes() {
  const [stockQuotes, setStockQuotes] = useState<{ [key: string]: StockQuote }>(
    {}
  );
  const [mutualFundQuotes, setMutualFundQuotes] = useState<{
    [key: string]: MutualFundQuote;
  }>({});
  const [commodityQuotes, setCommodityQuotes] = useState<{
    [key: string]: CommodityQuote;
  }>({});

  const QUOTE_CACHE_TTL = 24 * 60 * 60 * 1000;

  type QuoteDictionary<T> = Record<string, T>;

  const readFromCache = useCallback(
    <T extends StockQuote | MutualFundQuote | CommodityQuote>(
      cacheKey: string,
      symbols: string[]
    ) => {
      if (typeof window === 'undefined')
        return { cached: {} as QuoteDictionary<T>, toFetch: symbols };

      const stored = localStorage.getItem(cacheKey);
      if (!stored)
        return { cached: {} as QuoteDictionary<T>, toFetch: symbols };

      const parsed = JSON.parse(stored) as QuoteDictionary<T>;
      const cached: QuoteDictionary<T> = {};
      const toFetch: string[] = [];
      const now = Date.now();

      symbols.forEach((symbol) => {
        const item = parsed[symbol];
        if (!item || !item.lastUpdated) {
          toFetch.push(symbol);
        } else if (
          now - new Date(item.lastUpdated).getTime() >
          QUOTE_CACHE_TTL
        ) {
          toFetch.push(symbol);
        } else {
          cached[symbol] = item;
        }
      });

      return { cached, toFetch };
    },
    [QUOTE_CACHE_TTL]
  );

  const writeToCache = useCallback(
    <T extends StockQuote | MutualFundQuote | CommodityQuote>(
      cacheKey: string,
      data: QuoteDictionary<T>
    ) => {
      if (typeof window === 'undefined') return;

      const stored = localStorage.getItem(cacheKey);
      const existing = stored ? (JSON.parse(stored) as QuoteDictionary<T>) : {};
      localStorage.setItem(cacheKey, JSON.stringify({ ...existing, ...data }));
    },
    []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStockQuotes = useCallback(
    async (symbols: string[]) => {
      if (symbols.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        const cacheKey = 'stockQuoteCache';
        const { cached, toFetch } = readFromCache<StockQuote>(
          cacheKey,
          symbols
        );

        let result: Record<string, StockQuote> = { ...cached };

        if (toFetch.length > 0) {
          const queryString = toFetch.join(',');
          const res = await fetch(`/api/quotes/stock?symbols=${queryString}`);
          const data = await res.json();

          if (!data.success) {
            setError(data.error);
            setStockQuotes(result);
            return;
          }

          result = { ...result, ...data.data };
          writeToCache(cacheKey, result);
        }

        setStockQuotes(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [readFromCache, writeToCache]
  );

  const fetchMutualFundQuotes = useCallback(
    async (codes: string[]) => {
      if (codes.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        const cacheKey = 'mutualFundQuoteCache';
        const { cached, toFetch } = readFromCache<MutualFundQuote>(
          cacheKey,
          codes
        );

        let result: Record<string, MutualFundQuote> = { ...cached };

        if (toFetch.length > 0) {
          const queryString = toFetch.join(',');
          const res = await fetch(
            `/api/quotes/mutual-fund?codes=${queryString}`
          );
          const data = await res.json();

          if (!data.success) {
            setError(data.error);
            setMutualFundQuotes(result);
            return;
          }

          result = { ...result, ...data.data };
          writeToCache(cacheKey, result);
        }

        setMutualFundQuotes(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [readFromCache, writeToCache]
  );

  const fetchCommodityQuotes = useCallback(
    async (symbols: string[]) => {
      if (symbols.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        const cacheKey = 'commodityQuoteCache';
        const { cached, toFetch } = readFromCache<CommodityQuote>(
          cacheKey,
          symbols
        );

        let result: Record<string, CommodityQuote> = { ...cached };

        if (toFetch.length > 0) {
          const queryString = toFetch.join(',');
          const res = await fetch(
            `/api/quotes/commodities?symbols=${queryString}`
          );
          const data = await res.json();

          if (!data.success) {
            setError(data.error);
            setCommodityQuotes(result);
            return;
          }

          result = { ...result, ...data.data };
          writeToCache(cacheKey, result);
        }

        setCommodityQuotes(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [readFromCache, writeToCache]
  );

  const refreshStockQuote = useCallback(
    (symbol: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        fetchStockQuotes([symbol]);
      }, 500);
    },
    [fetchStockQuotes]
  );

  const refreshMutualFundQuote = useCallback(
    (code: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        fetchMutualFundQuotes([code]);
      }, 500);
    },
    [fetchMutualFundQuotes]
  );

  const getStockPrice = useCallback(
    (symbol: string): number | null => {
      return stockQuotes[symbol]?.price || null;
    },
    [stockQuotes]
  );

  const getMutualFundNAV = useCallback(
    (code: string): number | null => {
      return mutualFundQuotes[code]?.nav || null;
    },
    [mutualFundQuotes]
  );

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const getCommodityPrice = useCallback(
    (symbol: string): number | null => {
      return commodityQuotes[symbol]?.price || null;
    },
    [commodityQuotes]
  );

  const refreshCommodityQuote = useCallback(
    (symbol: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        fetchCommodityQuotes([symbol]);
      }, 500);
    },
    [fetchCommodityQuotes]
  );

  return {
    stockQuotes,
    mutualFundQuotes,
    commodityQuotes,
    loading,
    error,
    fetchStockQuotes,
    fetchMutualFundQuotes,
    fetchCommodityQuotes,
    refreshStockQuote,
    refreshMutualFundQuote,
    refreshCommodityQuote,
    getStockPrice,
    getMutualFundNAV,
    getCommodityPrice,
  };
}
