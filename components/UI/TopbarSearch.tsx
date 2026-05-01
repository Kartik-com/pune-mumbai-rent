import React, { useState, useEffect, useRef } from 'react';
import { searchLocation } from '../../lib/nominatim';

interface LocationResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export default function TopbarSearch({
  city,
  onSelectLocation,
  onToggleFilter
}: {
  city: string;
  onSelectLocation: (lat: number, lng: number) => void;
  onToggleFilter?: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchLocation(query, city);
        setResults(res as LocationResult[]);
      } catch {
        // ignore
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, city]);

  const handleSelect = (lat: number, lng: number) => {
    onSelectLocation(lat, lng);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={wrapperRef} className="relative z-[3000] w-full">
      <div className="glass h-14 md:h-16 px-6 rounded-2xl md:rounded-[24px] flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative w-full border border-white/5 transition-all focus-within:border-accent/50 group bg-bg/40 backdrop-blur-xl">
        <svg className="w-5 h-5 text-text3 mr-4 shrink-0 group-focus-within:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <input 
          type="text" 
          placeholder="Search area, society or landmark..." 
          className="bg-transparent border-none outline-none text-sm md:text-base text-text1 w-full placeholder:text-text3 font-dm relative z-[3001] tracking-tight"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => { if (query) setIsOpen(true); }}
        />
        <div className="w-[1px] h-6 bg-border2 mx-4 opacity-30" />
        <button onClick={onToggleFilter} className="text-text3 hover:text-accent transition-colors p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4.5h18m-18 5h18m-18 5h18m-18 5h18"></path></svg>
        </button>
      </div>

      {isOpen && (query || loading) && (
        <div className="absolute top-[68px] md:top-[80px] left-0 right-0 glass rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.7)] max-h-80 overflow-y-auto custom-scrollbar border border-white/10 py-3 bg-bg/80 backdrop-blur-2xl">
          {loading && (
            <div className="px-6 py-4 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-syn font-bold uppercase tracking-widest text-text3">Searching...</span>
            </div>
          )}
          
          {!loading && results.length > 0 && results.map((r, i) => (
            <button
              key={r.place_id || i}
              onClick={() => handleSelect(parseFloat(r.lat), parseFloat(r.lon))}
              className="w-full text-left px-6 py-3 hover:bg-white/5 transition-all group flex items-center gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-text3 group-hover:bg-accent group-hover:text-bg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-syn font-bold text-sm text-text1 truncate group-hover:text-accent transition-colors">{r.display_name.split(',')[0]}</div>
                <div className="text-[10px] text-text3 truncate leading-tight uppercase tracking-wider">{r.display_name.split(',').slice(1).join(',')}</div>
              </div>
            </button>
          ))}

          {!loading && results.length === 0 && query && (
             <div className="px-6 py-6 text-center">
                <div className="text-3xl mb-2">🔭</div>
                <div className="text-xs font-syn font-bold text-text3 uppercase tracking-widest">No matching areas found</div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
