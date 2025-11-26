/**
 * Hyperliquid API utilities
 * API Documentation: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api
 */

const HYPERLIQUID_API_URL = 'https://api.hyperliquid.xyz/info';

interface TokenInfo {
  coin: string;
  price: string;
  volume24h: string;
  priceChange24h: string;
}

// allMids returns an object where keys are coin names
type AllMidsResponse = { [key: string]: string };

interface Universe {
  szDecimals: number;
  name: string;
  maxLeverage: number;
  marginTableId: number;
  isDelisted?: boolean;
}

interface AssetCtx {
  dayNtlVlm: string;
  funding: string;
  openInterest: string;
  prevDayPx: string;
  markPx: string;
  midPx: string;
}

// metaAndAssetCtxs returns an array with [0] = { universe: [...] }, [1] = assetCtxs
type MetaAndAssetCtxsResponse = [
  { universe: Universe[] },
  AssetCtx[]
];

/**
 * Fetch current HYPE token price and 24h volume from Hyperliquid
 */
export async function fetchHypePrice(): Promise<TokenInfo | null> {
  try {
    // Fetch all mids (current prices)
    const midsResponse = await fetch(HYPERLIQUID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'allMids',
      }),
    });

    if (!midsResponse.ok) {
      throw new Error(`HTTP error! status: ${midsResponse.status}`);
    }

    const midsData: AllMidsResponse = await midsResponse.json();

    // Check if HYPE exists in mids data
    if (!midsData['HYPE']) {
      console.error('HYPE token not found in allMids data');
      return null;
    }

    // Fetch meta and asset contexts for volume and 24h change
    const metaResponse = await fetch(HYPERLIQUID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'metaAndAssetCtxs',
      }),
    });

    if (!metaResponse.ok) {
      throw new Error(`HTTP error! status: ${metaResponse.status}`);
    }

    const metaData: MetaAndAssetCtxsResponse = await metaResponse.json();

    // metaData is an array: [meta, assetCtxs]
    const [meta, assetCtxs] = metaData;

    // Find HYPE token index
    const hypeIndex = meta.universe.findIndex(
      (token: Universe) => token.name === 'HYPE'
    );

    if (hypeIndex === -1) {
      console.error('HYPE token not found in universe');
      return null;
    }

    const currentPrice = parseFloat(midsData['HYPE']);
    const assetCtx = assetCtxs[hypeIndex];
    const prevPrice = parseFloat(assetCtx.prevDayPx);
    const volume24h = parseFloat(assetCtx.dayNtlVlm);
    
    // Calculate 24h price change percentage
    const priceChange24h = ((currentPrice - prevPrice) / prevPrice) * 100;

    return {
      coin: 'HYPE',
      price: currentPrice.toFixed(3),
      volume24h: (volume24h / 1_000_000).toFixed(1), // Convert to millions
      priceChange24h: priceChange24h.toFixed(2),
    };
  } catch (error) {
    console.error('Error fetching HYPE price from Hyperliquid:', error);
    return null;
  }
}

/**
 * Fetch multiple tokens' data from Hyperliquid
 */
export async function fetchTokensData(tokens: string[]): Promise<TokenInfo[]> {
  try {
    // Fetch all mids (current prices)
    const midsResponse = await fetch(HYPERLIQUID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'allMids',
      }),
    });

    if (!midsResponse.ok) {
      throw new Error(`HTTP error! status: ${midsResponse.status}`);
    }

    const midsData: AllMidsResponse = await midsResponse.json();

    // Fetch meta and asset contexts for volume and 24h change
    const metaResponse = await fetch(HYPERLIQUID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'metaAndAssetCtxs',
      }),
    });

    if (!metaResponse.ok) {
      throw new Error(`HTTP error! status: ${metaResponse.status}`);
    }

    const metaData: MetaAndAssetCtxsResponse = await metaResponse.json();
    const [meta, assetCtxs] = metaData;

    // Process each requested token
    const tokensData: TokenInfo[] = [];

    for (const token of tokens) {
      if (!midsData[token]) {
        console.warn(`${token} not found in allMids data`);
        continue;
      }

      const tokenIndex = meta.universe.findIndex(
        (t: Universe) => t.name === token
      );

      if (tokenIndex === -1) {
        console.warn(`${token} not found in universe`);
        continue;
      }

      const currentPrice = parseFloat(midsData[token]);
      const assetCtx = assetCtxs[tokenIndex];
      const prevPrice = parseFloat(assetCtx.prevDayPx);
      const volume24h = parseFloat(assetCtx.dayNtlVlm);
      
      // Calculate 24h price change percentage
      const priceChange24h = ((currentPrice - prevPrice) / prevPrice) * 100;

      tokensData.push({
        coin: token,
        price: currentPrice.toFixed(4),
        volume24h: (volume24h / 1_000_000).toFixed(1), // Convert to millions
        priceChange24h: priceChange24h.toFixed(2),
      });
    }

    return tokensData;
  } catch (error) {
    console.error('Error fetching tokens data from Hyperliquid:', error);
    return [];
  }
}

/**
 * Fetch HYPE token price with caching (5 minute cache)
 */
let priceCache: { data: TokenInfo | null; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchHypePriceWithCache(): Promise<TokenInfo | null> {
  const now = Date.now();

  if (priceCache && now - priceCache.timestamp < CACHE_DURATION) {
    return priceCache.data;
  }

  const data = await fetchHypePrice();
  priceCache = { data, timestamp: now };
  return data;
}
