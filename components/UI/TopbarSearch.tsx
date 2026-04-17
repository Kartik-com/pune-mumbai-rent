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
}: {
  city: string;
  onSelectLocation: (lat: number, lng: number) => void;
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
    <div ref={wrapperRef} className="relative z-[3000] w-[300px]">
      <div className="glass h-11 px-4 rounded-xl flex items-center shadow-2xl relative w-full">
        <svg className="w-4 h-4 text-text3 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <input 
          type="text" 
          placeholder="Search neighbourhood or area..." 
          className="bg-transparent border-none outline-none text-sm text-text1 w-full placeholder:text-text3 font-dm relative z-[3001]"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => { if (query) setIsOpen(true); }}
        />
      </div>

      {isOpen && (query || loading) && (
        <div className="absolute top-[52px] left-0 right-0 glass rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar border border-border1 py-2">
          {loading && <div className="px-4 py-3 text-xs text-text3 animate-pulse">Searching...</div>}
          
          {!loading && results.length > 0 && results.map((r, i) => (
            <button
              key={r.place_id || i}
              onClick={() => handleSelect(parseFloat(r.lat), parseFloat(r.lon))}
              className="w-full text-left px-4 py-2 hover:bg-surface3 transition-colors"
            >
              <div className="font-syn font-bold text-sm text-text1 truncate">{r.display_name.split(',')[0]}</div>
              <div className="text-[10px] text-text3 truncate leading-tight">{r.display_name}</div>
            </button>
          ))}

          {!loading && results.length === 0 && query && (
             <div className="px-4 py-3 text-xs text-text3">No places found.</div>
          )}
        </div>
      )}
    </div>
  );
}
