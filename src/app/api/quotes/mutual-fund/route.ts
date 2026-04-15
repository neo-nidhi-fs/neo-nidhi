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
  fundName: string;
  currency: string;
  lastUpdated: string;
  source: string;
}

interface MutualFundQuoteError {
  fundCode: string;
  nav: null;
  fundName: null;
  error: string;
}

type MutualFundQuote = MutualFundQuoteSuccess | MutualFundQuoteError;

interface MfApiResponse {
  meta?: {
    scheme_name?: string;
  };
  data?: Array<{
    nav?: string;
  }>;
}

interface MfSearchResultItem {
  schemeCode?: number;
  schemeName?: string;
}

const parseNav = (navValue?: string): number | null => {
  if (!navValue) return null;
  const parsed = Number(navValue);
  return Number.isFinite(parsed) ? parsed : null;
};

const fallbackNameFromCode = (code: string) =>
  code
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

const fetchMutualFundFromOnline = async (code: string) => {
  try {
    let schemeCode = code;

    // If code is not numeric, use search endpoint and resolve best match.
    if (!/^\d+$/.test(code)) {
      const searchResponse = await fetch(
        `https://api.mfapi.in/mf/search?q=${encodeURIComponent(code)}`,
        { next: { revalidate: 60 * 60 * 24 } }
      );
      if (!searchResponse.ok) return null;

      const searchData = (await searchResponse.json()) as MfSearchResultItem[];
      if (!Array.isArray(searchData) || searchData.length === 0) return null;

      const exactMatch = searchData.find(
        (item) =>
          String(item.schemeCode || '').trim().toUpperCase() ===
            code.trim().toUpperCase() ||
          (item.schemeName || '').trim().toUpperCase() ===
            code.trim().toUpperCase()
      );

      const candidate = exactMatch || searchData[0];
      if (!candidate?.schemeCode) return null;
      schemeCode = String(candidate.schemeCode);
    }

    const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}/latest`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as MfApiResponse;
    const fundName = data.meta?.scheme_name?.trim();
    const nav = parseNav(data.data?.[0]?.nav);

    if (!fundName && nav === null) return null;

    return {
      fundName: fundName || fallbackNameFromCode(code),
      nav,
      source: 'mfapi.in/latest',
    };
  } catch {
    return null;
  }
};

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
      const cleanCode = code.trim();
      const upperCode = cleanCode.toUpperCase();
      const onlineQuote = await fetchMutualFundFromOnline(cleanCode);
      const mockNav = mockMutualFundNAV[upperCode];

      if (onlineQuote) {
        quotes[code] = {
          fundCode: upperCode,
          nav: onlineQuote.nav ?? mockNav ?? null,
          fundName: onlineQuote.fundName,
          currency: 'INR',
          lastUpdated: new Date().toISOString(),
          source: onlineQuote.source,
        };
      } else if (mockNav) {
        quotes[code] = {
          fundCode: upperCode,
          nav: mockNav,
          fundName: fallbackNameFromCode(upperCode),
          currency: 'INR',
          lastUpdated: new Date().toISOString(),
          source: 'mock', // Replace with actual provider
        };
      } else {
        quotes[code] = {
          fundCode: upperCode,
          nav: null,
          fundName: null,
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
