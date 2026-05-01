export default function RightControls({
  onLocate,
  onHunt,
  onStats,
  onAreaStats,
  onToggleMetro,
  showMetro,
  onToggleGreen,
  showGreen,
  onToggleStyle,
  mapStyle,
  onHelp,
  onToggleHeatmap,
  showHeatmap,
}: {
  onLocate: () => void;
  onHunt: () => void;
  onStats: () => void;
  onAreaStats: () => void;
  onToggleMetro: () => void;
  showMetro: boolean;
  onToggleGreen: () => void;
  showGreen: boolean;
  onToggleStyle: () => void;
  mapStyle: 'dark' | 'light';
  onHelp: () => void;
  onToggleHeatmap: () => void;
  showHeatmap: boolean;
}) {
  return (
    <div id="right-controls" className="fixed right-3 md:right-4 md:top-[84px] top-[90px] flex flex-col gap-1.5 md:gap-[10px] z-[1000] pointer-events-auto items-end">
      {/* Style Toggle */}
      <button onClick={onToggleStyle} title="Switch Map Style" className="w-8 h-8 md:w-[42px] md:h-[42px] rounded-[8px] md:rounded-[10px] glass glass-hover flex items-center justify-center text-text2 hover:text-accent shadow-2xl transition-all">
        {mapStyle === 'dark' ? (
          <svg className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        ) : (
          <svg className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        )}
      </button>

      {/* Metro */}
      <button onClick={onToggleMetro} title="Toggle Metro" className={`w-8 h-8 md:w-[42px] md:h-[42px] rounded-[8px] md:rounded-[10px] flex items-center justify-center shadow-2xl transition-colors ${showMetro ? 'bg-accent text-bg border-accent' : 'glass glass-hover text-text2 hover:text-text1'}`}>
        <svg fill="currentColor" className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" viewBox="0 0 24 24"><path d="M12 2c-4 0-8 1-8 4v10a2 2 0 0 0 2 2h2v2a1 1 0 1 0 2 0v-2h6v2a1 1 0 1 0 2 0v-2h2a2 2 0 0 0 2-2V6c0-3-4-4-8-4zm-4 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM6.5 9V6c0-1.8 2.5-2.5 5.5-2.5S17.5 4.2 17.5 6v3h-11z"/></svg>
      </button>

      {/* Green Cover */}
      <button onClick={onToggleGreen} title="Green Cover" className={`w-8 h-8 md:w-[42px] md:h-[42px] rounded-[8px] md:rounded-[10px] flex items-center justify-center shadow-2xl transition-colors ${showGreen ? 'bg-green text-bg border-none' : 'glass glass-hover text-text2 hover:text-text1'}`}>
        <svg className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-4"/><path d="M8 18h8"/><path d="M12 18c-3 0-5.5-2.5-6-5.5-.5-3.5 2-6.5 5-7.5.5 0 1.5 0 2 0 3 1 5.5 4 5 7.5-.5 3-3 5.5-6 5.5z"/></svg>
      </button>

      {/* Heatmap */}
      <button onClick={onToggleHeatmap} title="Rent Heatmap" className={`w-8 h-8 md:w-[42px] md:h-[42px] rounded-[8px] md:rounded-[10px] flex items-center justify-center shadow-2xl transition-colors ${showHeatmap ? 'bg-orange-500 text-white border-none' : 'glass glass-hover text-text2 hover:text-text1'}`}>
        <svg className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
      </button>

      {/* Stats */}
      <button onClick={onStats} title="Live Stats" className="w-8 h-8 md:w-[42px] md:h-[42px] rounded-[8px] md:rounded-[10px] glass glass-hover flex items-center justify-center text-text2 hover:text-text1 shadow-2xl">
        <svg className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
      </button>

      {/* Area Stats */}
      <button onClick={onAreaStats} title="Area Stats — Draw" className="w-8 h-8 md:w-[42px] md:h-[42px] rounded-[8px] md:rounded-[10px] glass glass-hover flex items-center justify-center text-text2 hover:text-accent shadow-2xl">
        <svg className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
      </button>

      {/* Flat Hunt */}
      <button onClick={onHunt} title="Flat Hunt" className="w-8 h-8 md:w-[42px] md:h-[42px] rounded-[8px] md:rounded-[10px] glass glass-hover flex items-center justify-center text-text2 hover:text-text1 shadow-2xl">
        <svg className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </button>

      {/* Locate */}
      <button onClick={onLocate} title="Locate Me" className="w-8 h-8 md:w-[42px] md:h-[42px] rounded-[8px] md:rounded-[10px] glass glass-hover flex items-center justify-center text-text2 hover:text-accent shadow-2xl transition-all">
        <svg className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
      </button>

      {/* Help */}
      <button onClick={onHelp} title="How to Use" className="w-8 h-8 md:w-[42px] md:h-[42px] rounded-[8px] md:rounded-[10px] glass glass-hover flex items-center justify-center text-accent hover:text-white shadow-2xl transition-all border border-accent/20">
        <svg className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </button>
    </div>
  );
}
