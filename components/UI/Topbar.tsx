import React from 'react';
import Link from 'next/link';

import TopbarSearch from './TopbarSearch';

export default function Topbar({ 
  city, 
  onToggleFilter,
  showFilters,
  onSelectLocation
}: { 
  city: string;
  onToggleFilter?: () => void;
  showFilters?: boolean;
  onSelectLocation?: (lat: number, lng: number) => void;
}) {
  const [showMobileSearch, setShowMobileSearch] = React.useState(false);

  return (
    <header id="topbar-nav" className="fixed top-5 left-0 right-0 z-[2000] px-5 flex items-start justify-between pointer-events-none">
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

      {/* Desktop Center: Links (Optional, matching screenshot style) */}
      <div className="hidden md:flex items-center gap-6 pointer-events-auto">
        <button className="text-text3 hover:text-text1 font-syn font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          How to Use
        </button>
        <button className="text-text3 hover:text-text1 font-syn font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          Report Issue
        </button>
      </div>

      {/* Right: City nav & Filter */}
      <div className="flex items-center gap-4 pointer-events-auto">
        {onToggleFilter && (
          <button 
            onClick={onToggleFilter}
            className={`glass h-10 px-5 rounded-xl font-syn font-bold text-[10px] uppercase tracking-widest transition-all shadow-2xl border ${
              showFilters ? 'bg-accent text-bg border-accent' : 'border-border1 text-text1 hover:text-accent'
            }`}
          >
            Filters
          </button>
        )}
        <nav className="flex items-center glass px-1.5 py-1.5 rounded-xl shadow-2xl">
          {['pune', 'mumbai'].map((c) => (
            <Link
              key={c}
              href={`/${c}`}
              className={`font-syn text-[10px] uppercase tracking-[0.15em] font-bold px-4 py-2 rounded-lg transition-all ${
                city === c
                  ? 'bg-surface2 text-accent shadow-lg'
                  : 'text-text3 hover:text-text2 hover:bg-surface1'
              }`}
            >
              {c}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile search - absolute bottom of screen logic is usually handled elsewhere, but we can do a floating bar here too if needed */}
    </header>
  );
}
