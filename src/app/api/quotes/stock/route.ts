import { NextResponse } from 'next/server';

// Mock stock prices - in production, replace with actual API calls
const mockStockPrices: { [key: string]: number } = {
  TCS: 3500,
  INFY: 1950,
  WIPRO: 450,
  HCL: 1650,
  MINDTREE: 5200,
  RELIANCE: 2800,
  BHARTIARTL: 850,
  SBIN: 650,
  HDFC: 2750,
  ICICIBANK: 950,
  AXISBANK: 1100,
};

interface StockQuoteSuccess {
  symbol: string;
  price: number;
  currency: string;
  lastUpdated: string;
  source: string;
}

interface StockQuoteError {
  symbol: string;
  price: null;
  error: string;
}

type StockQuote = StockQuoteSuccess | StockQuoteError;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbols = searchParams.get('symbols')?.split(',') || [];

    if (symbols.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one symbol required' },
        { status: 400 }
      );
    }

    // Fetch quotes for requested symbols
    const quotes: { [key: string]: StockQuote } = {};

    for (const symbol of symbols) {
      const upperSymbol = symbol.toUpperCase().trim();

      if (mockStockPrices[upperSymbol]) {
        quotes[symbol] = {
          symbol: upperSymbol,
          price: mockStockPrices[upperSymbol],
          currency: 'INR',
          lastUpdated: new Date().toISOString(),
          source: 'mock', // Replace with actual provider
        };
      } else {
        quotes[symbol] = {
          symbol: upperSymbol,
          price: null,
          error: `Symbol not found`,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: quotes,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
