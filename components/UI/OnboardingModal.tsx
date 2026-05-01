'use client';

import { useState } from 'react';
import Link from 'next/link';

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
        <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#1da1f2]"></span> <span className="font-bold text-text1">Blue pin</span> = Gated</li>
        <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#f39c12]"></span> <span className="font-bold text-text1">Orange pin</span> = Non-gated</li>
        <li className="flex items-center gap-2"><span className="bg-[#3ec87a]/20 text-[#3ec87a] px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-tighter">AVAILABLE</span> <span className="text-text2">= Full flat</span></li>
        <li className="flex items-center gap-2"><span className="bg-[#20cfc8]/20 text-[#20cfc8] px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-tighter">ROOM</span> <span className="text-text2">= Flatmate</span></li>
      </ul>
    ),
    emoji: '🗺️',
  },
  {
    title: 'Flat Hunt Matchmaker',
    desc: 'Looking for a flatmate or a specific flat? Use "Flat Hunt" to create your seeker profile and get matched.',
    emoji: '🤝',
  },
  {
    title: 'Advanced Map Tools',
    desc: 'Use "Area Stats" to draw a circle and see average rents, or toggle "Green Cover" for satellite views.',
    emoji: '🛠️',
  },
];

export default function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<'welcome' | 'steps'>('welcome');
  const [step, setStep] = useState(0);

  const handleStart = () => {
    localStorage.setItem('seenOnboarding', 'true');
    onClose();
  };

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleStart();
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div 
        className="glass w-full max-w-sm max-h-[92vh] overflow-y-auto rounded-[32px] p-6 sm:p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-border1 relative animate-[popup-enter_0.4s_cubic-bezier(0.16,1,0.3,1)] scrollbar-hide"
        onClick={e => e.stopPropagation()}
      >
        {view === 'welcome' ? (
          <div className="flex flex-col items-center text-center">
            {/* Trust Badge */}
            <div className="bg-accent/10 text-accent px-4 py-1.5 rounded-full text-[10px] font-syn font-bold uppercase tracking-[0.2em] mb-5 sm:mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              🛡️ WHAT&apos;S LIVE RIGHT NOW
            </div>

            <h2 className="text-2xl sm:text-3xl font-syn font-black text-text1 uppercase tracking-tighter leading-none mb-6 sm:mb-8">
              We build trust <br/><span className="text-accent">together</span>
            </h2>

            {/* Stats Grid */}
            <div className="w-full space-y-3 mb-6 sm:mb-8">
              {[
                { emoji: '🏠', count: '116', label: 'flats listed for rent' },
                { emoji: '👤', count: '1,495', label: 'people looking for a flat' },
                { emoji: '📍', count: '3,814', label: 'rents pinned anonymously' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 sm:gap-4 bg-surface2/50 p-3.5 sm:p-4 rounded-2xl border border-border1/50">
                  <span className="text-2xl">{s.emoji}</span>
                  <div className="flex flex-col items-start">
                    <span className="text-lg font-syn font-black text-text1 leading-none">{s.count}</span>
                    <span className="text-[10px] font-dm text-text3 uppercase font-bold tracking-wider">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-text2 leading-relaxed mb-8 sm:mb-10 px-2 font-dm">
              Real data from real neighbours. If something looks off — report it. You&apos;re the <span className="text-text1 font-bold">fact-checker</span> for your neighbourhood.
            </p>

            <div className="w-full space-y-3">
              <button 
                onClick={() => setView('steps')}
                className="w-full bg-accent text-bg py-3.5 sm:py-4 rounded-2xl font-syn font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Let&apos;s start, I&apos;ll keep it honest
              </button>
              
              <button 
                onClick={() => setView('steps')}
                className="w-full py-3.5 sm:py-4 rounded-2xl font-syn font-bold uppercase tracking-widest text-[10px] text-text3 hover:text-text1 transition-all"
              >
                Learn how to use
              </button>

              <button className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-syn font-bold text-green uppercase tracking-widest hover:opacity-80 transition-all mt-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Share on WhatsApp
              </button>
            </div>

            <p className="mt-6 sm:mt-8 text-[9px] text-text3 font-dm px-4">
              By moving forward to the map, you agree to our <Link href="/privacy" className="underline">Privacy Policy</Link> and <Link href="/terms" className="underline">Terms of Use</Link>
            </p>
          </div>
        ) : (
          <div>
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-surface2">
              <div 
                className="h-full bg-accent transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>

            <div className="flex flex-col items-center text-center mt-4">
              <div className="text-4xl sm:text-5xl mb-6 sm:mb-8 animate-[bounce_2s_infinite]">
                {STEPS[step].emoji}
              </div>

              <h2 className="font-syn font-bold text-xl sm:text-2xl text-text1 mb-3 sm:mb-4 leading-tight tracking-tight">
                {STEPS[step].title}
              </h2>
              
              <div className="text-[14px] sm:text-[15px] text-text2 font-dm leading-relaxed mb-8 sm:mb-12 min-h-[80px] sm:min-h-[100px] flex items-center justify-center">
                {STEPS[step].desc}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('welcome')}
                className="px-6 py-4 rounded-2xl font-syn font-bold text-xs uppercase tracking-widest text-text3 hover:text-text1 transition-all"
              >
                Back
              </button>
              
              <button 
                onClick={nextStep}
                className="flex-1 bg-accent text-bg px-6 py-3.5 sm:py-4 rounded-2xl font-syn font-extrabold text-xs uppercase tracking-widest shadow-xl transition-all"
              >
                {step === STEPS.length - 1 ? "Start Exploration ✓" : "Next →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
