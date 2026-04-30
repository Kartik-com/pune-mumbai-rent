import React, { useEffect, useState } from 'react';

export default function MapLoader({ isReady }: { isReady: boolean }) {
  const [altitude, setAltitude] = useState(40000);
  const [systemStatus, setSystemStatus] = useState('ORBITAL_STABLE');

  useEffect(() => {
    if (isReady) return;

    // Fast altitude drop
    const altInterval = setInterval(() => {
      setAltitude((prev) => {
        if (prev <= 0) return 0;
        const drop = Math.floor(Math.random() * 800) + 400;
        return prev - drop;
      });
    }, 50);

    // Dynamic status updates
    const statusTimeout = setTimeout(() => setSystemStatus('ENTRY_INITIATED'), 800);
    const statusTimeout2 = setTimeout(() => setSystemStatus('THERMAL_SHIELD_ACTIVE'), 1800);
    const statusTimeout3 = setTimeout(() => setSystemStatus('APPROACHING_VECTOR'), 2800);

    return () => {
      clearInterval(altInterval);
      clearTimeout(statusTimeout);
      clearTimeout(statusTimeout2);
      clearTimeout(statusTimeout3);
    };
  }, [isReady]);

  return (
    <div 
      className={`fixed inset-0 z-[5000] bg-[#020205] flex items-center justify-center transition-all duration-1000 ease-in overflow-hidden ${
        isReady ? 'opacity-0 scale-[3] blur-2xl pointer-events-none' : 'opacity-100 scale-100 blur-0 pointer-events-auto'
      }`}
    >
      {/* ── SPACE STARFIELD ── */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.2,
              animation: `star-float ${Math.random() * 10 + 10}s linear infinite`
            }}
          />
        ))}
      </div>

      {/* ── RE-ENTRY SPARKS (Atmospheric Friction) ── */}
      {!isReady && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-gradient-to-t from-transparent via-accent/40 to-white/80 w-[1px] rounded-full blur-[1px]"
              style={{
                height: Math.random() * 200 + 100 + 'px',
                left: Math.random() * 100 + '%',
                top: '-20%',
                animation: `particle-fall ${Math.random() * 0.5 + 0.3}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* ── THE 3D GLOBE (CSS Orbit) ── */}
      <div className="relative w-[300px] h-[300px] flex items-center justify-center">
        {/* Glow behind globe */}
        <div className="absolute inset-0 bg-accent/10 rounded-full blur-[100px] animate-pulse" />
        
        {/* The Globe Sphere */}
        <div className="relative w-full h-full preserve-3d animate-[globe-rotate_20s_linear_infinite]">
          {/* Latitude/Longitude Rings */}
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="absolute inset-0 border border-accent/20 rounded-full"
              style={{ transform: `rotateY(${i * 22.5}deg)` }}
            />
          ))}
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="absolute inset-0 border border-accent/20 rounded-full"
              style={{ transform: `rotateX(${i * 36 - 90}deg)` }}
            />
          ))}
          
          {/* Core Glow */}
          <div className="absolute inset-4 border-2 border-accent/40 rounded-full shadow-[inset_0_0_50px_rgba(232,197,71,0.2)]" />
        </div>

        {/* ── HUD OVERLAY ── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            {/* Crosshair */}
            <div className="w-16 h-16 border border-accent/30 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-accent rounded-full shadow-[0_0_10px_#e8c547]" />
            </div>
            
            {/* Ticker Data */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center w-full">
                <div className="text-[10px] font-syn font-black text-accent tracking-[0.5em] mb-1">{systemStatus}</div>
                <div className="h-[1px] w-12 bg-accent/50 mx-auto" />
            </div>
        </div>
      </div>

      {/* ── SIDE DATA PANELS (Sci-Fi HUD) ── */}
      <div className="fixed bottom-12 left-12 space-y-6 hidden md:block">
        <div className="space-y-1">
          <div className="text-[8px] font-syn text-text3/50 uppercase tracking-widest">Altitude</div>
          <div className="text-2xl font-syn font-black text-text1 tabular-nums">
            {altitude.toLocaleString()} <span className="text-xs text-accent">KM</span>
          </div>
        </div>
        <div className="h-24 w-[2px] bg-gradient-to-t from-accent/50 to-transparent relative">
            <div className="absolute bottom-0 w-4 h-[1px] bg-accent" />
            <div 
                className="absolute w-2 h-2 bg-accent rounded-full -left-[3px] transition-all duration-300" 
                style={{ bottom: `${(altitude / 80000) * 100}%` }}
            />
        </div>
      </div>

      <div className="fixed top-12 right-12 text-right hidden md:block">
        <div className="text-[8px] font-syn text-text3/50 uppercase tracking-widest mb-2">Landing Sector</div>
        <div className="text-xl font-syn font-black text-text1 uppercase tracking-tighter italic">PUNE_MUMBAI_METRO</div>
        <div className="mt-4 flex flex-col items-end gap-1">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="w-12 h-[2px] bg-accent/20 overflow-hidden">
                    <div className="h-full bg-accent/60 animate-[loading-bar_2s_infinite]" style={{ animationDelay: i*0.3+'s' }} />
                </div>
            ))}
        </div>
      </div>

      <style jsx>{`
        .preserve-3d { transform-style: preserve-3d; }
        
        @keyframes globe-rotate {
          from { transform: rotateX(15deg) rotateY(0deg); }
          to { transform: rotateX(15deg) rotateY(360deg); }
        }
        
        @keyframes star-float {
          from { transform: translateY(0); }
          to { transform: translateY(-100px); }
        }
        
        @keyframes particle-fall {
          0% { transform: translateY(-100vh); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(200vh); opacity: 0; }
        }

        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
