import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';

type AssetType = 'equity' | 'mutual_fund' | 'etf';

type RevaluationStats = {
  usersScanned: number;
  assetsScanned: number;
  assetsUpdated: number;
  assetsSkipped: number;
  errors: string[];
};

type StockQuoteResult = {
  price: number | null;
  source: string;
};

type MfQuoteResult = {
  nav: number | null;
  source: string;
};

const STOCK_MOCK: Record<string, number> = {
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

function parseNumber(input: unknown): number | null {
  const n = Number(input);
  return Number.isFinite(n) ? n : null;
}

async function fetchStockPriceOnline(symbol: string): Promise<StockQuoteResult> {
  const raw = symbol.trim().toUpperCase();
  const candidates = [raw, `${raw}.NS`, `${raw}.BO`];

  for (const candidate of candidates) {
    try {
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(candidate)}`;
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) continue;

      const data = (await response.json()) as {
        quoteResponse?: { result?: Array<{ regularMarketPrice?: number }> };
      };
      const price = parseNumber(
        data.quoteResponse?.result?.[0]?.regularMarketPrice
      );

      if (price !== null && price > 0) {
        return { price, source: `yahoo:${candidate}` };
      }
    } catch {
      // try next candidate
    }
  }

  if (STOCK_MOCK[raw]) {
    return { price: STOCK_MOCK[raw], source: 'mock' };
  }

  return { price: null, source: 'unavailable' };
}

async function fetchMutualFundNavOnline(code: string): Promise<MfQuoteResult> {
  const cleanCode = code.trim();
  let schemeCode = cleanCode;

  try {
    if (!/^\d+$/.test(cleanCode)) {
      const searchResponse = await fetch(
        `https://api.mfapi.in/mf/search?q=${encodeURIComponent(cleanCode)}`,
        { cache: 'no-store' }
      );
      if (searchResponse.ok) {
        const searchData = (await searchResponse.json()) as Array<{
          schemeCode?: number;
          schemeName?: string;
        }>;
        if (Array.isArray(searchData) && searchData.length > 0) {
          const upper = cleanCode.toUpperCase();
          const exact = searchData.find(
            (item) =>
              String(item.schemeCode || '').trim().toUpperCase() === upper ||
              String(item.schemeName || '').trim().toUpperCase() === upper
          );
          const candidate = exact || searchData[0];
          if (candidate?.schemeCode) {
            schemeCode = String(candidate.schemeCode);
          }
        }
      }
    }

    const navResponse = await fetch(`https://api.mfapi.in/mf/${schemeCode}/latest`, {
      cache: 'no-store',
    });
    if (!navResponse.ok) {
      return { nav: null, source: 'unavailable' };
    }

    const navData = (await navResponse.json()) as {
      data?: Array<{ nav?: string }>;
    };
    const nav = parseNumber(navData.data?.[0]?.nav);
    if (nav !== null && nav > 0) {
      return { nav, source: `mfapi:${schemeCode}` };
    }
  } catch {
    // fall through
  }

  return { nav: null, source: 'unavailable' };
}

function isTargetAssetType(type: string): type is AssetType {
  return type === 'equity' || type === 'mutual_fund' || type === 'etf';
}

export async function revaluateOnlineAssets(): Promise<RevaluationStats> {
  await dbConnect();

  const stats: RevaluationStats = {
    usersScanned: 0,
    assetsScanned: 0,
    assetsUpdated: 0,
    assetsSkipped: 0,
    errors: [],
  };

  const users = await User.find({ 'assetPortfolio.0': { $exists: true } });
  stats.usersScanned = users.length;

  for (const user of users) {
    let userChanged = false;

    for (const asset of user.assetPortfolio || []) {
      if (!isTargetAssetType(asset.type)) continue;

      stats.assetsScanned += 1;

      const symbolOrCode = asset.symbolOrCode?.trim();
      const quantity = Number(asset.quantity || 0);

      if (!symbolOrCode || quantity <= 0) {
        stats.assetsSkipped += 1;
        continue;
      }

      try {
        if (asset.type === 'mutual_fund') {
          const quote = await fetchMutualFundNavOnline(symbolOrCode);
          if (quote.nav === null) {
            stats.assetsSkipped += 1;
            continue;
          }

          asset.marketValue = quote.nav * quantity;
          asset.updatedAt = new Date();
          asset.metadata = {
            ...(asset.metadata || {}),
            latestUnitPrice: quote.nav,
            latestQuoteSource: quote.source,
            latestValuationAt: new Date().toISOString(),
          };
          userChanged = true;
          stats.assetsUpdated += 1;
          continue;
        }

        const quote = await fetchStockPriceOnline(symbolOrCode);
        if (quote.price === null) {
          stats.assetsSkipped += 1;
          continue;
        }

        asset.marketValue = quote.price * quantity;
        asset.updatedAt = new Date();
        asset.metadata = {
          ...(asset.metadata || {}),
          latestUnitPrice: quote.price,
          latestQuoteSource: quote.source,
          latestValuationAt: new Date().toISOString(),
        };
        userChanged = true;
        stats.assetsUpdated += 1;
      } catch (error: unknown) {
        stats.errors.push(
          `user=${user._id?.toString()} asset=${asset._id?.toString()} err=${(error as Error).message}`
        );
      }
    }

    if (userChanged) {
      await user.save();
    }
  }

  return stats;
}
