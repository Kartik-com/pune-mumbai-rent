import React, { useEffect, useState } from 'react';

const NEIGHBORHOODS = ['Pune', 'Mumbai'];

export default function MapLoader({ isReady }: { isReady: boolean }) {
  const [activeName, setActiveName] = useState('');

  useEffect(() => {
    if (isReady) return;
    const interval = setInterval(() => {
      setActiveName(NEIGHBORHOODS[Math.floor(Math.random() * NEIGHBORHOODS.length)]);
    }, 150);
    return () => clearInterval(interval);
  }, [isReady]);

  return (
    <div 
      className={`fixed inset-0 z-[2500] bg-[#0f0f0f] flex items-center justify-center transition-opacity duration-400 ease-in-out pointer-events-none overflow-hidden ${
        isReady ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ perspective: '1000px' }}
    >
      {/* 3D Tilted Grid Floor */}
      <div 
        className="absolute inset-0 origin-bottom"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(232, 197, 71, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(232, 197, 71, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: 'rotateX(60deg) translateY(-10%)',
          animation: 'grid-move 20s linear infinite',
          height: '200%',
          top: '-50%'
        }}
      />

      {/* Dynamic Data Pillars */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 bg-accent/40 rounded-full"
            style={{
              height: `${Math.random() * 80 + 20}px`,
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 60 + 20}%`,
              boxShadow: '0 0 15px var(--accent)',
              animation: 'pillar-rise 1.2s ease-out infinite alternate',
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>

      {/* Global Scanline */}
      <div 
        className="absolute inset-x-0 h-[2px] bg-accent/30 shadow-[0_0_15px_var(--accent)] z-10"
        style={{ animation: 'scanline 2s linear infinite' }}
      />

      {/* Focal Content */}
      <div className="relative z-20 flex flex-col items-center gap-6">
        {/* Animated Neighborhood Indicator */}
        <div className="flex flex-col items-center">
            <span className="text-[10px] font-syn font-bold text-accent/60 uppercase tracking-[0.4em] mb-2 opacity-50">Localizing</span>
            <div className="h-8 flex items-center justify-center">
                <span className="text-xl font-syn font-black uppercase tracking-widest text-text1 animate-pulse">
                    {activeName}
                </span>
            </div>
        </div>

        {/* Progress Bar UI */}
        <div className="w-48 h-1 bg-surface rounded-full overflow-hidden border border-border1 p-[1px]">
          <div className="h-full bg-accent rounded-full animation-loading-bar" />
        </div>

        <div className="text-[9px] font-syn font-bold uppercase tracking-[0.2em] text-text3 flex gap-4">
            <span>SECURE_DATA_FEED</span>
            <span className="animate-pulse">● LIVE</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          from { background-position: 0 0; }
          to { background-position: 0 400px; }
        }
        @keyframes scanline {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes pillar-rise {
          from { transform: scaleY(0.2); opacity: 0.2; }
          to { transform: scaleY(1.5); opacity: 0.8; }
        }
        .animation-loading-bar {
           animation: loading-progress 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
           width: 30%;
        }
        @keyframes loading-progress {
          0% { transform: translateX(-100%); width: 20%; }
          50% { width: 60%; }
          100% { transform: translateX(300%); width: 20%; }
        }
      `}</style>
    </div>
  );
}
