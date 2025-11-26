/**
 * Debug script to see actual API response structure
 */

const HYPERLIQUID_API_URL = 'https://api.hyperliquid.xyz/info';

async function debugAPI() {
  console.log('🔍 Debugging Hyperliquid API responses...\n');

  try {
    // Check allMids
    console.log('1️⃣ Fetching allMids...');
    const midsResponse = await fetch(HYPERLIQUID_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'allMids' }),
    });
    const midsData = await midsResponse.json();
    console.log('Response keys:', Object.keys(midsData));
    console.log('First 10 entries:', Object.entries(midsData.mids || midsData).slice(0, 10));
    console.log('\n');

    // Check metaAndAssetCtxs
    console.log('2️⃣ Fetching metaAndAssetCtxs...');
    const metaResponse = await fetch(HYPERLIQUID_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
    });
    const metaData = await metaResponse.json();
    console.log('Response structure:', JSON.stringify(metaData, null, 2).slice(0, 1000));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugAPI();
