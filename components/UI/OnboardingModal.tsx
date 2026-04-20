'use client';

import { useState } from 'react';

const STEPS = [
  {
    title: 'Find real rents around you',
    desc: 'Explore what people actually pay in your city. No brokers. No fake listings.',
    emoji: '🏠',
  },
  {
    title: 'Pin your rent',
    desc: 'Tap anywhere on the map to add your rent, BHK, and details. No login needed.',
    emoji: '📍',
  },
  {
    title: 'Reading the map',
    desc: (
      <ul className="space-y-1.5 list-none text-left inline-block">
        <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#1da1f2] shadow-[0_0_8px_rgba(29,161,242,0.4)]"></span> <span className="font-bold text-text1">Blue pin</span> = Gated</li>
        <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#f39c12] shadow-[0_0_8px_rgba(243,156,18,0.4)]"></span> <span className="font-bold text-text1">Orange pin</span> = Non-gated</li>
        <li className="flex items-center gap-2"><span className="bg-[#3ec87a]/20 text-[#3ec87a] px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-tighter">AVAILABLE</span> <span className="text-text2">= Full flat</span></li>
        <li className="flex items-center gap-2"><span className="bg-[#20cfc8]/20 text-[#20cfc8] px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-tighter">ROOM</span> <span className="text-text2">= Flatmate</span></li>
        <li className="flex items-center gap-2"><span className="text-text3 italic text-xs">Clusters = Multiple listings (zoom in)</span></li>
      </ul>
    ),
    emoji: '🗺️',
  },
  {
    title: 'Find rents near you',
    desc: 'Use the location button to jump to your area and see nearby rents instantly.',
    emoji: '🔍',
  },
  {
    title: 'Area stats',
    desc: 'Select an area to see average rent, listings count, and property types.',
    emoji: '📊',
  },
  {
    title: 'Metro lines + stations',
    desc: 'Enable metro view and filter listings by distance from nearest station.',
    emoji: '🚇',
  },
  {
    title: 'Find flat or tenants',
    desc: 'Drop a pin to find a place or list your property. No middleman.',
    emoji: '🤝',
  },
];

export default function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  const nextStep = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('seenOnboarding', 'true');
      onClose();
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    localStorage.setItem('seenOnboarding', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={handleSkip}>
      <div 
        className="glass w-full max-w-sm rounded-[32px] p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-border1 relative overflow-hidden animate-[popup-enter_0.4s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-surface2">
          <div 
            className="h-full bg-accent transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_0_15px_rgba(232,197,71,0.6)]"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <button 
          onClick={handleSkip} 
          className="absolute top-6 right-6 text-text3 hover:text-text1 transition-all hover:rotate-90 p-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="flex flex-col items-center text-center mt-4">
          <div className="text-5xl mb-8 animate-[bounce_2s_infinite] transition-all duration-500 transform hover:scale-110">
            {STEPS[step].emoji}
          </div>

          <div className="text-[11px] font-syn font-extrabold uppercase tracking-[0.3em] text-accent/90 mb-4 bg-accent/10 px-3 py-1 rounded-full">
            Step {step + 1} of {STEPS.length}
          </div>

          <h2 className="font-syn font-bold text-2xl text-text1 mb-4 leading-tight tracking-tight">
            {STEPS[step].title}
          </h2>
          
          <div className="text-[15px] text-text2 font-dm leading-relaxed mb-12 min-h-[100px] flex items-center justify-center">
            {typeof STEPS[step].desc === 'string' ? (
              <p>{STEPS[step].desc}</p>
            ) : (
              STEPS[step].desc
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {step > 0 ? (
            <button 
              onClick={prevStep}
              className="px-6 py-4 rounded-2xl font-syn font-bold text-xs uppercase tracking-widest text-text3 hover:text-text1 hover:bg-surface2 transition-all active:scale-95"
            >
              Back
            </button>
          ) : (
             <button 
              onClick={handleSkip}
              className="px-6 py-4 rounded-2xl font-syn font-bold text-xs uppercase tracking-widest text-text3 hover:text-text1 hover:bg-surface2 transition-all active:scale-95"
            >
              Skip
            </button>
          )}
          
          <button 
            onClick={nextStep}
            className="flex-1 bg-accent text-bg px-6 py-4 rounded-2xl font-syn font-extrabold text-xs uppercase tracking-widest shadow-[0_12px_24px_rgba(232,197,71,0.25)] hover:shadow-[0_16px_32px_rgba(232,197,71,0.35)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
          >
            {step === 0 ? "Let's go →" : (step === STEPS.length - 1 ? "Done ✓" : "Next →")}
          </button>
        </div>
      </div>
    </div>
  );
}
