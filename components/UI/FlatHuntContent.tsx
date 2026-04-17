import React, { useState } from 'react';

export default function FlatHuntContent({
  onClose,
  onSubmitSeeker,
  city,
}: {
  onClose: () => void;
  onSubmitSeeker: (data: Record<string, unknown>) => void;
  city?: string;
}) {
  const [mode, setMode] = useState<'choose' | 'list' | 'seeker'>('choose');
  const [form, setForm] = useState({
    looking_for: 'whole_flat',
    budget_min: '',
    budget_max: '',
    bhk_pref: '2',
    move_in: '',
    food_pref: 'any',
    gender_pref: 'any',
    note: '',
    email: '',
    phone: '',
  });

  const inputCls = "w-full px-3.5 py-2.5 bg-surface border border-border2 rounded-lg text-text1 placeholder-text3 text-sm focus:border-accent outline-none transition-all";

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>

        {mode === 'choose' && (
          <div className="space-y-5 text-center">
            <div>
              <h2 className="text-text1 font-syn font-bold text-lg uppercase tracking-widest">🏠 Flat Hunt</h2>
              <p className="text-text3 text-sm mt-2 leading-relaxed">
                We match you with people near your pin based on budget, BHK, and preferences.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3">I want to...</p>
              <button onClick={() => setMode('list')}
                className="w-full py-3.5 border border-accent text-accent rounded-xl font-syn font-bold uppercase tracking-wider text-sm hover:bg-accent hover:text-bg transition-all">
                List Whole Flat
              </button>
              <button onClick={() => setMode('seeker')}
                className="w-full py-3.5 border border-teal text-teal rounded-xl font-syn font-bold uppercase tracking-wider text-sm hover:bg-teal hover:text-bg transition-all">
                Find a Flatmate
              </button>
            </div>

            <div className="border-t border-border1 pt-4">
              <p className="text-[10px] text-text3 leading-relaxed">
                <span className="font-bold text-text2">How matching works:</span> We&apos;ll connect you with matches via email in the next 24 hours.
              </p>
            </div>
          </div>
        )}

        {mode === 'list' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border1 pb-3">
              <button onClick={() => setMode('choose')} className="text-text3 hover:text-text1 text-xs uppercase tracking-widest font-syn font-bold">← Back</button>
              <h2 className="text-text1 font-syn font-bold uppercase tracking-widest text-sm">List Your Flat</h2>
              <button onClick={onClose} className="text-text3 hover:text-text1">✕</button>
            </div>
            <p className="text-text3 text-sm text-center py-4">
              To list your flat, tap anywhere on the map and fill in your rent details. Toggle &quot;Currently Available&quot; in the pin form.
            </p>
            <button onClick={onClose} className="w-full py-3 bg-accent text-bg font-syn font-bold uppercase tracking-widest text-sm rounded-xl">
              Got it — Go to Map
            </button>
          </div>
        )}

        {mode === 'seeker' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border1 pb-3">
              <button onClick={() => setMode('choose')} className="text-text3 hover:text-text1 text-xs uppercase tracking-widest font-syn font-bold">← Back</button>
              <h2 className="text-text1 font-syn font-bold uppercase tracking-widest text-sm">🏠 Flat Seeker</h2>
              <button onClick={onClose} className="text-text3 hover:text-text1">✕</button>
            </div>

            <div>
              <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-1.5">Looking For</label>
              <div className="flex gap-1.5">
                {[{ id: 'whole_flat', label: 'Whole Flat' }, { id: 'flatmate', label: 'Flatmate' }].map(o => (
                  <button key={o.id} onClick={() => setForm({ ...form, looking_for: o.id })}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      form.looking_for === o.id ? 'bg-accent text-bg border-accent' : 'bg-surface2 text-text3 border-border2'
                    }`}>{o.label}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-1.5">Budget Min (₹)</label>
                <input type="number" value={form.budget_min} onChange={e => setForm({ ...form, budget_min: e.target.value })} placeholder="10000" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-1.5">Budget Max (₹)</label>
                <input type="number" value={form.budget_max} onChange={e => setForm({ ...form, budget_max: e.target.value })} placeholder="30000" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-1.5">BHK Preference</label>
              <div className="flex gap-1.5">
                {['1', '2', '3', '4+'].map(b => (
                  <button key={b} onClick={() => setForm({ ...form, bhk_pref: b })}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      form.bhk_pref === b ? 'bg-accent text-bg border-accent' : 'bg-surface2 text-text3 border-border2'
                    }`}>{b}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-1.5">Food Preference</label>
              <div className="flex gap-1.5">
                {['any', 'veg', 'non-veg'].map(f => (
                  <button key={f} onClick={() => setForm({ ...form, food_pref: f })}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border capitalize transition-all ${
                      form.food_pref === f ? 'bg-accent text-bg border-accent' : 'bg-surface2 text-text3 border-border2'
                    }`}>{f}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-1.5">Note (optional)</label>
              <input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                placeholder="e.g. Working professional, early riser" className={inputCls} maxLength={120} />
            </div>

            <div>
              <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-1.5">Email *</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com" className={inputCls} />
            </div>

            <div>
              <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-1.5">Phone (optional)</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210" className={inputCls} />
            </div>

            <button onClick={() => { if (form.email) onSubmitSeeker({ ...form, city }); }}
              className="w-full py-3.5 bg-teal text-bg font-syn font-extrabold uppercase tracking-widest text-sm rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_15px_rgba(62,207,200,0.25)]">
              Drop Seeker Pin
            </button>

            <p className="text-[9px] text-text3 text-center">We won&apos;t share your email publicly. Seeker pins auto-expire after 30 days.</p>
          </div>
        )}
      </div>
    </div>
  );
}
