'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function GamesPage() {
  const [hoveredTab, setHoveredTab] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(false);

  const handleGameClick = () => {
    window.open('https://www.monad.surf/', '_blank', 'noopener,noreferrer');
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
          Games
        </span>
      </div>

      {/* Game Card */}
      <div
        className="rounded-2xl backdrop-blur-3xl overflow-hidden cursor-pointer transition-all duration-300"
        onClick={handleGameClick}
        onMouseEnter={() => setHoveredCard(true)}
        onMouseLeave={() => setHoveredCard(false)}
        style={{
          background: hoveredCard
            ? 'linear-gradient(to bottom, rgba(192, 211, 194, 0.3), rgba(192, 211, 194, 0.2))'
            : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.18))',
          border: hoveredCard
            ? '1px solid rgba(192, 211, 194, 0.5)'
            : '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: hoveredCard
            ? `
              inset 0 1px 2px rgba(192, 211, 194, 0.08),
              inset 0 -1px 1px rgba(255, 255, 255, 0.3),
              0 8px 16px rgba(0, 0, 0, 0.08),
              0 12px 24px rgba(0, 0, 0, 0.06)
            `
            : `
              inset 0 1px 2px rgba(0, 0, 0, 0.04),
              inset 0 -1px 1px rgba(255, 255, 255, 0.25),
              0 2px 6px rgba(0, 0, 0, 0.04),
              0 4px 12px rgba(0, 0, 0, 0.02)
            `,
          transform: hoveredCard ? 'translateY(-4px)' : 'translateY(0)',
          maxWidth: '600px',
        }}
      >
        <div className="p-6">
          {/* Game Thumbnail */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4">
            <Image
              src="/monad-surf.png"
              alt="Monad Surf Game"
              fill
              className="object-cover"
            />
          </div>

          {/* Game Info */}
          <div className="flex flex-col gap-2">
            <h3 
              className="text-xl font-[family-name:var(--font-cormorant)] font-semibold"
              style={{ color: '#2E3837' }}
            >
              Monad Surf
            </h3>
            <p 
              className="text-sm font-[family-name:var(--font-inter)]"
              style={{ color: '#2E3837', opacity: 0.7 }}
            >
              Experience the thrill of surfing on Monad. Click to play!
            </p>
            
            {/* External Link Indicator */}
            <div className="flex items-center gap-2 mt-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                fill="#6B9080" 
                viewBox="0 0 256 256"
              >
                <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z"></path>
              </svg>
              <span 
                className="text-xs font-[family-name:var(--font-inter)]"
                style={{ color: '#6B9080' }}
              >
                monad.surf
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
