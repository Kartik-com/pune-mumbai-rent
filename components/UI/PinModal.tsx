import React, { useState } from 'react';

export default function PinModal({
  onClose,
  onSubmit,
  lat,
  lng,
}: {
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  lat: number;
  lng: number;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    category: 'residential',
    sub_type: 'flat',
    bhk: 2,
    rent: '',
    includes_maint: false,
    furnished: 'unfurnished',
    gated: false,
    society: '',
    occupant: '',
    deposit_months: '',
    pets_allowed: false,
    sqft: '',
    flatmate_wanted: false,
    note: '',
    available: false,
    available_from: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.society || (!form.rent && form.category !== 'commercial')) return; // Just safety
    onSubmit({
      ...form,
      rent: parseInt(form.rent) || 0,
      deposit_months: form.deposit_months ? parseInt(form.deposit_months) : null,
      sqft: form.sqft ? parseInt(form.sqft) : null,
      occupant: form.occupant || null,
      note: form.note || null,
      available_from: form.available_from || null,
      phone: form.phone || null,
    });
  };

  const inputCls = "w-full px-3.5 py-2.5 bg-surface border border-border2 rounded-lg text-text1 placeholder-text3 text-sm focus:border-accent focus:shadow-[0_0_8px_rgba(232,197,71,0.15)] outline-none transition-all";

  return (
    <div className="fixed inset-0 z-[3000] flex items-end lg:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass rounded-t-2xl lg:rounded-2xl w-full max-w-md max-h-[88vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lg:hidden w-10 h-1 bg-border2 rounded-full mx-auto mt-3" />
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-border1 pb-3">
            <div>
              <h2 className="text-text1 font-syn font-bold text-base uppercase tracking-widest">
                {step === 1 ? 'What are you listing?' : 'Pin Details'}
              </h2>
              <p className="text-[10px] text-text3 mt-1">Anonymous · No account needed</p>
            </div>
            <button type="button" onClick={onClose} className="text-text3 hover:text-text1 text-xl">✕</button>
          </div>

          <p className="text-[10px] font-syn tracking-widest uppercase text-accent font-bold">📍 {lat.toFixed(4)}, {lng.toFixed(4)}</p>

          {step === 1 && (
            <div className="space-y-4">
              <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-2">Residential</label>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => { setForm({ ...form, category: 'residential', sub_type: 'flat' }); setStep(2); }} className="py-3 items-center justify-center flex rounded-xl text-sm font-bold bg-surface2 text-text3 border-border2 hover:border-text3 border transition-all hover:bg-surface3">Flat</button>
                <button type="button" onClick={() => { setForm({ ...form, category: 'residential', sub_type: 'villa' }); setStep(2); }} className="py-3 items-center justify-center flex rounded-xl text-sm font-bold bg-surface2 text-text3 border-border2 hover:border-text3 border transition-all hover:bg-surface3">Villa</button>
                <button type="button" onClick={() => { setForm({ ...form, category: 'residential', sub_type: 'room' }); setStep(2); }} className="py-3 items-center justify-center flex rounded-xl text-sm font-bold bg-surface2 text-text3 border-border2 hover:border-text3 border transition-all hover:bg-surface3">Room</button>
              </div>
              <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-2 mt-4">Commercial Space</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => { setForm({ ...form, category: 'commercial', sub_type: 'shop' }); setStep(2); }} className="py-3 flex rounded-xl text-sm font-bold bg-surface2 text-text3 border-border2 hover:border-text3 items-center justify-center border transition-all hover:bg-surface3">Shop</button>
                <button type="button" onClick={() => { setForm({ ...form, category: 'commercial', sub_type: 'office' }); setStep(2); }} className="py-3 flex rounded-xl text-sm font-bold bg-surface2 text-text3 border-border2 hover:border-text3 items-center justify-center border transition-all hover:bg-surface3">Office Space</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <>
          {/* BHK */}
          {form.category === 'residential' && (
            <div>
              <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-2">BHK *</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setForm({ ...form, bhk: n })}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                      form.bhk === n ? 'bg-accent text-bg border-accent' : 'bg-surface2 text-text3 border-border2 hover:border-text3'
                    }`}
                  >{n}{n === 5 ? '+' : ''}</button>
                ))}
              </div>
            </div>
          )}

          {/* Rent */}
          <div>
            <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-2">Monthly Rent (₹) *</label>
            <input type="number" required value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })}
              placeholder="e.g. 25000" className={inputCls + " font-syn font-bold text-lg"} />
          </div>

          {/* Society */}
          <div>
            <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-2">Society / Building *</label>
            <input type="text" required value={form.society} onChange={(e) => setForm({ ...form, society: e.target.value })}
              placeholder="e.g. Prestige Lakeside" className={inputCls} />
          </div>

          {/* Furnishing */}
          {form.category === 'residential' && (
            <div>
              <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-2">Furnishing</label>
              <div className="flex gap-1.5">
                {['unfurnished', 'semi', 'furnished'].map(f => (
                  <button key={f} type="button" onClick={() => setForm({ ...form, furnished: f })}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border capitalize transition-all ${
                      form.furnished === f ? 'bg-accent text-bg border-accent' : 'bg-surface2 text-text3 border-border2'
                    }`}
                  >{f}</button>
                ))}
              </div>
            </div>
          )}

          {/* Toggle Row */}
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm({ ...form, gated: !form.gated })}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${form.gated ? 'bg-[var(--pin-gated)] text-bg border-[var(--pin-gated)]' : 'bg-surface2 text-text3 border-border2'}`}>
              🏢 Gated
            </button>
            <button type="button" onClick={() => setForm({ ...form, includes_maint: !form.includes_maint })}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${form.includes_maint ? 'bg-green text-bg border-green' : 'bg-surface2 text-text3 border-border2'}`}>
              💰 +Maint
            </button>
            <button type="button" onClick={() => setForm({ ...form, pets_allowed: !form.pets_allowed })}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${form.pets_allowed ? 'bg-pink text-bg border-pink' : 'bg-surface2 text-text3 border-border2'}`}>
              🐾 Pets
            </button>
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-1.5">Deposit (months)</label>
              <input type="number" value={form.deposit_months} onChange={(e) => setForm({ ...form, deposit_months: e.target.value })}
                placeholder="e.g. 2" className={inputCls} />
            </div>
            <div>
              <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-1.5">Sqft</label>
              <input type="number" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })}
                placeholder="e.g. 850" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-1.5">Occupant</label>
            <div className="flex gap-1.5">
              {['Family', 'Bachelor', 'Couple', 'Any'].map(o => (
                <button key={o} type="button" onClick={() => setForm({ ...form, occupant: o })}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    form.occupant === o ? 'bg-accent text-bg border-accent' : 'bg-surface2 text-text3 border-border2'
                  }`}
                >{o}</button>
              ))}
            </div>
          </div>

          {/* WhatsApp / Contact */}
          <div>
            <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-1.5">
              WhatsApp Number *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text3 text-sm font-bold">+91</span>
              <input 
                type="tel" 
                required 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="98765 43210" 
                className={inputCls + " pl-12 font-syn font-bold"} 
              />
            </div>
            <p className="text-[9px] text-text3 mt-1.5 px-1 italic">Landlords: This number is hidden from the map and only revealed to verified seekers.</p>
          </div>

          {/* Note */}
          <div>
            <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-1.5">
              {form.category === 'commercial' ? 'Suitable For / Details (optional)' : 'One-liner (optional)'}
            </label>
            <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder={form.category === 'commercial' ? "e.g. Good for boutique, great visibility" : "e.g. Sunny balcony, quiet lane"} className={inputCls} maxLength={100} />
          </div>

          {/* Available toggle */}
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm({ ...form, available: !form.available })}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${form.available ? 'bg-green text-bg border-green' : 'bg-surface2 text-text3 border-border2'}`}>
              🏠 Currently Available
            </button>
            <button type="button" onClick={() => setForm({ ...form, flatmate_wanted: !form.flatmate_wanted })}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${form.flatmate_wanted ? 'bg-teal text-bg border-teal' : 'bg-surface2 text-text3 border-border2'}`}>
              🤝 Flatmate Wanted
            </button>
          </div>

          <button type="submit"
            className="w-full py-3.5 bg-accent text-bg font-syn font-extrabold uppercase tracking-widest text-sm rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_20px_rgba(232,197,71,0.25)] mt-2"
          >
            📍 Pin Securely
          </button>

          <p className="text-[9px] text-text3 text-center">Your IP is hashed for spam prevention. No login. No tracking.</p>
          </>
          )}
        </form>
      </div>
    </div>
  );
}
