import React from 'react';
import Link from 'next/link';

import TopbarSearch from './TopbarSearch';

export default function Topbar({ 
  city, 
  onToggleFilter,
  showFilters,
  onSelectLocation,
  stats
}: { 
  city: string;
  onToggleFilter?: () => void;
  showFilters?: boolean;
  onSelectLocation?: (lat: number, lng: number) => void;
  stats?: { total: number; addedThisWeek: number };
}) {
  const [showMobileSearch, setShowMobileSearch] = React.useState(false);

  return (
    <header className="fixed top-5 left-0 right-0 z-[2000] px-5 flex items-start justify-between pointer-events-none">
      {/* Left: Brand */}
      <Link href={`/${city}`} className="glass px-3 md:px-4 py-2 md:py-2.5 rounded-xl flex items-center gap-2 group pointer-events-auto shadow-2xl">
        <div className="w-4 h-4 md:w-5 md:h-5 rounded bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
          <span className="text-bg font-syn font-extrabold text-[8px] md:text-[10px] leading-none">R</span>
        </div>
        <span className="font-syn font-bold text-text1 text-xs md:text-sm tracking-widest uppercase">
          {city}
        </span>
      </Link>

      {/* Mobile Center: Search/Filter Toggle */}
      <div className="md:hidden flex items-center gap-2 pointer-events-auto">
        <button 
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all shadow-2xl border ${
            showMobileSearch ? 'bg-accent text-on-accent border-accent' : 'glass border-border1 text-text1'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>
        {onToggleFilter && (
            <button 
              onClick={onToggleFilter}
              className={`h-9 px-4 rounded-xl font-syn font-bold text-[10px] uppercase tracking-wider transition-colors shadow-2xl border ${
                showFilters ? 'bg-accent text-on-accent border-accent' : 'glass border-border1 text-text1'
              }`}
            >
              Filters
            </button>
          )}
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="md:hidden fixed top-[75px] left-5 right-5 z-[2100] pointer-events-auto animate-[popup-enter_0.2s_ease]">
          {onSelectLocation && <TopbarSearch city={city} onSelectLocation={(lat, lng) => { onSelectLocation(lat, lng); setShowMobileSearch(false); }} />}
        </div>
      )}

      {/* Desktop Center: Search + Filter */}
      <div className="hidden md:flex flex-col items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-2">
          {onSelectLocation ? (
            <TopbarSearch city={city} onSelectLocation={onSelectLocation} />
          ) : (
            <div className="glass h-11 px-4 rounded-xl flex items-center shadow-2xl relative w-[300px]">
              <svg className="w-4 h-4 text-text3 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" 
                placeholder="Search neighbourhood or area..." 
                className="bg-transparent border-none outline-none text-sm text-text1 w-full placeholder:text-text3 font-dm"
              />
            </div>
          )}
          {onToggleFilter && (
            <button 
              onClick={onToggleFilter}
              className={`h-11 px-4 rounded-xl font-syn font-bold text-xs uppercase tracking-wider transition-colors shadow-2xl border ${
                showFilters ? 'bg-accent text-on-accent border-accent' : 'glass border-border1 text-text1 hover:text-accent'
              }`}
            >
              Filters
            </button>
          )}
        </div>
        
        {/* Live Status Bar */}
        {stats && stats.total > 0 && (
          <div className="flex items-center gap-3 px-3 py-1 bg-surface1/20 rounded-full border border-border1/30 animate-[fade-in_0.5s_ease]">
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-syn font-bold text-text3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
              📍 {stats.total.toLocaleString()} Pins
            </span>
            <div className="w-[1px] h-3 bg-border2 opacity-30"></div>
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-syn font-bold text-text3">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span>
              ⚡ {stats.addedThisWeek} New This Week
            </span>
          </div>
        )}
      </div>

      {/* Right: City nav */}
      <nav className="flex items-center gap-3 pointer-events-auto glass px-2 py-1.5 rounded-xl shadow-2xl">
        {['pune', 'mumbai'].map((c) => (
          <Link
            key={c}
            href={`/${c}`}
            className={`font-syn text-[10px] uppercase tracking-[0.15em] font-bold px-3 py-1.5 rounded-lg transition-all ${
              city === c
                ? 'bg-surface2 text-accent'
                : 'text-text3 hover:text-text2 hover:bg-surface1'
            }`}
          >
            {c}
          </Link>
        ))}
      </nav>

      {/* Mobile search - absolute bottom of screen logic is usually handled elsewhere, but we can do a floating bar here too if needed */}
    </header>
  );
}
