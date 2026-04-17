import React, { useState } from 'react';

export default function StatsPanel({
  onClose,
  stats,
}: {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats: any;
  city?: string;
}) {
  const [tab, setTab] = useState<'overall' | 'near'>('overall');

  return (
    <div
      className="fixed top-[52px] right-0 bottom-0 w-[240px] z-[2000] glass border-l border-border1 flex flex-col"
      style={{ transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      <div className="p-4 border-b border-border1 flex justify-between items-center">
        <h2 className="font-syn font-bold text-sm text-text1 uppercase tracking-wider">Live Stats</h2>
        <button onClick={onClose} className="text-text3 hover:text-text1 text-lg leading-none">✕</button>
      </div>

      <div className="flex border-b border-border1">
        {(['overall', 'near'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[10px] font-syn font-bold tracking-widest uppercase border-b-2 transition-colors ${
              tab === t ? 'border-accent text-accent' : 'border-transparent text-text3 hover:text-text1'
            }`}
          >
            {t === 'overall' ? 'Overall' : 'Near You'}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-5 overflow-y-auto flex-1">
        {stats ? (
          <>
            <div>
              <p className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 mb-2">Total Pins</p>
              <div className="flex items-end gap-2">
                <span className="font-syn font-extrabold text-3xl text-text1 leading-none">{stats.total ?? 0}</span>
                <span className="text-text3 text-xs mb-0.5">pins</span>
              </div>
            </div>

            {stats.addedThisWeek !== undefined && (
              <div>
                <p className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 mb-1">This Week</p>
                <span className="font-syn font-bold text-lg text-green">+{stats.addedThisWeek}</span>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3">Avg Rent by BHK</p>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {stats.byBhk?.map((s: any) => (
                <div key={s.bhk} className="flex justify-between items-center p-3 rounded-xl bg-surface2 border border-border1">
                  <div>
                    <span className="font-syn text-sm font-bold text-text2">{s.bhk} BHK</span>
                    <span className="text-text3 text-[10px] ml-1.5">({s.count})</span>
                  </div>
                  <span className="font-syn text-base font-bold text-accent">
                    ₹{s.avg_rent >= 100000 ? (s.avg_rent / 100000).toFixed(1) + 'L' : (s.avg_rent / 1000).toFixed(1) + 'k'}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-text3 text-sm text-center py-8">Loading stats...</div>
        )}
      </div>

      <div className="p-4 border-t border-border1 text-center">
        <p className="text-[9px] text-text3 font-syn tracking-wider">Real data from {stats?.total ?? 0} renters</p>
      </div>
    </div>
  );
}
