'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import ThemeToggle from "../components/ThemeToggle";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [sellPressure, setSellPressure] = useState(100); // 1-100%
  const [executionTime, setExecutionTime] = useState(30); // 1-30 days
  const [tokenLabel, setTokenLabel] = useState('Token value unlock');
  const [tokenValue, setTokenValue] = useState('$314 Million');
  const [isDark, setIsDark] = useState(false);

  const toggleTokenLabel = () => {
    setTokenLabel(prev => {
      const newLabel = prev === 'Token value unlock' ? 'Token size unlock' : 'Token value unlock';
      setTokenValue(newLabel === 'Token size unlock' ? '2.66% of total supply' : '$314 Million');
      return newLabel;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    // Check initial theme
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Target: November 29, 2025 2PM UTC
  const targetDate = new Date('2025-11-29T14:00:00Z');

  // Start: Current time (beginning of today)
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  // Calculate total hours from start to target (1-hour intervals)
  const totalIntervals = Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));

  // Calculate hours that have passed from start
  const now = new Date();
  const intervalsPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60));

  // Build days array from today to Nov 29
  const days = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let currentDay = new Date(startDate);
  while (currentDay <= targetDate) {
    days.push({
      name: daysOfWeek[currentDay.getDay()],
      date: new Date(currentDay)
    });
    currentDay.setDate(currentDay.getDate() + 1);
  }

  // Calculate intervals per day (24 hours per day)
  const intervalsPerDay = 24;

  // Calculate displayed stats based on selected cell or defaults
  const getDisplayStats = () => {
    if (selectedCell) {
      const revenue = (5.50 + (selectedCell.col / 28) * (8.00 - 5.50)).toFixed(3);
      const price = (50 - (selectedCell.row / 17) * (50 - 34)).toFixed(2);
      const intensity = (selectedCell.row + selectedCell.col) / (18 + 29 - 2);
      const years = (1.2 + intensity * 0.8).toFixed(2);
      const supply = (79.46 + Math.random() * 0.5).toFixed(2); // Sample calculation

      return {
        revenue: `$${revenue}M`,
        price: `$${price}`,
        supply: `${supply}M`,
        years: `${years}yrs`
      };
    }

    // Default values
    return {
      revenue: '$6.803M',
      price: '$41.49',
      supply: '79.46M',
      years: '1.33yrs'
    };
  };

  const displayStats = getDisplayStats();

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Full-screen background image */}
      <Image
        src={isDark ? "/dark-mode-bg-v2.jpg" : "/dashboard-bg.png"}
        alt="Dashboard Background"
        fill
        style={{ objectFit: 'cover' }}
        priority
        quality={100}
        key={isDark ? 'dark' : 'light'}
      />

      {/* Content container */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex flex-col gap-12">
        {/* Timeline at top */}
        <div className="flex flex-col items-center gap-4">
          {/* Subtle line with reminder text */}
          <div className="relative w-full">
            <div
              style={{
                width: '100%',
                height: '1px',
                background: 'linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0))',
              }}
            />
            <div className="absolute top-0 right-0 transform -translate-y-full pb-1">
              <span className="text-xs font-[family-name:var(--font-cormorant)]" style={{ color: '#2E3837', opacity: 0.6 }}>
                Time to unlock till 29 Nov. 1 dot represents an hour.
              </span>
            </div>
          </div>

          {/* Days with dots grouped */}
          <div className="flex gap-6">
            {days.map((day, dayIndex) => {
              const dayStartInterval = dayIndex * intervalsPerDay;
              const dayEndInterval = Math.min(dayStartInterval + intervalsPerDay, totalIntervals);
              const dotsInDay = dayEndInterval - dayStartInterval;

              return (
                <div key={dayIndex} className="flex flex-col gap-2">
                  {/* Day label */}
                  <div className="text-center">
                    <span
                      className="text-sm font-[family-name:var(--font-inter)]"
                      style={{ color: '#2E3837' }}
                    >
                      {day.name}
                    </span>
                  </div>

                  {/* Dots for this day - 2 rows of 12 */}
                  <div className="flex gap-1.5 flex-wrap" style={{ width: '140px' }}>
                    {Array.from({ length: dotsInDay }).map((_, dotIndex) => {
                      const absoluteIndex = dayStartInterval + dotIndex;
                      const isPassed = absoluteIndex < intervalsPassed;

                      return (
                        <div
                          key={dotIndex}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: isPassed
                              ? 'rgba(255, 255, 255, 0.9)'
                              : 'rgba(46, 56, 55, 0.15)',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sliders */}
        <div className="flex gap-4 justify-center">
          {/* Token Value Display */}
          <div>
            {/* Label */}
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg font-[family-name:var(--font-cormorant)]" style={{ color: '#2E3837' }}>
                {tokenLabel}
              </span>
              <button
                onClick={toggleTokenLabel}
                className="flex items-center justify-center rounded-full cursor-pointer transition-all hover:scale-110"
                style={{
                  width: '20px',
                  height: '20px',
                  border: '0.5px solid white',
                  backgroundColor: 'transparent'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#ffffff" viewBox="0 0 256 256">
                  <path d="M224,48V152a16,16,0,0,1-16,16H99.31l10.35,10.34a8,8,0,0,1-11.32,11.32l-24-24a8,8,0,0,1,0-11.32l24-24a8,8,0,0,1,11.32,11.32L99.31,152H208V48H96v8a8,8,0,0,1-16,0V48A16,16,0,0,1,96,32H208A16,16,0,0,1,224,48ZM168,192a8,8,0,0,0-8,8v8H48V104H156.69l-10.35,10.34a8,8,0,0,0,11.32,11.32l24-24a8,8,0,0,0,0-11.32l-24-24a8,8,0,0,0-11.32,11.32L156.69,88H48a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16H160a16,16,0,0,0,16-16v-8A8,8,0,0,0,168,192Z"></path>
                </svg>
              </button>
            </div>

            {/* Number display aligned to bottom */}
            <div className="relative flex items-end" style={{ height: '48px' }}>
              {tokenLabel === 'Token size unlock' ? (
                <div className="flex flex-col justify-end" style={{ transform: 'translateY(5px)' }}>
                  <span className="text-3xl font-[family-name:var(--font-inter)] font-semibold leading-none" style={{ color: '#2E3837' }}>
                    2.66%
                  </span>
                  <span className="text-xs font-[family-name:var(--font-inter)]" style={{ color: '#2E3837', opacity: 0.7 }}>
                    of total supply
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-[family-name:var(--font-inter)] font-semibold" style={{ color: '#2E3837', transform: 'translateY(5px)' }}>
                  {tokenValue}
                </span>
              )}
            </div>
          </div>

          {/* Sell Pressure Slider */}
          <div style={{ width: '220px' }}>
            {/* Value label */}
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg font-[family-name:var(--font-cormorant)]" style={{ color: '#2E3837' }}>
                Sell pressure
              </span>
              <span className="text-base font-[family-name:var(--font-inter)] font-semibold" style={{ color: '#2E3837' }}>
                {sellPressure}%
              </span>
            </div>

            {/* Slider bar */}
            <div className="relative" style={{ height: '48px' }}>
              {/* Slider input - full area */}
              <input
                type="range"
                min="1"
                max="100"
                value={sellPressure}
                onChange={(e) => setSellPressure(Number(e.target.value))}
                className="absolute w-full cursor-pointer"
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  background: 'transparent',
                  top: 0,
                  left: 0,
                  height: '48px',
                  zIndex: 30,
                  margin: 0,
                  padding: 0
                }}
              />

              {/* Background bar */}
              <div
                className="absolute left-0 right-0 rounded-lg overflow-hidden pointer-events-none"
                style={{
                  top: '24px',
                  height: '24px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.5)'
                }}
              >
                {/* Filled portion with translucent white */}
                <div
                  className="h-full rounded-lg"
                  style={{
                    width: `${sellPressure}%`,
                    background: 'rgba(255, 255, 255, 0.25)'
                  }}
                />
              </div>

              {/* Knob with line - sticks out above */}
              <div
                className="absolute pointer-events-none flex flex-col items-center"
                style={{
                  left: `${sellPressure}%`,
                  top: 0,
                  transform: 'translateX(-50%)',
                  zIndex: 20
                }}
              >
                {/* Knob */}
                <div
                  className="rounded-full"
                  style={{
                    width: '14px',
                    height: '14px',
                    background: 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid white'
                  }}
                />
                {/* Vertical line connecting to bar */}
                <div
                  style={{
                    width: '1px',
                    height: '10px',
                    background: 'rgba(255, 255, 255, 0.6)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Timeline Slider */}
          <div style={{ width: '220px' }}>
            {/* Value label */}
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg font-[family-name:var(--font-cormorant)]" style={{ color: '#2E3837' }}>
                Timeline
              </span>
              <span className="text-base font-[family-name:var(--font-inter)] font-semibold" style={{ color: '#2E3837' }}>
                {executionTime} Days
              </span>
            </div>

            {/* Slider bar */}
            <div className="relative" style={{ height: '48px' }}>
              {/* Slider input - full area */}
              <input
                type="range"
                min="1"
                max="30"
                value={executionTime}
                onChange={(e) => setExecutionTime(Number(e.target.value))}
                className="absolute w-full cursor-pointer"
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  background: 'transparent',
                  top: 0,
                  left: 0,
                  height: '48px',
                  zIndex: 30,
                  margin: 0,
                  padding: 0
                }}
              />

              {/* Background bar */}
              <div
                className="absolute left-0 right-0 rounded-lg overflow-hidden pointer-events-none"
                style={{
                  top: '24px',
                  height: '24px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.5)'
                }}
              >
                {/* Filled portion with translucent white */}
                <div
                  className="h-full rounded-lg"
                  style={{
                    width: `${(executionTime / 30) * 100}%`,
                    background: 'rgba(255, 255, 255, 0.25)'
                  }}
                />
              </div>

              {/* Knob with line - sticks out above */}
              <div
                className="absolute pointer-events-none flex flex-col items-center"
                style={{
                  left: `${(executionTime / 30) * 100}%`,
                  top: 0,
                  transform: 'translateX(-50%)',
                  zIndex: 20
                }}
              >
                {/* Knob */}
                <div
                  className="rounded-full"
                  style={{
                    width: '14px',
                    height: '14px',
                    background: 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid white'
                  }}
                />
                {/* Vertical line connecting to bar */}
                <div
                  style={{
                    width: '1px',
                    height: '10px',
                    background: 'rgba(255, 255, 255, 0.6)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="flex flex-col gap-4">
          {/* Stats boxes */}
          <div className="flex gap-3">
            {['Daily Revenue', 'Price', 'Circulating Supply', 'Years'].map((label, i) => (
              <div
                key={i}
                className="px-6 py-3 rounded-2xl backdrop-blur-3xl"
                style={{
                  background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.18))',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  boxShadow: `
                    inset 0 1px 2px rgba(0, 0, 0, 0.04),
                    inset 0 -1px 1px rgba(255, 255, 255, 0.25),
                    0 2px 6px rgba(0, 0, 0, 0.04),
                    0 4px 12px rgba(0, 0, 0, 0.02)
                  `
                }}
              >
                <div className="text-xs font-[family-name:var(--font-inter)] text-gray-600 mb-1">
                  {label}
                </div>
                <div className="text-lg font-[family-name:var(--font-inter)] font-semibold" style={{ color: '#2E3837' }}>
                  {i === 0 && displayStats.revenue}
                  {i === 1 && displayStats.price}
                  {i === 2 && displayStats.supply}
                  {i === 3 && displayStats.years}
                </div>
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div
            className="px-6 py-4 rounded-2xl backdrop-blur-3xl"
            style={{
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.18))',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              boxShadow: `
                inset 0 1px 2px rgba(0, 0, 0, 0.04),
                inset 0 -1px 1px rgba(255, 255, 255, 0.25),
                0 2px 6px rgba(0, 0, 0, 0.04),
                0 4px 12px rgba(0, 0, 0, 0.02)
              `
            }}
          >
            <div className="flex gap-2 items-start">
              {/* Y-axis label (rotated) */}
              <div className="flex items-center justify-center" style={{ width: '20px', alignSelf: 'stretch' }}>
                <span
                  className="text-xs font-[family-name:var(--font-inter)] whitespace-nowrap"
                  style={{
                    color: '#2E3837',
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'center center'
                  }}
                >
                  Price ($)
                </span>
              </div>

              {/* Y-axis labels */}
              <div className="flex flex-col justify-between" style={{ height: `${18 * 20}px` }}>
                {[50, 48, 46, 44, 42, 40, 38, 36, 34].map((val) => (
                  <div key={val} className="text-xs font-[family-name:var(--font-inter)]" style={{ color: '#2E3837' }}>
                    {val}
                  </div>
                ))}
              </div>

              {/* Heatmap cells */}
              <div className="flex flex-col relative">
                {/* Dotted crosshair lines */}
                {hoveredCell && (() => {
                  // Calculate actual values based on position
                  const revenue = (5.50 + (hoveredCell.col / 28) * (8.00 - 5.50)).toFixed(2);
                  const price = (50 - (hoveredCell.row / 17) * (50 - 34)).toFixed(2);
                  const intensity = (hoveredCell.row + hoveredCell.col) / (18 + 29 - 2);
                  const years = (1.2 + intensity * 0.8).toFixed(2);

                  return (
                    <>
                      {/* Horizontal line */}
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          top: `${hoveredCell.row * 20 + 10}px`,
                          left: 0,
                          right: 0,
                          height: '1px',
                          borderTop: '2px dashed rgba(255, 255, 255, 0.6)',
                          zIndex: 10
                        }}
                      />
                      {/* Vertical line */}
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          left: `${hoveredCell.col * 20 + 10}px`,
                          top: 0,
                          bottom: 0,
                          width: '1px',
                          borderLeft: '2px dashed rgba(255, 255, 255, 0.6)',
                          zIndex: 10
                        }}
                      />
                      {/* Tooltip */}
                      <div
                        className="absolute pointer-events-none px-3 py-2 rounded"
                        style={{
                          top: `${hoveredCell.row * 20 - 40}px`,
                          left: `${hoveredCell.col * 20 + 30}px`,
                          background: 'rgba(255, 255, 255, 0.95)',
                          color: '#2E3837',
                          fontSize: '11px',
                          fontFamily: 'var(--font-inter)',
                          fontWeight: 600,
                          zIndex: 20,
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                        }}
                      >
                        Revenue: {revenue}, Price: {price}, Years: {years}
                      </div>
                    </>
                  );
                })()}

                {Array.from({ length: 18 }).map((_, rowIndex) => (
                  <div key={rowIndex} className="flex">
                    {Array.from({ length: 29 }).map((_, colIndex) => {
                      // Generate sample data - diagonal gradient (top-left to bottom-right)
                      const intensity = (rowIndex + colIndex) / (18 + 29 - 2);

                      // Color palette from orange/red to blue (reversed)
                      let r, g, b;
                      if (intensity < 0.5) {
                        // Orange/red to light blue
                        const t = intensity * 2;
                        r = Math.floor(255 - t * 135);  // 255 -> 120
                        g = Math.floor(100 + t * 100);  // 100 -> 200
                        b = Math.floor(55 + t * 200);   // 55 -> 255
                      } else {
                        // Light blue to dark blue
                        const t = (intensity - 0.5) * 2;
                        r = Math.floor(120 - t * 90);   // 120 -> 30
                        g = Math.floor(200 - t * 150);  // 200 -> 50
                        b = Math.floor(255 - t * 135);  // 255 -> 120
                      }

                      const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex;

                      return (
                        <div
                          key={colIndex}
                          className="w-5 h-5 flex items-center justify-center cursor-pointer"
                          onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                          style={{
                            background: `rgb(${r}, ${g}, ${b})`,
                            position: 'relative',
                            zIndex: isHovered ? 15 : 1
                          }}
                        >
                          <span className="text-[8px] font-[family-name:var(--font-inter)] text-white opacity-80">
                            {(1.2 + intensity * 0.8).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* X-axis labels */}
                <div className="flex justify-between mt-2" style={{ width: '100%' }}>
                  {[5.50, 6.00, 6.50, 7.00, 7.50, 8.00].map((val, i) => (
                    <div
                      key={i}
                      className="text-xs font-[family-name:var(--font-inter)]"
                      style={{ color: '#2E3837', textAlign: 'center' }}
                    >
                      {val.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Color scale legend */}
              <div className="ml-6 flex flex-col" style={{ height: `${18 * 20}px` }}>
                {/* Years label */}
                <div className="text-xs font-[family-name:var(--font-inter)] mb-2" style={{ color: '#2E3837' }}>
                  Years
                </div>

                {/* Gradient bar with values */}
                <div className="flex flex-1">
                  <div
                    className="w-6 rounded"
                    style={{
                      background: 'linear-gradient(to bottom, rgb(255, 100, 55), rgb(200, 150, 100), rgb(120, 200, 255), rgb(30, 50, 120))'
                    }}
                  />

                  {/* Values beside gradient */}
                  <div className="flex flex-col justify-between ml-2">
                    {[2.2, 2.0, 1.8, 1.6, 1.4, 1.2].map((val) => (
                      <div key={val} className="text-xs font-[family-name:var(--font-inter)]" style={{ color: '#2E3837' }}>
                        {val}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* X-axis label */}
            <div className="text-center mt-2">
              <span className="text-xs font-[family-name:var(--font-inter)]" style={{ color: '#2E3837' }}>
                Daily Revenue ($M)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
