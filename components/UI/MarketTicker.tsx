'use client';

import { RentPin } from '../Map/MapLibreMap';
import { useEffect, useState } from 'react';

interface Props {
  pins: RentPin[];
}

export default function MarketTicker({ pins }: Props) {
  const [tickerPins, setTickerPins] = useState<RentPin[]>([]);

  useEffect(() => {
    // Get last 5 pins
    const latest = [...pins]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    setTickerPins(latest);
  }, [pins]);

  if (tickerPins.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-7 bg-bg/80 backdrop-blur-md z-[3000] border-b border-border1 overflow-hidden flex items-center">
      <div className="flex items-center gap-4 whitespace-nowrap animate-marquee px-4">
        <span className="text-[9px] font-syn font-bold text-accent uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Market Pulse
        </span>
        
        {tickerPins.map((pin) => (
          <div key={pin.id} className="flex items-center gap-2 text-[10px] font-dm text-text2">
            <span className="text-text3">•</span>
            <span className="font-bold text-text1">₹{(pin.rent/1000).toFixed(0)}k</span>
            <span className="text-text3">in</span>
            <span className="font-medium text-text2">{pin.society}</span>
            <span className="text-[8px] bg-surface2 px-1.5 py-0.5 rounded text-text3 uppercase font-syn">
              {new Date(pin.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        
        {/* Repeat for seamless loop if needed, but for now simple marquee is fine */}
        {tickerPins.map((pin) => (
          <div key={`dup-${pin.id}`} className="flex items-center gap-2 text-[10px] font-dm text-text2">
            <span className="text-text3">•</span>
            <span className="font-bold text-text1">₹{(pin.rent/1000).toFixed(0)}k</span>
            <span className="text-text3">in</span>
            <span className="font-medium text-text2">{pin.society}</span>
            <span className="text-[8px] bg-surface2 px-1.5 py-0.5 rounded text-text3 uppercase font-syn">
              {new Date(pin.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
