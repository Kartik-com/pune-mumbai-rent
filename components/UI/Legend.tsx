import React from 'react';

export default function Legend() {
  const items = [
    { label: 'Rent Data', color: '#f97316' }, // Orange
    { label: 'Whole Flat Available', color: '#3b82f6' }, // Blue
    { label: 'Flatmate Needed', color: '#10b981' }, // Green
  ];

  return (
    <div className="fixed top-[100px] left-4 z-[2000] flex flex-col gap-2 animate-[fade-in_0.5s_ease]">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 bg-bg/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-2xl">
          <div 
            className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" 
            style={{ backgroundColor: item.color }} 
          />
          <span className="text-[10px] font-syn font-bold uppercase tracking-wider text-text1 whitespace-nowrap">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
