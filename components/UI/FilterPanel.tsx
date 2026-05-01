import React from 'react';
import { Filters } from '../Map/MapLibreMap';
import TrustBanner from './TrustBanner';

export default function FilterPanel({
  filters,
  setFilters,
  city,
  categoryMode = 'residential',
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  city?: string;
  categoryMode?: 'residential' | 'commercial';
}) {
  return (
    <div className="w-full h-full p-5 space-y-5 flex flex-col font-sans">
      <h2 className="font-syn font-bold text-base text-text1 uppercase tracking-wider">
        {categoryMode === 'commercial' ? 'Commercial Filters' : 'Filters'}
      </h2>

      {categoryMode === 'residential' && (
        <>
          {/* BHK */}
      <div className="space-y-2.5">
        <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3">BHK Config</label>
        <div className="flex flex-wrap gap-[6px]">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  bhk: f.bhk.includes(n) ? f.bhk.filter(b => b !== n) : [...f.bhk, n]
                }))
              }
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filters.bhk.includes(n)
                  ? 'bg-accent text-on-accent border-accent'
                  : 'bg-transparent text-text2 border-border2 hover:text-text1 hover:border-text1'
              } shadow-sm`}
            >
              {n}{n === 5 ? '+' : ''} BHK
            </button>
          ))}
        </div>
      </div>

      {/* Furnishing */}
      <div className="space-y-2.5">
        <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3">Furnishing</label>
        <div className="flex gap-[6px] flex-wrap">
          {[
            { id: 'both', label: 'Any' },
            { id: 'furnished', label: 'Furnished' },
            { id: 'semi', label: 'Semi' },
            { id: 'unfurnished', label: 'Unfurnished' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilters(f => ({ ...f, furnished: f.furnished === opt.id ? 'both' : opt.id }))}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filters.furnished === opt.id
                  ? 'bg-accent text-on-accent border-accent'
                  : 'bg-transparent text-text2 border-border2 hover:text-text1 hover:border-text1'
              } shadow-sm`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Society Type */}
      <div className="space-y-2.5">
        <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3">Society Type</label>
        <div className="flex gap-[6px]">
          {[
            { id: 'both', label: 'All', color: '' },
            { id: 'true', label: 'Gated', color: 'var(--pin-gated)' },
            { id: 'false', label: 'Not Gated', color: 'var(--pin-nogated)' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilters(f => ({ ...f, gated: f.gated === opt.id ? 'both' : opt.id }))}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filters.gated === opt.id
                  ? 'text-white border-transparent'
                  : 'bg-transparent text-text2 border-border2 hover:text-text1 hover:border-text1'
              } shadow-sm`}
              style={filters.gated === opt.id && opt.color ? { background: opt.color } : filters.gated === opt.id ? { background: 'var(--accent)' } : {}}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2.5">
        <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3">Min Rating</label>
        <div className="flex gap-[6px]">
          {[1, 2, 3, 4, 5].map(r => (
            <button
              key={r}
              onClick={() => setFilters(f => ({ ...f, minRating: f.minRating === r ? 0 : r }))}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full border flex justify-center items-center gap-0.5 transition-all ${
                filters.minRating >= r ? 'bg-accent text-bg border-accent' : 'border-border2 text-text2 hover:border-text3'
              }`}
            >
              {r}★
            </button>
          ))}
        </div>
      </div>

          {/* Flatmate toggle */}
          <button
            onClick={() => setFilters(f => ({ ...f, flatmateWanted: !f.flatmateWanted }))}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              filters.flatmateWanted
                ? 'bg-teal text-white border-teal'
                : 'bg-transparent text-text2 border-border2 hover:text-text1 hover:border-text1'
            } shadow-sm`}
          >
            🤝 Looking for Flatmate
          </button>
        </>
      )}

      {categoryMode === 'commercial' && (
        <>
          {/* Commercial Type */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3">Property Type</label>
            <div className="flex gap-[6px]">
              {[
                { id: 'both', label: 'All' },
                { id: 'shop', label: 'Shop' },
                { id: 'office', label: 'Office' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilters(f => ({ ...f, commercialType: f.commercialType === opt.id ? 'both' : opt.id }))}
                  className={`flex-1 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    (filters.commercialType || 'both') === opt.id
                      ? 'bg-purple text-bg border-purple'
                      : 'bg-transparent text-text2 border-border2 hover:text-text1 hover:border-text1'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Area filter */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3">Min Area</label>
            <div className="flex gap-[6px]">
              {[0, 200, 500, 1000].map(area => (
                <button
                  key={area}
                  onClick={() => setFilters(f => ({ ...f, minArea: f.minArea === area ? 0 : area }))}
                  className={`flex-1 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    (filters.minArea || 0) === area
                      ? 'bg-accent text-bg border-accent'
                      : 'bg-transparent text-text2 border-border2 hover:text-text1 hover:border-text1'
                  }`}
                >
                  {area > 0 ? `${area}+` : 'Any'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Shortlist Toggle */}
      <button
        onClick={() => setFilters(f => ({ ...f, showShortlisted: !f.showShortlisted }))}
        className={`w-full py-3 rounded-2xl text-xs font-syn font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
          filters.showShortlisted
            ? 'bg-pink text-white border-pink shadow-[0_0_15px_rgba(255,107,157,0.3)]'
            : 'bg-transparent text-text2 border-border2 hover:text-text1 hover:border-text1'
        } shadow-sm`}
      >
        <span>{filters.showShortlisted ? '❤️' : '🤍'}</span>
        Show Shortlisted Only
      </button>

      {/* Divider */}
      <div className="border-t border-border1" />

      {/* Trust Banner integrated natively into this side panel */}
      <TrustBanner city={city} />

      <div className="flex-1" />

      {/* Reset */}
      <button
        onClick={() => setFilters({ bhk: [], minRent: 5000, maxRent: 200000, furnished: 'both', gated: 'both', minRating: 0, flatmateWanted: false, neighborhood: '', commercialType: 'both', minArea: 0, showShortlisted: false })}
        className="w-full py-2.5 text-xs uppercase tracking-widest font-syn font-bold text-text3 hover:text-text1 hover:bg-surface2 rounded-xl transition-all border border-transparent hover:border-border1 mt-4"
      >
        ↺ Reset All Filters
      </button>
    </div>
  );
}
