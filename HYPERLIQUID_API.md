# Hyperliquid API Integration

This integration fetches real-time HYPE token price and trading data from the Hyperliquid exchange.

## Features

- ✅ Real-time HYPE token price
- ✅ 24-hour trading volume
- ✅ 24-hour price change percentage
- ✅ Auto-refresh every 30 seconds
- ✅ 5-minute caching to reduce API calls
- ✅ Error handling with fallback to default values

## API Endpoints Used

### 1. `allMids` - Current Prices
```javascript
POST https://api.hyperliquid.xyz/info
{
  "type": "allMids"
}
```
Returns: `{ "HYPE": "33.9235", ... }`

### 2. `metaAndAssetCtxs` - Market Data
```javascript
POST https://api.hyperliquid.xyz/info
{
  "type": "metaAndAssetCtxs"
}
```
Returns: `[meta, assetCtxs]` array with trading volume, previous day price, etc.

## Usage

The integration is automatic in the ChartsPage component:

```tsx
import { fetchHypePriceWithCache } from '../utils/hyperliquid';

// Fetch price with caching
const data = await fetchHypePriceWithCache();
if (data) {
  console.log(`HYPE Price: $${data.price}`);
  console.log(`24h Volume: $${data.volume24h}M`);
  console.log(`24h Change: ${data.priceChange24h}%`);
}
```

## Testing

Run the test script to verify the API integration:

```bash
node test-api.js
```

Expected output:
```
🔍 Testing Hyperliquid API...

1️⃣ Fetching current prices (allMids)...
✅ HYPE Price: 33.9235

2️⃣ Fetching market data (metaAndAssetCtxs)...
✅ Token Data:
   📊 Current Price: $33.92
   📈 24h Change: 3.49%
   💰 24h Volume: $503.6M
   📉 Previous Day Price: $32.78

✨ API integration successful!
```

## Files

- `/app/utils/hyperliquid.ts` - API utility functions
- `/app/components/ChartsPage.tsx` - Component using the API
- `/test-api.js` - Test script to verify API integration

## Documentation

Official Hyperliquid API docs: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api
