'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Step {
  selector: string;
  title: string;
  desc: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const STEPS: Step[] = [
  {
    selector: '#topbar-nav',
    title: 'City Navigation',
    desc: 'Switch between cities and see live rental statistics at a glance.',
    position: 'bottom',
  },
  {
    selector: '#map-area',
    title: 'Interactive Map',
    desc: 'Explore the city. Click on clusters to zoom in and see individual rent pins.',
    position: 'top',
  },
  {
    selector: '#pin-cta-container',
    title: 'Share Your Rent',
    desc: 'Help your community by pinning your rent anonymously. No account needed.',
    position: 'top',
  },
  {
    selector: '#right-controls',
    title: 'Advanced Tools',
    desc: 'Toggle Heatmaps, Metro lines, and Green Cover to analyze your neighborhood.',
    position: 'left',
  },
];

export default function CoachMarks({ onFinish }: { onFinish: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const updateSpotlight = useCallback(() => {
    const step = STEPS[stepIndex];
    const el = document.querySelector(step.selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      
      // Smooth scroll if needed
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [stepIndex]);

  useEffect(() => {
    // Small delay to ensure elements are rendered and animations finished
    const timer = setTimeout(() => {
      updateSpotlight();
      setIsVisible(true);
    }, 500);

    window.addEventListener('resize', updateSpotlight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSpotlight);
    };
  }, [updateSpotlight]);

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('seenTour', 'true');
    setIsVisible(false);
    setTimeout(onFinish, 300);
  };

  if (!targetRect || !isVisible) return null;

  const step = STEPS[stepIndex];
  
  // Tooltip positioning
  const getTooltipStyle = () => {
    const gap = 15;
    if (step.position === 'bottom') {
      return { top: targetRect.bottom + gap, left: targetRect.left + (targetRect.width / 2) - 150 };
    }
    if (step.position === 'top') {
      return { top: targetRect.top - 200 - gap, left: targetRect.left + (targetRect.width / 2) - 150 };
    }
    if (step.position === 'left') {
      return { top: targetRect.top + (targetRect.height / 2) - 100, left: targetRect.left - 320 - gap };
    }
    return { top: targetRect.top, left: targetRect.right + gap };
  };

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden">
      {/* ── SVG MASK (Spotlight) ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect 
              x={targetRect.left - 8} 
              y={targetRect.top - 8} 
              width={targetRect.width + 16} 
              height={targetRect.height + 16} 
              rx="12" 
              fill="black" 
              className="transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            />
          </mask>
        </defs>
        <rect 
          x="0" y="0" width="100%" height="100%" 
          fill="rgba(0,0,0,0.8)" 
          mask="url(#spotlight-mask)"
          className="backdrop-blur-[2px]"
        />
      </svg>

      {/* ── TOOLTIP ── */}
      <div 
        className="fixed z-[10001] w-[300px] glass p-6 rounded-[24px] border border-accent/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={getTooltipStyle() as React.CSSProperties}
      >
        {/* Progress Dots */}
        <div className="flex gap-1 mb-4">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-300 ${i === stepIndex ? 'w-6 bg-accent' : 'w-2 bg-text3/30'}`} 
            />
          ))}
        </div>

        <h3 className="text-lg font-syn font-black text-text1 uppercase tracking-tight mb-2">
          {step.title}
        </h3>
        <p className="text-sm text-text2 leading-relaxed mb-6 font-dm">
          {step.desc}
        </p>

        <div className="flex items-center justify-between">
          <button 
            onClick={handleFinish}
            className="text-[10px] font-syn font-bold text-text3 uppercase tracking-widest hover:text-text1 transition-colors"
          >
            Skip
          </button>
          
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button 
                onClick={handleBack}
                className="px-4 py-2 rounded-xl text-[10px] font-syn font-bold uppercase tracking-widest text-text2 hover:bg-surface1 transition-all"
              >
                Back
              </button>
            )}
            <button 
              onClick={handleNext}
              className="bg-accent text-bg px-5 py-2.5 rounded-xl text-[10px] font-syn font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              {stepIndex === STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
