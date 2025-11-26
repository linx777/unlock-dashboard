'use client';

import { useState, useEffect } from 'react';
import { fetchTokensData } from '../utils/hyperliquid';

interface MarketData {
  token: string;
  icon: string;
  price: number;
  change24h: number;
  volume24h: number;
  isLive: boolean;
}

export default function MarketsTable() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredTab, setHoveredTab] = useState(false);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarketsData = async () => {
      setLoading(true);
      try {
        const tokenNames = ['BTC', 'ETH', 'DYDX', 'INJ', 'GMX', 'SEI', 'SUI', 'ARB', 'ENA'];
        const data = await fetchTokensData(tokenNames);
        
        const formattedData: MarketData[] = data.map(token => ({
          token: token.coin,
          icon: token.coin.charAt(0).toUpperCase(),
          price: parseFloat(token.price),
          change24h: parseFloat(token.priceChange24h),
          volume24h: parseFloat(token.volume24h) * 1_000_000, // Convert back from millions
          isLive: true,
        }));
        
        setMarketData(formattedData);
      } catch (error) {
        console.error('Error loading market data:', error);
        // Keep existing data if error occurs
      } finally {
        setLoading(false);
      }
    };

    loadMarketsData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadMarketsData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getDecimalPlaces = (token: string): number => {
    const decimalMap: { [key: string]: number } = {
      'BTC': 0,
      'ETH': 1,
      'DYDX': 4,
      'INJ': 2,
      'GMX': 2,
      'SEI': 4,
      'SUI': 4,
      'ARB': 4,
      'ENA': 4,
    };
    return decimalMap[token] ?? 4;
  };

  const formatPrice = (price: number, token: string) => {
    const decimals = getDecimalPlaces(token);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(1)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(1)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(0)}K`;
    }
    return `$${volume.toFixed(0)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className="flex flex-col gap-4 relative mt-8">
      {/* Tab */}
      <div
        className="absolute -top-8 left-0 px-6 py-2 backdrop-blur-3xl flex items-center transition-all duration-300 cursor-default"
        onMouseEnter={() => setHoveredTab(true)}
        onMouseLeave={() => setHoveredTab(false)}
        style={{
          background: hoveredTab
            ? 'radial-gradient(circle at center, rgba(192, 211, 194, 0.35) 0%, rgba(192, 211, 194, 0.18) 50%, rgba(255, 255, 255, 0.15) 100%)'
            : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.18))',
          border: hoveredTab
            ? '1px solid rgba(192, 211, 194, 0.4)'
            : '1px solid rgba(255, 255, 255, 0.35)',
          borderBottom: 'none',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          boxShadow: hoveredTab
            ? `
              inset 0 1px 2px rgba(192, 211, 194, 0.08),
              inset 0 -1px 1px rgba(255, 255, 255, 0.3),
              0 3px 8px rgba(0, 0, 0, 0.05),
              0 6px 16px rgba(0, 0, 0, 0.03)
            `
            : `
              inset 0 1px 2px rgba(0, 0, 0, 0.04),
              inset 0 -1px 1px rgba(255, 255, 255, 0.25),
              0 2px 6px rgba(0, 0, 0, 0.04),
              0 4px 12px rgba(0, 0, 0, 0.02)
            `
        }}
      >
        <span className="text-sm font-[family-name:var(--font-cormorant)]" style={{ color: '#2E3837' }}>
          Markets Overview
        </span>
      </div>

      {/* Container with glassmorphism */}
      <div
        className="rounded-2xl backdrop-blur-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.18))',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: `
            inset 0 1px 2px rgba(0, 0, 0, 0.04),
            inset 0 -1px 1px rgba(255, 255, 255, 0.25),
            0 2px 6px rgba(0, 0, 0, 0.04),
            0 4px 12px rgba(0, 0, 0, 0.02)
          `,
        }}
      >
        {/* Table */}
        <table className="w-full">
          <thead>
            <tr
              style={{
                borderBottom: '1px solid rgba(46, 56, 55, 0.1)',
              }}
            >
              <th
                className="text-left px-6 py-4 text-xs font-[family-name:var(--font-inter)] font-semibold"
                style={{ color: '#2E3837', opacity: 0.6 }}
              >
                Token
              </th>
              <th
                className="text-right px-6 py-4 text-xs font-[family-name:var(--font-inter)] font-semibold"
                style={{ color: '#2E3837', opacity: 0.6 }}
              >
                Price
              </th>
              <th
                className="text-right px-6 py-4 text-xs font-[family-name:var(--font-inter)] font-semibold"
                style={{ color: '#2E3837', opacity: 0.6 }}
              >
                24h %
              </th>
              <th
                className="text-right px-6 py-4 text-xs font-[family-name:var(--font-inter)] font-semibold"
                style={{ color: '#2E3837', opacity: 0.6 }}
              >
                24h Vol
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && marketData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#8FB99E] border-t-transparent"></div>
                    <span className="text-sm font-[family-name:var(--font-inter)]" style={{ color: '#2E3837', opacity: 0.6 }}>
                      Loading market data...
                    </span>
                  </div>
                </td>
              </tr>
            ) : marketData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <span className="text-sm font-[family-name:var(--font-inter)]" style={{ color: '#2E3837', opacity: 0.6 }}>
                    No market data available
                  </span>
                </td>
              </tr>
            ) : (
              marketData.map((market, index) => (
              <tr
                key={index}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
                className="transition-all duration-200"
                style={{
                  backgroundColor: hoveredRow === index ? 'rgba(143, 185, 158, 0.1)' : 'transparent',
                  borderBottom: index < marketData.length - 1 ? '1px solid rgba(46, 56, 55, 0.05)' : 'none',
                }}
              >
                {/* Token Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#8FB99E',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 600,
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      {market.icon}
                    </div>
                    {/* Token Name */}
                    <div className="flex flex-col">
                      <span
                        className="text-sm font-[family-name:var(--font-inter)] font-semibold"
                        style={{ color: '#2E3837' }}
                      >
                        {market.token}
                      </span>
                      {market.isLive && (
                        <span
                          className="text-xs font-[family-name:var(--font-inter)]"
                          style={{ color: '#6B9080' }}
                        >
                          Live
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Price Column */}
                <td className="px-6 py-4 text-right">
                  <span
                    className="text-sm font-[family-name:var(--font-inter)] font-medium"
                    style={{ color: '#2E3837' }}
                  >
                    {formatPrice(market.price, market.token)}
                  </span>
                </td>

                {/* 24h % Column */}
                <td className="px-6 py-4 text-right">
                  <span
                    className="text-sm font-[family-name:var(--font-inter)] font-medium"
                    style={{ color: market.change24h >= 0 ? '#6B9080' : '#D97B7B' }}
                  >
                    {formatChange(market.change24h)}
                  </span>
                </td>

                {/* 24h Vol Column */}
                <td className="px-6 py-4 text-right">
                  <span
                    className="text-sm font-[family-name:var(--font-inter)] font-medium"
                    style={{ color: '#2E3837', opacity: 0.7 }}
                  >
                    {formatVolume(market.volume24h)}
                  </span>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
