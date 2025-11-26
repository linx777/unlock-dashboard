/**
 * Quick test script to verify Hyperliquid API integration
 * Run with: node test-api.js
 */

const HYPERLIQUID_API_URL = 'https://api.hyperliquid.xyz/info';

async function testHyperliquidAPI() {
  console.log('🔍 Testing Hyperliquid API...\n');

  try {
    // Test 1: Fetch all mids
    console.log('1️⃣ Fetching current prices (allMids)...');
    const midsResponse = await fetch(HYPERLIQUID_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'allMids' }),
    });

    const midsData = await midsResponse.json();
    console.log('✅ HYPE Price:', midsData['HYPE'] || 'Not found');
    console.log('');

    // Test 2: Fetch meta and asset contexts
    console.log('2️⃣ Fetching market data (metaAndAssetCtxs)...');
    const metaResponse = await fetch(HYPERLIQUID_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
    });

    const metaData = await metaResponse.json();
    
    // metaData is an array: [meta, assetCtxs]
    const [meta, assetCtxs] = metaData;
    
    // Find HYPE token
    const hypeIndex = meta.universe.findIndex(
      (token) => token.name === 'HYPE'
    );

    if (hypeIndex !== -1) {
      const assetCtx = assetCtxs[hypeIndex];
      const currentPrice = parseFloat(midsData['HYPE']);
      const prevPrice = parseFloat(assetCtx.prevDayPx);
      const volume24h = parseFloat(assetCtx.dayNtlVlm);
      const priceChange24h = ((currentPrice - prevPrice) / prevPrice) * 100;

      console.log('✅ Token Data:');
      console.log('   📊 Current Price: $' + currentPrice.toFixed(2));
      console.log('   📈 24h Change: ' + priceChange24h.toFixed(2) + '%');
      console.log('   💰 24h Volume: $' + (volume24h / 1_000_000).toFixed(1) + 'M');
      console.log('   📉 Previous Day Price: $' + prevPrice.toFixed(2));
      console.log('');
      console.log('✨ API integration successful!');
    } else {
      console.log('❌ HYPE token not found in universe');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testHyperliquidAPI();
