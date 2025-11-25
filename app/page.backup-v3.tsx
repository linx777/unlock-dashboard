'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Target: November 29, 2025 2PM UTC
      const targetDate = new Date('2025-11-29T14:00:00Z');
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    setIsAnimating(true);
    // Navigate after animation completes (0.3 seconds)
    setTimeout(() => {
      router.push('/dashboard');
    }, 300);
  };

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Full-screen background image */}
      <Image
        src="/landing-bg-v3.png"
        alt="Background"
        fill
        style={{ objectFit: 'cover' }}
        priority
        quality={100}
      />

      {/* Countdown timer overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col gap-2">
          {/* "Click me" text */}
          <p
            className={`text-sm font-[family-name:var(--font-inter)] tracking-wide ${
              isAnimating ? 'animate-[fadeOut_0.3s_ease-out_forwards]' : ''
            }`}
            style={{ color: '#2E3837' }}
          >
            Click me
          </p>

          {/* Countdown timer - individual blocks */}
          <div className="flex gap-4 items-center">
          {/* Days */}
          <button
            onClick={handleClick}
            onMouseEnter={() => setHoveredBlock('days')}
            onMouseLeave={() => setHoveredBlock(null)}
            className={`px-6 py-4 rounded-2xl backdrop-blur-3xl transition-all hover:scale-[1.02] ${
              isAnimating ? 'animate-[fadeOut_0.3s_ease-out_forwards]' : 'duration-300'
            }`}
            style={{
              background: hoveredBlock === 'days'
                ? 'radial-gradient(circle at center, rgba(192, 211, 194, 0.35) 0%, rgba(192, 211, 194, 0.18) 50%, rgba(255, 255, 255, 0.15) 100%)'
                : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.18))',
              border: hoveredBlock === 'days'
                ? '1px solid rgba(192, 211, 194, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.35)',
              boxShadow: hoveredBlock === 'days'
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
            <div className="flex flex-col items-center">
              <span className="text-4xl font-[family-name:var(--font-inter)]" style={{ color: '#2E3837' }}>
                {formatNumber(timeLeft.days)}
              </span>
              <span className="text-xs uppercase tracking-wider mt-1" style={{ color: '#2E3837', opacity: 0.6 }}>
                DAYS
              </span>
            </div>
          </button>

          {/* Hours */}
          <button
            onClick={handleClick}
            onMouseEnter={() => setHoveredBlock('hours')}
            onMouseLeave={() => setHoveredBlock(null)}
            className={`px-6 py-4 rounded-2xl backdrop-blur-3xl transition-all hover:scale-[1.02] ${
              isAnimating ? 'animate-[fadeOut_0.3s_ease-out_forwards]' : 'duration-300'
            }`}
            style={{
              background: hoveredBlock === 'hours'
                ? 'radial-gradient(circle at center, rgba(192, 211, 194, 0.35) 0%, rgba(192, 211, 194, 0.18) 50%, rgba(255, 255, 255, 0.15) 100%)'
                : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.18))',
              border: hoveredBlock === 'hours'
                ? '1px solid rgba(192, 211, 194, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.35)',
              boxShadow: hoveredBlock === 'hours'
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
            <div className="flex flex-col items-center">
              <span className="text-4xl font-[family-name:var(--font-inter)]" style={{ color: '#2E3837' }}>
                {formatNumber(timeLeft.hours)}
              </span>
              <span className="text-xs uppercase tracking-wider mt-1" style={{ color: '#2E3837', opacity: 0.6 }}>
                HOURS
              </span>
            </div>
          </button>

          {/* Minutes */}
          <button
            onClick={handleClick}
            onMouseEnter={() => setHoveredBlock('minutes')}
            onMouseLeave={() => setHoveredBlock(null)}
            className={`px-6 py-4 rounded-2xl backdrop-blur-3xl transition-all hover:scale-[1.02] ${
              isAnimating ? 'animate-[fadeOut_0.3s_ease-out_forwards]' : 'duration-300'
            }`}
            style={{
              background: hoveredBlock === 'minutes'
                ? 'radial-gradient(circle at center, rgba(192, 211, 194, 0.35) 0%, rgba(192, 211, 194, 0.18) 50%, rgba(255, 255, 255, 0.15) 100%)'
                : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.18))',
              border: hoveredBlock === 'minutes'
                ? '1px solid rgba(192, 211, 194, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.35)',
              boxShadow: hoveredBlock === 'minutes'
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
            <div className="flex flex-col items-center">
              <span className="text-4xl font-[family-name:var(--font-inter)]" style={{ color: '#2E3837' }}>
                {formatNumber(timeLeft.minutes)}
              </span>
              <span className="text-xs uppercase tracking-wider mt-1" style={{ color: '#2E3837', opacity: 0.6 }}>
                MINS
              </span>
            </div>
          </button>

          {/* Seconds */}
          <button
            onClick={handleClick}
            onMouseEnter={() => setHoveredBlock('seconds')}
            onMouseLeave={() => setHoveredBlock(null)}
            className={`px-6 py-4 rounded-2xl backdrop-blur-3xl transition-all hover:scale-[1.02] ${
              isAnimating ? 'animate-[fadeOut_0.3s_ease-out_forwards]' : 'duration-300'
            }`}
            style={{
              background: hoveredBlock === 'seconds'
                ? 'radial-gradient(circle at center, rgba(192, 211, 194, 0.35) 0%, rgba(192, 211, 194, 0.18) 50%, rgba(255, 255, 255, 0.15) 100%)'
                : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.18))',
              border: hoveredBlock === 'seconds'
                ? '1px solid rgba(192, 211, 194, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.35)',
              boxShadow: hoveredBlock === 'seconds'
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
            <div className="flex flex-col items-center">
              <span className="text-4xl font-[family-name:var(--font-inter)]" style={{ color: '#2E3837' }}>
                {formatNumber(timeLeft.seconds)}
              </span>
              <span className="text-xs uppercase tracking-wider mt-1" style={{ color: '#2E3837', opacity: 0.6 }}>
                SECS
              </span>
            </div>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
