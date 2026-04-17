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
  return (
    <header className="fixed top-5 left-0 right-0 z-[2000] px-5 flex items-start justify-between pointer-events-none">
      {/* Left: Brand */}
      <Link href={`/${city}`} className="glass px-4 py-2.5 rounded-xl flex items-center gap-2.5 group pointer-events-auto shadow-2xl">
        <div className="w-5 h-5 rounded bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
          <span className="text-bg font-syn font-extrabold text-[10px] leading-none">R</span>
        </div>
        <span className="font-syn font-bold text-text1 text-sm tracking-widest uppercase">
          {city}<span className="text-accent"></span>
        </span>
      </Link>

      {/* Center: Search + Filter */}
      <div className="hidden md:flex items-center gap-2 pointer-events-auto">
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
              showFilters ? 'bg-accent text-bg border-accent' : 'glass border-border1 text-text1 hover:text-accent'
            }`}
          >
            Filters
          </button>
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
