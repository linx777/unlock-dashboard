'use client';

import { useState, useEffect } from 'react';
import { fetchHypePriceWithCache } from '../utils/hyperliquid';
import { calculateFlexibleStressModel, MOCK_STRESS_DATA } from '../utils/stressModel';

interface ChartsPageProps {
  sellPressure?: number;
  executionTime?: number;
}

export default function ChartsPage({ sellPressure = 0, executionTime = 0 }: ChartsPageProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [showActualNumbers, setShowActualNumbers] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showCurrentPrice, setShowCurrentPrice] = useState(true);
  const [show24hVolume, setShow24hVolume] = useState(true);
  const [showEstDrop, setShowEstDrop] = useState(true);
  const [showEstDropTooltip, setShowEstDropTooltip] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [hypePrice, setHypePrice] = useState<string>('32.40');
  const [hypeVolume, setHypeVolume] = useState<string>('584.3');

  // Fetch HYPE price from Hyperliquid API
  useEffect(() => {
    const fetchPrice = async () => {
      const data = await fetchHypePriceWithCache();
      if (data) {
        setHypePrice(data.price);
        setHypeVolume(data.volume24h);
      }
    };

    fetchPrice();
    // Refresh price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Token allocation data
  const tokenData = [
    { label: 'Future Emissions & Community', value: 38.89, tokens: 388.88, color: '#6B9080' },
    { label: 'Genesis Distribution', value: 31.0, tokens: 310.0, color: '#8FB99E' },
    { label: 'Core Contributors', value: 23.8, tokens: 238.0, color: '#A8C5B8' },
    { label: 'Hyper Foundation', value: 6.0, tokens: 60.0, color: '#C0D3C2' },
    { label: 'Community Grants', value: 0.3, tokens: 3.0, color: '#D4E3D5' },
    { label: 'HIP-2', value: 0.01, tokens: 0.1, color: '#E8F0EC' },
  ];

  // Calculate dynamic price data based on stress model
  const calculatePriceImpact = () => {
    // Parse current price from hypePrice state (remove $ and convert to number)
    const currentPrice = parseFloat(hypePrice);
    
    // If no user input (default state), show current price only
    if (executionTime === 0 || sellPressure === 0) {
      const today = new Date();
      return [{
        date: today.toISOString().split('T')[0],
        y: currentPrice
      }];
    }

    // Use the flexible stress model with user inputs
    const stressInput = {
      ...MOCK_STRESS_DATA,
      event: {
        ...MOCK_STRESS_DATA.event,
        sell_ratio: sellPressure / 100, // Convert percentage to decimal
        sell_days: executionTime
      }
    };

    const stressResult = calculateFlexibleStressModel(stressInput);

    // Generate price predictions for each day
    const today = new Date();
    const predictions = stressResult.daily.map((dayData) => {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + dayData.day - 1);
      
      // Calculate price based on cumulative impact
      // Negative impact = price drops
      const priceChange = currentPrice * (dayData.cumulativeImpact / 100);
      const predictedPrice = Math.max(currentPrice - priceChange, 0.01); // Ensure price doesn't go negative
      
      return {
        date: futureDate.toISOString().split('T')[0],
        y: parseFloat(predictedPrice.toFixed(2))
      };
    });

    // Add current price as day 0
    return [
      { date: today.toISOString().split('T')[0], y: currentPrice },
      ...predictions
    ];
  };

  const lineData = calculatePriceImpact();

  // Calculate estimated price drop from stress model
  const calculateEstimatedDrop = (): { drop: string; details: any } => {
    if (executionTime === 0 || sellPressure === 0) {
      return { 
        drop: '0.00', 
        details: null 
      };
    }

    const stressInput = {
      ...MOCK_STRESS_DATA,
      event: {
        ...MOCK_STRESS_DATA.event,
        sell_ratio: sellPressure / 100,
        sell_days: executionTime
      }
    };

    const stressResult = calculateFlexibleStressModel(stressInput);
    const finalImpact = stressResult.final_cumulative_impact_percent;
    
    return {
      drop: finalImpact.toFixed(2),
      details: stressResult
    };
  };

  const { drop: estimatedDrop, details: dropDetails } = calculateEstimatedDrop();

  // Text color helpers for dark mode
  const textColor = isDark ? '#FFFFFF' : '#2E3837';
  const textColorMuted = isDark ? 'rgba(255, 255, 255, 0.6)' : '#2E3837';

  // Calculate pie chart segments
  const total = tokenData.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90; // Start from top
  const pieSegments = tokenData.map(item => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
    };
  });

  // Create SVG path for pie segment
  const createPieSlice = (startAngle: number, endAngle: number, radius: number = 100, innerRadius: number = 60) => {
    const start = polarToCartesian(150, 150, radius, endAngle);
    const end = polarToCartesian(150, 150, radius, startAngle);
    const innerStart = polarToCartesian(150, 150, innerRadius, endAngle);
    const innerEnd = polarToCartesian(150, 150, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return `
      M ${start.x} ${start.y}
      A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}
      L ${innerEnd.x} ${innerEnd.y}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}
      Z
    `;
  };

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  // Create line graph path with dynamic Y-axis scaling
  const dataMaxY = Math.max(...lineData.map(d => d.y));
  const dataMinY = Math.min(...lineData.map(d => d.y));
  
  // Add padding to Y-axis (10% on each side) for better visualization
  const yPadding = (dataMaxY - dataMinY) * 0.1;
  const maxY = yPadding > 0 ? dataMaxY + yPadding : dataMaxY + dataMaxY * 0.1;
  const minY = yPadding > 0 ? Math.max(0, dataMinY - yPadding) : Math.max(0, dataMinY - dataMinY * 0.1);
  
  // Handle edge case where all values are the same (single point or flat line)
  const rangeY = maxY - minY || maxY * 0.2 || 10; // Fallback to 20% of value or 10 if value is 0
  
  const width = 450;
  const height = 250;
  const padding = 40;

  const linePath = lineData
    .map((point, index) => {
      const x = padding + (lineData.length > 1 ? (index / (lineData.length - 1)) : 0.5) * (width - padding * 2);
      const y = height - padding - ((point.y - minY) / rangeY) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Create filled area path (same as line, but closed at bottom)
  const areaPath = lineData
    .map((point, index) => {
      const x = padding + (lineData.length > 1 ? (index / (lineData.length - 1)) : 0.5) * (width - padding * 2);
      const y = height - padding - ((point.y - minY) / rangeY) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ') +
    ` L ${padding + (lineData.length > 1 ? 1 : 0.5) * (width - padding * 2)} ${height - padding}` +
    ` L ${padding} ${height - padding} Z`;

  return (
    <div className="flex gap-6 w-full justify-center mt-8">
      {/* Pie Chart - Token Allocation */}
      <div className="relative">
        {/* Tab */}
        <div
          className="absolute -top-8 left-0 px-6 py-2 backdrop-blur-3xl flex items-center gap-2 transition-all duration-300 cursor-default"
          onMouseEnter={() => setHoveredTab('allocation')}
          onMouseLeave={() => setHoveredTab(null)}
          style={{
            background: hoveredTab === 'allocation'
              ? 'radial-gradient(circle at center, rgba(192, 211, 194, 0.35) 0%, rgba(192, 211, 194, 0.18) 50%, rgba(255, 255, 255, 0.15) 100%)'
              : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.18))',
            border: hoveredTab === 'allocation'
              ? '1px solid rgba(192, 211, 194, 0.4)'
              : '1px solid rgba(255, 255, 255, 0.35)',
            borderBottom: 'none',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            boxShadow: hoveredTab === 'allocation'
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
          <span className="text-sm font-[family-name:var(--font-cormorant)]" style={{ color: textColor }}>
            Token Allocation
          </span>
          <button
            onClick={() => setShowActualNumbers(!showActualNumbers)}
            className="flex items-center justify-center rounded-full cursor-pointer transition-all hover:scale-110"
            style={{
              width: '16px',
              height: '16px',
              border: '0.5px solid rgba(46, 56, 55, 0.5)',
              backgroundColor: 'transparent'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="#2E3837" viewBox="0 0 256 256">
              <path d="M224,48V152a16,16,0,0,1-16,16H99.31l10.35,10.34a8,8,0,0,1-11.32,11.32l-24-24a8,8,0,0,1,0-11.32l24-24a8,8,0,0,1,11.32,11.32L99.31,152H208V48H96v8a8,8,0,0,1-16,0V48A16,16,0,0,1,96,32H208A16,16,0,0,1,224,48ZM168,192a8,8,0,0,0-8,8v8H48V104H156.69l-10.35,10.34a8,8,0,0,0,11.32,11.32l24-24a8,8,0,0,0,0-11.32l-24-24a8,8,0,0,0-11.32,11.32L156.69,88H48a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16H160a16,16,0,0,0,16-16v-8A8,8,0,0,0,168,192Z"></path>
            </svg>
          </button>
        </div>

        <div
          className="px-8 py-6 rounded-2xl backdrop-blur-3xl"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.18))',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            boxShadow: `
              inset 0 1px 2px rgba(0, 0, 0, 0.04),
              inset 0 -1px 1px rgba(255, 255, 255, 0.25),
              0 2px 6px rgba(0, 0, 0, 0.04),
              0 4px 12px rgba(0, 0, 0, 0.02)
            `,
            width: '550px',
            height: '400px',
          }}
        >
          <div className="flex items-start gap-8 h-full">
          {/* Pie Chart SVG */}
          <div style={{ width: '350px', flexShrink: 0, position: 'relative' }}>
          <svg width="350" height="350" viewBox="0 0 300 300">
            {pieSegments.map((segment, index) => (
              <path
                key={index}
                d={createPieSlice(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                opacity={hoveredSlice === index ? "1" : "0.9"}
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseEnter={() => setHoveredSlice(index)}
                onMouseMove={(e) => {
                  const svg = e.currentTarget.ownerSVGElement;
                  if (svg) {
                    const rect = svg.getBoundingClientRect();
                    setTooltipPos({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top
                    });
                  }
                }}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            ))}
            {/* Center text */}
            <text
              x="150"
              y="148"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: '24px', fontWeight: 600, fill: textColor }}
            >
              {showActualNumbers ? '1B' : '100%'}
            </text>
            <text
              x="150"
              y="165"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: '10px', fill: textColor, opacity: 0.6 }}
            >
              TOTAL SUPPLY
            </text>
          </svg>

          {/* Tooltip */}
          {hoveredSlice !== null && (
            <div
              className="absolute px-4 py-2 rounded-lg pointer-events-none"
              style={{
                background: 'white',
                border: '2px solid #8FB99E',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                top: `${tooltipPos.y}px`,
                left: `${tooltipPos.x}px`,
                transform: 'translate(-50%, -120%)',
                zIndex: 10,
                whiteSpace: 'nowrap'
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-[family-name:var(--font-inter)] font-semibold" style={{ color: textColor }}>
                  {tokenData[hoveredSlice].label}
                </span>
                <span className="text-xs font-[family-name:var(--font-inter)]" style={{ color: textColorMuted, opacity: 0.8 }}>
                  {showActualNumbers ? `${tokenData[hoveredSlice].tokens}M HYPE` : `${tokenData[hoveredSlice].value}%`}
                </span>
              </div>
            </div>
          )}
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3 justify-center flex-1">
            {tokenData.map((item, index) => (
              <div key={index} className="flex items-start gap-2.5">
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-[family-name:var(--font-inter)] leading-tight" style={{ color: textColor }}>
                    {item.label}
                  </span>
                  <span className="text-[11px] font-[family-name:var(--font-inter)] mt-0.5" style={{ color: textColorMuted, opacity: 0.6, whiteSpace: 'nowrap' }}>
                    {showActualNumbers ? `${item.tokens}M HYPE` : `${item.value}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>

      {/* Line Graph */}
      <div className="relative">
        {/* Top Tab */}
        <div
          className="absolute -top-8 left-0 px-6 py-2 backdrop-blur-3xl flex items-center transition-all duration-300 cursor-default"
          onMouseEnter={() => setHoveredTab('price')}
          onMouseLeave={() => setHoveredTab(null)}
          style={{
            background: hoveredTab === 'price'
              ? 'radial-gradient(circle at center, rgba(192, 211, 194, 0.35) 0%, rgba(192, 211, 194, 0.18) 50%, rgba(255, 255, 255, 0.15) 100%)'
              : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.18))',
            border: hoveredTab === 'price'
              ? '1px solid rgba(192, 211, 194, 0.4)'
              : '1px solid rgba(255, 255, 255, 0.35)',
            borderBottom: 'none',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            boxShadow: hoveredTab === 'price'
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
          <span className="text-sm font-[family-name:var(--font-cormorant)]" style={{ color: textColor }}>
            Token Price Prediction
          </span>
        </div>

        {/* Right Side Tabs with Icons - Bottom Right */}
        <div className="absolute -right-12 bottom-4 flex flex-col gap-2">
          {/* Top Tab - Tag Icon */}
          <div
            onClick={() => setShowCurrentPrice(!showCurrentPrice)}
            className="p-2 backdrop-blur-3xl flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105"
            style={{
              background: 'linear-gradient(to right, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.18))',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderLeft: 'none',
              borderTopRightRadius: '8px',
              borderBottomRightRadius: '8px',
              boxShadow: `
                inset 0 1px 2px rgba(0, 0, 0, 0.04),
                inset 0 -1px 1px rgba(255, 255, 255, 0.25),
                0 2px 6px rgba(0, 0, 0, 0.04),
                0 4px 12px rgba(0, 0, 0, 0.02)
              `,
              width: '48px',
              height: '48px',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#2E3837" viewBox="0 0 256 256">
              <path d="M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40a8,8,0,0,0-8,8v92.69A15.86,15.86,0,0,0,36.69,144L136,243.31a16,16,0,0,0,22.63,0l84.68-84.68a16,16,0,0,0,0-22.63Zm-96,96L48,132.69V48h84.69L232,147.31ZM96,84A12,12,0,1,1,84,72,12,12,0,0,1,96,84Z"></path>
            </svg>
          </div>

          {/* Middle Tab - Volume Icon */}
          <div
            onClick={() => setShow24hVolume(!show24hVolume)}
            className="p-2 backdrop-blur-3xl flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105"
            style={{
              background: 'linear-gradient(to right, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.18))',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderLeft: 'none',
              borderTopRightRadius: '8px',
              borderBottomRightRadius: '8px',
              boxShadow: `
                inset 0 1px 2px rgba(0, 0, 0, 0.04),
                inset 0 -1px 1px rgba(255, 255, 255, 0.25),
                0 2px 6px rgba(0, 0, 0, 0.04),
                0 4px 12px rgba(0, 0, 0, 0.02)
              `,
              width: '48px',
              height: '48px',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#2E3837" viewBox="0 0 256 256">
              <path d="M174,47.75a254.19,254.19,0,0,0-41.45-38.3,8,8,0,0,0-9.18,0A254.19,254.19,0,0,0,82,47.75C54.51,79.32,40,112.6,40,144a88,88,0,0,0,176,0C216,112.6,201.49,79.32,174,47.75ZM128,216a72.08,72.08,0,0,1-72-72c0-57.23,55.47-105,72-118,16.53,13,72,60.75,72,118A72.08,72.08,0,0,1,128,216Zm55.89-62.66a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68Z"></path>
            </svg>
          </div>

          {/* Bottom Tab - Trend Down Icon for Est. Drop */}
          <div
            onClick={() => setShowEstDrop(!showEstDrop)}
            className="p-2 backdrop-blur-3xl flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105"
            style={{
              background: 'linear-gradient(to right, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.18))',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderLeft: 'none',
              borderTopRightRadius: '8px',
              borderBottomRightRadius: '8px',
              boxShadow: `
                inset 0 1px 2px rgba(0, 0, 0, 0.04),
                inset 0 -1px 1px rgba(255, 255, 255, 0.25),
                0 2px 6px rgba(0, 0, 0, 0.04),
                0 4px 12px rgba(0, 0, 0, 0.02)
              `,
              width: '48px',
              height: '48px',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#2E3837" viewBox="0 0 256 256">
              <path d="M240,128a8,8,0,0,1-8,8H204.94l-37.78,75.58A8,8,0,0,1,160,216h-.4a8,8,0,0,1-7.08-5.14L95.35,60.76,63.28,131.31A8,8,0,0,1,56,136H24a8,8,0,0,1,0-16H50.85L88.72,44.69a8,8,0,0,1,14.76.46l57.51,151,31.85-63.71A8,8,0,0,1,200,128Z"></path>
            </svg>
          </div>
        </div>

        <div
          className="px-8 py-6 rounded-2xl backdrop-blur-3xl flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.18))',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            boxShadow: `
              inset 0 1px 2px rgba(0, 0, 0, 0.04),
              inset 0 -1px 1px rgba(255, 255, 255, 0.25),
              0 2px 6px rgba(0, 0, 0, 0.04),
              0 4px 12px rgba(0, 0, 0, 0.02)
            `,
            width: '550px',
            height: '400px',
          }}
        >
          {/* Price, Volume, and Est. Drop Displays */}
          {(showCurrentPrice || show24hVolume || showEstDrop) && (
            <div className="absolute top-4 right-4 flex gap-2">
              {/* Current Price Display */}
              {showCurrentPrice && (
                <div
                  className="px-2 py-1 rounded-lg backdrop-blur-sm"
                  style={{
                    background: 'rgba(143, 185, 158, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-[family-name:var(--font-inter)]" style={{ color: textColorMuted, opacity: 0.6 }}>
                      Current Price
                    </span>
                    <span className="text-sm font-[family-name:var(--font-inter)] font-semibold" style={{ color: textColor }}>
                      ${hypePrice}
                    </span>
                  </div>
                </div>
              )}

              {/* 24H Volume Display */}
              {show24hVolume && (
                <div
                  className="px-2 py-1 rounded-lg backdrop-blur-sm"
                  style={{
                    background: 'rgba(143, 185, 158, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-[family-name:var(--font-inter)]" style={{ color: textColorMuted, opacity: 0.6 }}>
                      24H Volume
                    </span>
                    <span className="text-sm font-[family-name:var(--font-inter)] font-semibold" style={{ color: textColor }}>
                      ${hypeVolume}M
                    </span>
                  </div>
                </div>
              )}

              {/* Estimated Drop Display */}
              {showEstDrop && (
                <div
                  className="relative px-2 py-1 rounded-lg backdrop-blur-sm cursor-help"
                  style={{
                    background: 'rgba(143, 185, 158, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  }}
                  onMouseEnter={() => setShowEstDropTooltip(true)}
                  onMouseLeave={() => setShowEstDropTooltip(false)}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-[family-name:var(--font-inter)]" style={{ color: textColorMuted, opacity: 0.6 }}>
                      Est. Drop
                    </span>
                    <span className="text-sm font-[family-name:var(--font-inter)] font-semibold" style={{ color: textColor }}>
                      {estimatedDrop}%
                    </span>
                  </div>

                  {/* Tooltip */}
                  {showEstDropTooltip && dropDetails && (
                    <div
                      className="absolute top-full right-0 mt-2 px-4 py-3 rounded-lg pointer-events-none z-50"
                      style={{
                        background: 'white',
                        border: '2px solid #8FB99E',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                        width: '280px',
                      }}
                    >
                      <div className="space-y-2">
                        {/* Title */}
                        <div className="border-b border-gray-200 pb-2 mb-2">
                          <span className="text-xs font-[family-name:var(--font-inter)] font-semibold" style={{ color: '#2E3837' }}>
                            Price Drop Calculation
                          </span>
                        </div>

                        {/* Parameters */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-[family-name:var(--font-inter)]" style={{ color: '#6B9080' }}>
                              Unlock Value:
                            </span>
                            <span className="text-[10px] font-[family-name:var(--font-inter)] font-semibold" style={{ color: '#2E3837' }}>
                              ${(dropDetails.params.unlockTotal / 1_000_000).toFixed(0)}M
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-[family-name:var(--font-inter)]" style={{ color: '#6B9080' }}>
                              Sell Pressure:
                            </span>
                            <span className="text-[10px] font-[family-name:var(--font-inter)] font-semibold" style={{ color: '#2E3837' }}>
                              {(dropDetails.params.sellRatio * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-[family-name:var(--font-inter)]" style={{ color: '#6B9080' }}>
                              Timeline:
                            </span>
                            <span className="text-[10px] font-[family-name:var(--font-inter)] font-semibold" style={{ color: '#2E3837' }}>
                              {dropDetails.params.sellDays} days
                            </span>
                          </div>
                        </div>

                        {/* Methodology */}
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <span className="text-[9px] font-[family-name:var(--font-inter)]" style={{ color: '#6B9080', lineHeight: '1.4' }}>
                            Calculated using orderbook depth analysis, market volatility (σ={MOCK_STRESS_DATA.volatility.sigma_7d.toFixed(3)}), 
                            order flow imbalance, and liquidity refill assumptions over the specified timeframe.
                          </span>
                        </div>

                        {/* Formula hint */}
                        <div className="bg-gray-50 px-2 py-1.5 rounded mt-2">
                          <span className="text-[9px] font-[family-name:var(--font-inter)] font-mono" style={{ color: '#2E3837' }}>
                            Impact = Σ(Daily Depth × Volatility × Flow Pressure)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + (i * (height - padding * 2)) / 4}
              x2={width - padding}
              y2={padding + (i * (height - padding * 2)) / 4}
              stroke="rgba(46, 56, 55, 0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Filled area under line */}
          <path
            d={areaPath}
            fill="rgba(143, 185, 158, 0.2)"
            stroke="none"
          />

          {/* Line path */}
          <path
            d={linePath}
            fill="none"
            stroke="#8FB99E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Y-axis labels */}
          {[minY, Math.round((minY + maxY) / 2), maxY].map((value, i) => (
            <text
              key={i}
              x={padding - 10}
              y={height - padding - (i * (height - padding * 2)) / 2}
              textAnchor="end"
              style={{ fontSize: '11px', fill: textColor, opacity: 0.6 }}
            >
              ${Math.round(value)}
            </text>
          ))}

          {/* X-axis labels - adaptive display to prevent overlap */}
          {lineData.map((point, i) => {
            // Determine label interval based on data length
            let showLabel = false;
            const dataLength = lineData.length;
            
            if (dataLength <= 5) {
              // Show all labels for 5 days or less
              showLabel = true;
            } else if (dataLength <= 10) {
              // Show every other label for 6-10 days
              showLabel = i % 2 === 0 || i === dataLength - 1;
            } else if (dataLength <= 15) {
              // Show every 3rd label for 11-15 days
              showLabel = i % 3 === 0 || i === dataLength - 1;
            } else if (dataLength <= 20) {
              // Show every 4th label for 16-20 days
              showLabel = i % 4 === 0 || i === dataLength - 1;
            } else {
              // Show every 5th label for 21+ days
              showLabel = i % 5 === 0 || i === dataLength - 1;
            }
            
            return showLabel ? (
              <text
                key={i}
                x={padding + (i / (lineData.length - 1)) * (width - padding * 2)}
                y={height - padding + 20}
                textAnchor="middle"
                style={{ fontSize: '10px', fill: textColor, opacity: 0.6 }}
              >
                {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            ) : null;
          })}
        </svg>
        </div>
      </div>
    </div>
  );
}
