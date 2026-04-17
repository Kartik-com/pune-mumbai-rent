export default function RightControls({
  onLocate,
  onHunt,
  onStats,
  onAreaStats,
  onToggleMetro,
  showMetro,
  onToggleGreen,
  showGreen,
}: {
  onLocate: () => void;
  onHunt: () => void;
  onStats: () => void;
  onAreaStats: () => void;
  onToggleMetro: () => void;
  showMetro: boolean;
  onToggleGreen: () => void;
  showGreen: boolean;
}) {
  return (
    <div className="fixed right-4 top-[84px] flex flex-col gap-[10px] z-[1000] pointer-events-auto">
      {/* Metro */}
      <button onClick={onToggleMetro} title="Toggle Metro" className={`w-[42px] h-[42px] rounded-[10px] flex items-center justify-center shadow-2xl transition-colors ${showMetro ? 'bg-accent text-bg border-accent' : 'glass glass-hover text-text2 hover:text-text1'}`}>
        <svg fill="currentColor" width="18" height="18" viewBox="0 0 24 24"><path d="M12 2c-4 0-8 1-8 4v10a2 2 0 0 0 2 2h2v2a1 1 0 1 0 2 0v-2h6v2a1 1 0 1 0 2 0v-2h2a2 2 0 0 0 2-2V6c0-3-4-4-8-4zm-4 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM6.5 9V6c0-1.8 2.5-2.5 5.5-2.5S17.5 4.2 17.5 6v3h-11z"/></svg>
      </button>

      {/* Green Cover */}
      <button onClick={onToggleGreen} title="Green Cover" className={`w-[42px] h-[42px] rounded-[10px] flex items-center justify-center shadow-2xl transition-colors ${showGreen ? 'bg-green text-bg border-none' : 'glass glass-hover text-text2 hover:text-text1'}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-4"/><path d="M8 18h8"/><path d="M12 18c-3 0-5.5-2.5-6-5.5-.5-3.5 2-6.5 5-7.5.5 0 1.5 0 2 0 3 1 5.5 4 5 7.5-.5 3-3 5.5-6 5.5z"/></svg>
      </button>

      {/* Stats */}
      <button onClick={onStats} title="Live Stats" className="w-[42px] h-[42px] rounded-[10px] glass glass-hover flex items-center justify-center text-text2 hover:text-text1 shadow-2xl">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
      </button>

      {/* Area Stats */}
      <button onClick={onAreaStats} title="Area Stats — Draw" className="w-[42px] h-[42px] rounded-[10px] glass glass-hover flex items-center justify-center text-text2 hover:text-accent shadow-2xl">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
      </button>

      {/* Flat Hunt */}
      <button onClick={onHunt} title="Flat Hunt" className="w-[42px] h-[42px] rounded-[10px] glass glass-hover flex items-center justify-center text-text2 hover:text-text1 shadow-2xl">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </button>

      {/* Locate */}
      <button onClick={onLocate} title="Locate Me" className="w-[42px] h-[42px] rounded-[10px] glass glass-hover flex items-center justify-center text-text2 hover:text-accent shadow-2xl">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
      </button>
    </div>
  );
}
