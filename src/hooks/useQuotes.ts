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

export function useQuotes() {
  const [stockQuotes, setStockQuotes] = useState<{ [key: string]: StockQuote }>(
    {}
  );
  const [mutualFundQuotes, setMutualFundQuotes] = useState<{
    [key: string]: MutualFundQuote;
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStockQuotes = useCallback(async (symbols: string[]) => {
    if (symbols.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const queryString = symbols.join(',');
      const res = await fetch(`/api/quotes/stock?symbols=${queryString}`);
      const data = await res.json();

      if (data.success) {
        setStockQuotes(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMutualFundQuotes = useCallback(async (codes: string[]) => {
    if (codes.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const queryString = codes.join(',');
      const res = await fetch(`/api/quotes/mutual-fund?codes=${queryString}`);
      const data = await res.json();

      if (data.success) {
        setMutualFundQuotes(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

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

  return {
    stockQuotes,
    mutualFundQuotes,
    loading,
    error,
    fetchStockQuotes,
    fetchMutualFundQuotes,
    refreshStockQuote,
    refreshMutualFundQuote,
    getStockPrice,
    getMutualFundNAV,
  };
}
