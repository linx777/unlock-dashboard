'use client';

import { useState, useEffect } from 'react';

interface ChartsPageProps {
  sellPressure?: number;
  executionTime?: number;
}

export default function ChartsPage({ sellPressure = 0, executionTime = 0 }: ChartsPageProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [showActualNumbers, setShowActualNumbers] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showCurrentPrice, setShowCurrentPrice] = useState(false);
  const [show24hVolume, setShow24hVolume] = useState(false);
  const [isDark, setIsDark] = useState(false);

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

  // Calculate dynamic price data based on buyback parameters
  const calculatePriceImpact = () => {
    const tokenUnlock = 314; // 314M tokens to unlock
    const baseSupply = 79.46; // Base circulating supply in millions

    // Real historical pattern from Nov 19-25 chart:
    // Nov 19: 38, Nov 21: Sharp drop to 32, Nov 22: Low at 30, Nov 23-24: Recovery to 31-32, Nov 25: 33
    const historicalPattern = [
      { date: '2025-11-19', basePrice: 38, label: 'Nov 19' },
      { date: '2025-11-21', basePrice: 32, label: 'Nov 21' }, // Sharp unlock drop
      { date: '2025-11-22', basePrice: 30, label: 'Nov 22' }, // Lowest point
      { date: '2025-11-23', basePrice: 31, label: 'Nov 23' }, // Recovery
      { date: '2025-11-25', basePrice: 33, label: 'Nov 25' }, // Current
    ];

    if (executionTime === 0 || sellPressure === 0) {
      // Natural scenario: Show historical pattern
      return historicalPattern.map(point => ({
        date: point.date,
        y: point.basePrice
      }));
    }

    // With buyback intervention: reduce the impact of the drop
    const buybackStrength = (executionTime / 30) * (sellPressure / 100);

    return historicalPattern.map((point, index) => {
      let adjustedPrice = point.basePrice;

      if (index >= 1) { // After the initial price
        // Calculate how much buybacks can mitigate the drop
        // Lower sell pressure + faster execution = better price support
        const priceSupport = (1 - buybackStrength) * 2; // Max 2x support
        const naturalDrop = 38 - point.basePrice; // How much it dropped naturally
        const mitigatedDrop = naturalDrop * (1 - (priceSupport * 0.3)); // Reduce drop by up to 30%
        adjustedPrice = Math.round((38 - mitigatedDrop) * 100) / 100;
      }

      return { date: point.date, y: adjustedPrice };
    });
  };

  const lineData = calculatePriceImpact();

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

  // Create filled area path (same as line, but closed at bottom)
  const areaPath = lineData
    .map((point, index) => {
      const x = padding + (index / (lineData.length - 1)) * (width - padding * 2);
      const y = height - padding - ((point.y - minY) / rangeY) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ') +
    ` L ${padding + (lineData.length - 1) / (lineData.length - 1) * (width - padding * 2)} ${height - padding}` +
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
            Token Price
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

          {/* Bottom Tab - Drop Icon */}
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
          {/* Price and Volume Displays */}
          {(showCurrentPrice || show24hVolume) && (
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
                      $32.40
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
                      $584.3M
                    </span>
                  </div>
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

          {/* X-axis labels - show all dates for 5 days */}
          {lineData.map((point, i) => (
            <text
              key={i}
              x={padding + (i / (lineData.length - 1)) * (width - padding * 2)}
              y={height - padding + 20}
              textAnchor="middle"
              style={{ fontSize: '10px', fill: textColor, opacity: 0.6 }}
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
