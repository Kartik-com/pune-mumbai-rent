import React, { useState, useEffect } from 'react';
import { searchLocation } from '../../lib/nominatim';

export default function LocationSearchModal({
  onClose,
  onSelect,
  city,
}: {
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
  city: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await searchLocation(query, city);
        setResults(res);
      } catch (err) {
        setError('Failed to search location.');
      }
      setLoading(false);
    }, 750);

    return () => clearTimeout(timer);
  }, [query, city]);

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass rounded-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-border1 pb-3">
          <h2 className="text-text1 font-syn font-bold text-lg uppercase tracking-widest">📍 Find Location</h2>
          <button onClick={onClose} className="text-text3 hover:text-text1 text-xl">✕</button>
        </div>
        
        <div>
          <input
            type="text"
            placeholder="e.g. Koregaon Park, Phoenix Mall..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border2 rounded-xl text-text1 placeholder-text3 font-dm outline-none focus:border-accent focus:shadow-[0_0_10px_rgba(232,197,71,0.15)] transition-all"
            autoFocus
          />
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
          {loading && <p className="text-center text-text3 text-xs py-4 animate-pulse">Searching...</p>}
          {error && <p className="text-center text-red-400 text-xs py-4">{error}</p>}
          
          {!loading && results.length > 0 && results.map((r, i) => (
            <button
              key={r.place_id || i}
              onClick={() => onSelect(parseFloat(r.lat), parseFloat(r.lon))}
              className="w-full text-left px-4 py-3 bg-surface2 hover:bg-surface3 border border-border1 hover:border-accent rounded-xl transition-all"
            >
              <div className="font-syn font-bold text-sm text-text1 truncate">{r.display_name.split(',')[0]}</div>
              <div className="text-[10px] text-text3 truncate mt-0.5">{r.display_name}</div>
            </button>
          ))}
          
          {!loading && query && results.length === 0 && !error && (
            <p className="text-center text-text3 text-xs py-4">No results found for &quot;{query}&quot;.</p>
          )}

          {!query && (
            <p className="text-center text-text3 text-xs py-4">
              Type your society or neighborhood to drop a pin.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
