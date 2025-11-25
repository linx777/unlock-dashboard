'use client';

export default function ChartsPage() {
  // Token allocation data
  const tokenData = [
    { label: 'Community', value: 51.0, color: '#8FB99E' },
    { label: 'Team', value: 23.8, color: '#A8C5B8' },
    { label: 'Treasury', value: 15.0, color: '#C0D3C2' },
    { label: 'Investors', value: 10.2, color: '#D4E3D5' },
  ];

  // Line graph data - sample token price over time
  const lineData = [
    { x: 0, y: 30 },
    { x: 1, y: 35 },
    { x: 2, y: 32 },
    { x: 3, y: 38 },
    { x: 4, y: 42 },
    { x: 5, y: 40 },
    { x: 6, y: 45 },
    { x: 7, y: 48 },
    { x: 8, y: 46 },
    { x: 9, y: 50 },
  ];

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
  const width = 400;
  const height = 200;
  const padding = 40;

  const linePath = lineData
    .map((point, index) => {
      const x = padding + (point.x / (lineData.length - 1)) * (width - padding * 2);
      const y = height - padding - ((point.y - minY) / rangeY) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="flex gap-6 w-full justify-center">
      {/* Pie Chart - Token Allocation */}
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
          width: '450px',
        }}
      >
        <h3 className="text-lg font-[family-name:var(--font-cormorant)] mb-6" style={{ color: '#2E3837' }}>
          Token Allocation
        </h3>

        <div className="flex items-center gap-8">
          {/* Pie Chart SVG */}
          <svg width="300" height="300" viewBox="0 0 300 300">
            {pieSegments.map((segment, index) => (
              <path
                key={index}
                d={createPieSlice(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                opacity="0.9"
              />
            ))}
            {/* Center text */}
            <text
              x="150"
              y="145"
              textAnchor="middle"
              style={{ fontSize: '32px', fontWeight: 600, fill: '#2E3837' }}
            >
              100%
            </text>
            <text
              x="150"
              y="165"
              textAnchor="middle"
              style={{ fontSize: '12px', fill: '#2E3837', opacity: 0.6 }}
            >
              TOTAL SUPPLY
            </text>
          </svg>

          {/* Legend */}
          <div className="flex flex-col gap-3">
            {tokenData.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    backgroundColor: item.color,
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-[family-name:var(--font-inter)]" style={{ color: '#2E3837' }}>
                    {item.label}
                  </span>
                  <span className="text-xs font-[family-name:var(--font-inter)]" style={{ color: '#2E3837', opacity: 0.6 }}>
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Line Graph */}
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
          width: '500px',
        }}
      >
        <h3 className="text-lg font-[family-name:var(--font-cormorant)] mb-6" style={{ color: '#2E3837' }}>
          Token Price History
        </h3>

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
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {lineData.map((point, index) => {
            const x = padding + (point.x / (lineData.length - 1)) * (width - padding * 2);
            const y = height - padding - ((point.y - minY) / rangeY) * (height - padding * 2);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#8FB99E"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}

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

          {/* X-axis labels */}
          {[0, 3, 6, 9].map((i) => (
            <text
              key={i}
              x={padding + (i / (lineData.length - 1)) * (width - padding * 2)}
              y={height - padding + 20}
              textAnchor="middle"
              style={{ fontSize: '11px', fill: '#2E3837', opacity: 0.6 }}
            >
              Day {i}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
