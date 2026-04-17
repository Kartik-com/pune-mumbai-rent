'use client';

import { useState } from 'react';

const STEPS = [
  {
    title: 'Pin Your Rent',
    desc: 'Tap anywhere on the map to drop a pin. Share your rent anonymously to help the community. 📍',
  },
  {
    title: 'Reading the Map',
    desc: 'Blue pins are gated societies. Orange pins are independent buildings/stands. 🔵 🟠',
  },
  {
    title: 'Find Rents Near You',
    desc: 'Zoom in to see exact prices. Use clusters to see how many flats are available in an area. 🔍',
  },
  {
    title: 'Area Stats',
    desc: 'Click the square icon on the right, then tap two corners to draw a rectangle and see average rents in that area! 📊',
  },
  {
    title: 'Metro Lines',
    desc: 'Use the metro toggle to see how far a rental is from the nearest station. 🚇',
  },
  {
    title: 'Green Cover',
    desc: 'Toggle the green cover map to find areas with dense trees vs concrete jungles. 🌿',
  },
  {
    title: 'Find a Flat',
    desc: 'Looking for a place? Click the Flat Hunt button to drop a "Looking" pin and get matched! 🏠',
  },
];

export default function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onClose();
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="glass w-full max-w-sm rounded-[24px] p-6 shadow-2xl relative overflow-hidden animate-[popup-enter_0.3s_ease-out]">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-surface2">
          <div 
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-text3 hover:text-text1">
          ✕
        </button>

        <div className="text-[10px] font-syn font-extrabold uppercase tracking-[0.2em] text-accent mb-4 mt-2">
          Step {step + 1} of {STEPS.length}
        </div>

        <h2 className="font-syn font-bold text-2xl text-text1 mb-3 leading-tight">
          {STEPS[step].title}
        </h2>
        
        <p className="text-sm text-text2 font-dm leading-relaxed mb-8 min-h-[60px]">
          {STEPS[step].desc}
        </p>

        <div className="flex items-center gap-3">
          {step > 0 && (
            <button 
              onClick={prevStep}
              className="px-5 py-3 rounded-xl font-syn font-bold text-xs uppercase tracking-wider text-text2 hover:bg-surface1 transition-colors"
            >
              Back
            </button>
          )}
          
          <button 
            onClick={nextStep}
            className="flex-1 bg-accent text-bg px-5 py-3 rounded-xl font-syn font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(232,197,71,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            {step === STEPS.length - 1 ? "Let's Go!" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
