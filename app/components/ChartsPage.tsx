'use client';

import { useState } from 'react';

interface ChartsPageProps {
  sellPressure?: number;
  executionTime?: number;
}

export default function ChartsPage({ sellPressure = 0, executionTime = 0 }: ChartsPageProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [showActualNumbers, setShowActualNumbers] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Token allocation data
  const tokenData = [
    { label: 'Future Emissions & Community', value: 38.89, tokens: 388.88, color: '#6B9080' },
    { label: 'Genesis Distribution', value: 31.0, tokens: 310.0, color: '#8FB99E' },
    { label: 'Core Contributors', value: 23.8, tokens: 238.0, color: '#A8C5B8' },
    { label: 'Hyper Foundation', value: 6.0, tokens: 60.0, color: '#C0D3C2' },
    { label: 'Community Grants', value: 0.3, tokens: 3.0, color: '#D4E3D5' },
    { label: 'HIP-2', value: 0.01, tokens: 0.1, color: '#E8F0EC' },
  ];

  // Calculate dynamic price data based on buyback parameters
  const calculatePriceImpact = () => {
    const basePrice = 50; // Starting price
    const tokenUnlock = 134; // 134M tokens to unlock
    const baseSupply = 79.46; // Base circulating supply in millions
    const dates = ['2025-11-22', '2025-11-23', '2025-11-24', '2025-11-25', '2025-11-26'];

    // Natural scenario: assume tokens unlock over 30 days with 60% sell pressure
    const naturalUnlockDays = 30;
    const naturalSellPressure = 60; // 60% of unlocked tokens get sold
    const naturalDailyUnlock = tokenUnlock / naturalUnlockDays;
    const naturalTokensSold = naturalDailyUnlock * (naturalSellPressure / 100);
    const naturalPriceImpactPerDay = (naturalTokensSold / baseSupply) * 1.2; // Natural decline rate

    // Buyback scenario (if sliders are adjusted)
    let buybackPriceImpactPerDay = naturalPriceImpactPerDay;

    if (executionTime > 0 && sellPressure > 0) {
      // With buybacks: tokens are bought back, reducing sell pressure
      const dailyUnlock = tokenUnlock / executionTime;
      const tokensToSell = dailyUnlock * (sellPressure / 100);
      buybackPriceImpactPerDay = (tokensToSell / baseSupply) * 1.2;
    }

    // Generate 5 days of data
    return dates.map((date, index) => {
      // Use buyback scenario if sliders are adjusted, otherwise natural scenario
      const priceImpactPerDay = (executionTime > 0 && sellPressure > 0)
        ? buybackPriceImpactPerDay
        : naturalPriceImpactPerDay;

      const priceChange = index * priceImpactPerDay * basePrice;
      const newPrice = Math.max(basePrice - priceChange, basePrice * 0.3); // Don't drop below 30% of base
      return { date, y: Math.round(newPrice * 100) / 100 };
    });
  };

  const lineData = calculatePriceImpact();

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

  // Create line graph path
  const maxY = Math.max(...lineData.map(d => d.y));
  const minY = Math.min(...lineData.map(d => d.y));
  const rangeY = maxY - minY;
  const width = 450;
  const height = 250;
  const padding = 40;

  const linePath = lineData
    .map((point, index) => {
      const x = padding + (index / (lineData.length - 1)) * (width - padding * 2);
      const y = height - padding - ((point.y - minY) / rangeY) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

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
          <span className="text-sm font-[family-name:var(--font-cormorant)]" style={{ color: '#2E3837' }}>
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
              style={{ fontSize: '24px', fontWeight: 600, fill: '#2E3837' }}
            >
              {showActualNumbers ? '1B' : '100%'}
            </text>
            <text
              x="150"
              y="165"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: '10px', fill: '#2E3837', opacity: 0.6 }}
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
                <span className="text-sm font-[family-name:var(--font-inter)] font-semibold" style={{ color: '#2E3837' }}>
                  {tokenData[hoveredSlice].label}
                </span>
                <span className="text-xs font-[family-name:var(--font-inter)]" style={{ color: '#2E3837', opacity: 0.8 }}>
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
                  <span className="text-xs font-[family-name:var(--font-inter)] leading-tight" style={{ color: '#2E3837' }}>
                    {item.label}
                  </span>
                  <span className="text-[11px] font-[family-name:var(--font-inter)] mt-0.5" style={{ color: '#2E3837', opacity: 0.6, whiteSpace: 'nowrap' }}>
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
        {/* Tab */}
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
          <span className="text-sm font-[family-name:var(--font-cormorant)]" style={{ color: '#2E3837' }}>
            Token Price
          </span>
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
          {/* Current Price Display */}
          <div
            className="absolute top-4 right-4 px-3 py-2 rounded-lg"
            style={{
              background: 'white',
              border: '2px solid #8FB99E',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-[family-name:var(--font-inter)]" style={{ color: '#2E3837', opacity: 0.6 }}>
                Current Price
              </span>
              <span className="text-lg font-[family-name:var(--font-inter)] font-semibold" style={{ color: '#2E3837' }}>
                ${lineData[lineData.length - 1].y}
              </span>
            </div>
          </div>
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
              style={{ fontSize: '11px', fill: '#2E3837', opacity: 0.6 }}
            >
              ${value}
            </text>
          ))}

          {/* X-axis labels - show all dates for 5 days */}
          {lineData.map((point, i) => (
            <text
              key={i}
              x={padding + (i / (lineData.length - 1)) * (width - padding * 2)}
              y={height - padding + 20}
              textAnchor="middle"
              style={{ fontSize: '10px', fill: '#2E3837', opacity: 0.6 }}
            >
              {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          ))}
        </svg>
        </div>
      </div>
    </div>
  );
}
