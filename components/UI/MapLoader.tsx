import React, { useEffect, useState } from 'react';

const STATUS_MESSAGES = [
  'SCANNING PUNE MARKET',
  'TRIANGULATING NEIGHBORHOOD PINS',
  'CALIBRATING PRICE HEATMAPS',
  'REMOVING BROKERAGE FEES FROM REALITY',
  'LOCALIZING SECURE DATA FEED',
  'SYNCHRONIZING WITH NEIGHBORS'
];

export default function MapLoader({ isReady }: { isReady: boolean }) {
  const [statusIdx, setStatusIdx] = useState(0);
  const [coordinates, setCoordinates] = useState({ lat: 18.5204, lng: 73.8567 });

  useEffect(() => {
    if (isReady) return;
    
    // Cycle status messages
    const msgInterval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2000);

    // Randomize coordinates for "scanning" effect
    const coordInterval = setInterval(() => {
      setCoordinates({
        lat: 18.5204 + (Math.random() - 0.5) * 0.1,
        lng: 73.8567 + (Math.random() - 0.5) * 0.1
      });
    }, 100);

    return () => {
      clearInterval(msgInterval);
      clearInterval(coordInterval);
    };
  }, [isReady]);

  return (
    <div 
      className={`fixed inset-0 z-[2500] bg-[#080808] flex items-center justify-center transition-all duration-700 ease-in-out pointer-events-none overflow-hidden ${
        isReady ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e8c547 1px, transparent 1px),
            linear-gradient(to bottom, #e8c547 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radar Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full border border-accent/30 shadow-[0_0_30px_rgba(232,197,71,0.1)]"
            style={{
              width: '100px',
              height: '100px',
              animation: `pulse-ring 4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite`,
              animationDelay: `${i * 1.3}s`
            }}
          />
        ))}
      </div>

      {/* Central Focal Point */}
      <div className="relative flex flex-col items-center">
        {/* The "Satellite" Crosshair */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-12">
          {/* Inner circle */}
          <div className="absolute w-4 h-4 bg-accent rounded-full shadow-[0_0_20px_#e8c547] animate-pulse" />
          
          {/* Spinning Outer Ring */}
          <div className="absolute inset-0 border-2 border-dashed border-accent/20 rounded-full animate-[spin_10s_linear_infinite]" />
          
          {/* Scanning Line */}
          <div className="absolute inset-0 flex items-center justify-center animate-[spin_3s_linear_infinite]">
            <div className="w-[50%] h-[1px] bg-gradient-to-r from-transparent to-accent origin-right translate-x-[-100%]" />
          </div>

          {/* Precision Lines */}
          <div className="absolute -top-4 bottom-4 w-[1px] bg-accent/20" />
          <div className="absolute -left-4 right-4 h-[1px] bg-accent/20" />
        </div>

        {/* Status Text Block */}
        <div className="text-center space-y-4 max-w-xs">
          <div className="space-y-1">
            <h2 className="text-text1 font-syn font-black text-xs uppercase tracking-[0.3em] h-4">
              {STATUS_MESSAGES[statusIdx]}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-green rounded-full animate-pulse shadow-[0_0_8px_#3ec87a]" />
              <span className="text-accent/60 font-syn font-bold text-[9px] uppercase tracking-widest">
                System Active
              </span>
            </div>
          </div>

          {/* Coordinate Ticker */}
          <div className="font-dm text-[10px] text-text3 opacity-40 tabular-nums tracking-widest">
            LOC: {coordinates.lat.toFixed(6)} N / {coordinates.lng.toFixed(6)} E
          </div>

          {/* Progress Loading Bar */}
          <div className="w-48 h-[2px] bg-surface2 rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 bg-accent w-1/3 animate-[loading-bar_1.5s_infinite_ease-in-out]" />
          </div>
        </div>
      </div>

      {/* Decorative Corner Labels */}
      <div className="absolute top-8 left-8 text-[8px] font-syn font-bold text-text3/30 uppercase tracking-[0.5em] hidden md:block">
        Sat_Link_V2.0 // encrypted
      </div>
      <div className="absolute bottom-8 right-8 text-[8px] font-syn font-bold text-text3/30 uppercase tracking-[0.5em] hidden md:block text-right">
        Neighbor_Network // 100% Honest
      </div>

      <style jsx>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.5); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: scale(6); opacity: 0; }
        }
        @keyframes loading-bar {
          0% { left: -40%; width: 20%; }
          50% { width: 40%; }
          100% { left: 110%; width: 20%; }
        }
      `}</style>
    </div>
  );
}
