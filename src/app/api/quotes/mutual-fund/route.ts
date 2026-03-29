import { NextResponse } from 'next/server';

// Mock mutual fund NAV (Net Asset Value) - in production, replace with actual API calls
const mockMutualFundNAV: { [key: string]: number } = {
  'DSP-EQUITY': 650.5,
  'AXIS-MF-GROWTH': 1200.75,
  'ICICI-PRUDENTIAL': 890.25,
  'HDFC-GROWTH': 950.0,
  'SBI-BLUECHIP': 680.5,
  'NIPPON-GROWTH': 1100.0,
  'MIRAE-EQUITY': 780.25,
  'KOTAK-GROWTH': 920.75,
  'MOTILAL-DIVIDEND': 650.0,
  'ADITYA-BIRLA': 1050.5,
};

interface MutualFundQuoteSuccess {
  fundCode: string;
  nav: number;
  currency: string;
  lastUpdated: string;
  source: string;
}

interface MutualFundQuoteError {
  fundCode: string;
  nav: null;
  error: string;
}

type MutualFundQuote = MutualFundQuoteSuccess | MutualFundQuoteError;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const codes = searchParams.get('codes')?.split(',') || [];

    if (codes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one fund code required' },
        { status: 400 }
      );
    }

    // Fetch NAV for requested fund codes
    const quotes: { [key: string]: MutualFundQuote } = {};

    for (const code of codes) {
      const upperCode = code.toUpperCase().trim();

      if (mockMutualFundNAV[upperCode]) {
        quotes[code] = {
          fundCode: upperCode,
          nav: mockMutualFundNAV[upperCode],
          currency: 'INR',
          lastUpdated: new Date().toISOString(),
          source: 'mock', // Replace with actual provider
        };
      } else {
        quotes[code] = {
          fundCode: upperCode,
          nav: null,
          error: `Fund code not found`,
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
