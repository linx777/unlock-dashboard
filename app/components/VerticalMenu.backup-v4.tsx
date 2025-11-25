'use client';

import { useState } from 'react';

interface VerticalMenuProps {
  onMenuChange?: (index: number) => void;
}

export default function VerticalMenu({ onMenuChange }: VerticalMenuProps) {
  const [activeItem, setActiveItem] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const handleMenuClick = (index: number) => {
    setActiveItem(index);
    if (onMenuChange) {
      onMenuChange(index);
    }
  };

  const menuItems = [
    { icon: 'house', label: 'Charts' },
    { icon: 'armchair', label: 'Dashboard' },
    { icon: '⚙️', label: 'Settings' },
    { icon: '📈', label: 'Analytics' },
  ];

  return (
    <div
      className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 px-3 py-4 rounded-2xl backdrop-blur-3xl"
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
      <div className="flex flex-col gap-3">
        {menuItems.map((item, index) => (
          <div key={index} className="relative">
            <button
              onClick={() => handleMenuClick(index)}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                background: activeItem === index
                  ? 'rgba(46, 56, 55, 0.9)'
                  : 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                boxShadow: activeItem === index
                  ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                  : '0 2px 6px rgba(0, 0, 0, 0.08)'
              }}
              aria-label={item.label}
            >
            {item.icon === 'house' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill={activeItem === index ? "#ffffff" : "#2E3837"} viewBox="0 0 256 256">
                <path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z"></path>
              </svg>
            ) : item.icon === 'armchair' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill={activeItem === index ? "#ffffff" : "#2E3837"} viewBox="0 0 256 256">
                <path d="M216,88.8V72a40,40,0,0,0-40-40H80A40,40,0,0,0,40,72V88.8a40,40,0,0,0,0,78.4V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V167.2a40,40,0,0,0,0-78.4ZM80,48h96a24,24,0,0,1,24,24V88.8A40.07,40.07,0,0,0,168,128H88A40.07,40.07,0,0,0,56,88.8V72A24,24,0,0,1,80,48ZM208.39,152H208a8,8,0,0,0-8,8v40H56V160a8,8,0,0,0-8-8h-.39A24,24,0,1,1,72,128v40a8,8,0,0,0,16,0V144h80v24a8,8,0,0,0,16,0V128a24,24,0,1,1,24.39,24Z"></path>
              </svg>
            ) : (
              <span style={{ fontSize: '20px' }}>
                {item.icon}
              </span>
            )}
            </button>

            {/* Hover label */}
            {hoveredItem === index && (
              <div
                className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-xl backdrop-blur-3xl whitespace-nowrap"
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
                <span className="text-sm font-[family-name:var(--font-inter)] font-medium" style={{ color: '#2E3837' }}>
                  {item.label}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
