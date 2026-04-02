import { NextResponse } from 'next/server';

// Where possible, inject a real API key via METALS_API_KEY env var.
const knownCommodityPrices: { [key: string]: number } = {
  GOLD: 65000,
  SILVER: 760,
  XAU: 65000,
  XAG: 760,
  NIFTYBEES: 320,
  JUNIORBEES: 190,
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbols = searchParams.get('symbols')?.split(',') || [];

    if (symbols.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one commodity symbol required' },
        { status: 400 }
      );
    }

    interface CommodityQuote {
      symbol: string;
      price: number | null;
      currency: string;
      lastUpdated: string;
      source: string;
    }

    const quotes: Record<string, CommodityQuote> = {};

    const envKey = process.env.METALS_API_KEY;
    const normalized = symbols.map((s) => s.toUpperCase().trim());

    if (envKey) {
      const requested = normalized
        .filter((s) => ['GOLD', 'SILVER', 'XAU', 'XAG'].includes(s))
        .join(',');
      if (requested) {
        try {
          const response = await fetch(
            `https://metals-api.com/api/latest?access_key=${envKey}&symbols=XAU,XAG&base=INR`
          );
          const data = await response.json();

          normalized.forEach((symbol) => {
            if (symbol === 'GOLD' || symbol === 'XAU') {
              const price = data && data.rates && data.rates.XAU;
              quotes[symbol] = {
                symbol,
                price: price || knownCommodityPrices.GOLD,
                currency: 'INR',
                lastUpdated: new Date().toISOString(),
                source: price ? 'metals-api' : 'mock',
              };
            } else if (symbol === 'SILVER' || symbol === 'XAG') {
              const price = data && data.rates && data.rates.XAG;
              quotes[symbol] = {
                symbol,
                price: price || knownCommodityPrices.SILVER,
                currency: 'INR',
                lastUpdated: new Date().toISOString(),
                source: price ? 'metals-api' : 'mock',
              };
            } else {
              quotes[symbol] = {
                symbol,
                price: knownCommodityPrices[symbol] || null,
                currency: 'INR',
                lastUpdated: new Date().toISOString(),
                source: 'mock',
              };
            }
          });

          return NextResponse.json({ success: true, data: quotes });
        } catch {
          // Continue to fallback
        }
      }
    }

    for (const symbol of normalized) {
      const fallbackPrice = knownCommodityPrices[symbol] || null;

      quotes[symbol] = {
        symbol,
        price: fallbackPrice,
        currency: 'INR',
        lastUpdated: new Date().toISOString(),
        source: 'mock',
      };
    }

    return NextResponse.json({ success: true, data: quotes });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
