'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Volume2, X, Navigation, Sparkles } from 'lucide-react';

export interface ActiveBeacon {
  targetId: string;
  hindiInstruction: string;
  label?: string;
  timestamp: number;
}

interface MargdarshakSpotlightProps {
  beacon: ActiveBeacon | null;
  onDismiss: () => void;
  isPlayingAudio?: boolean;
}

interface RectBox {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
}

export default function MargdarshakSpotlight({
  beacon,
  onDismiss,
  isPlayingAudio = false,
}: MargdarshakSpotlightProps) {
  const [targetRect, setTargetRect] = useState<RectBox | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!beacon) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      const el = document.getElementById(beacon.targetId);
      if (el) {
        const r = el.getBoundingClientRect();
        // Add a small 6px padding around the element for the glowing radar ring
        setTargetRect({
          top: r.top - 6,
          left: r.left - 6,
          width: r.width + 12,
          height: r.height + 12,
          bottom: r.bottom + 6,
        });
      }
    };

    // Initial update
    updatePosition();

    // Track smooth scrolling and window resizing continuously
    let isTracking = true;
    let trackFrames = 0;
    const trackLoop = () => {
      if (!isTracking) return;
      updatePosition();
      trackFrames++;
      // Track actively during initial scroll animation (~120 frames / 2 seconds)
      if (trackFrames < 120) {
        animFrameRef.current = requestAnimationFrame(trackLoop);
      }
    };
    animFrameRef.current = requestAnimationFrame(trackLoop);

    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition, { passive: true });

    return () => {
      isTracking = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [beacon]);

  if (!beacon || !targetRect) return null;

  // Position the tooltip cleanly:
  // If target is in top 20% of screen: render tooltip BELOW the element with top: bbox.bottom + 14px.
  // Else: render tooltip ABOVE the element with bottom: window.innerHeight - bbox.top + 14px.
  const isTop20Percent = typeof window !== 'undefined' ? targetRect.top <= window.innerHeight * 0.2 : false;
  const tooltipStyle: React.CSSProperties = {
    minWidth: '280px',
    maxWidth: '380px',
    left: `${targetRect.left + targetRect.width / 2}px`,
    transform: 'translateX(-50%)',
    ...(isTop20Percent
      ? { top: `${targetRect.bottom + 14}px` }
      : { bottom: `${(typeof window !== 'undefined' ? window.innerHeight : 0) - targetRect.top + 14}px` }),
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-visible transition-opacity duration-300"
      aria-live="polite"
    >
      {/* Target Glowing Spotlight Box */}
      <div
        style={{
          top: `${targetRect.top}px`,
          left: `${targetRect.left}px`,
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
        }}
        className="absolute rounded-xl transition-all duration-150 ease-out border-4 border-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.85),0_0_15px_rgba(234,88,12,0.65),inset_0_0_15px_rgba(245,158,11,0.3)] pointer-events-none"
      >
        {/* Pulsing Radar Rings */}
        <div className="absolute -inset-2 rounded-2xl border-2 border-orange-500 animate-ping opacity-75 pointer-events-none" />
        <div className="absolute -inset-4 rounded-3xl border-2 border-amber-400 animate-beacon-radar opacity-60 pointer-events-none" />

        {/* Directional Pointer Arrow */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none ${
            !isTop20Percent ? '-top-12 animate-beacon-arrow' : '-bottom-12 rotate-180 animate-beacon-arrow'
          }`}
        >
          <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white p-2 rounded-full shadow-lg border-2 border-white ring-2 ring-orange-400">
            <Navigation className="w-5 h-5 fill-current transform rotate-180" />
          </div>
        </div>
      </div>

      {/* Floating Hindi Guidance Tooltip - pointer-events-none on container so it never blocks clicks */}
      <div
        style={tooltipStyle}
        className="fixed pointer-events-none bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-amber-400 backdrop-blur-md transition-all duration-300"
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1.5 mb-1.5">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>मार्गदर्शक (Margdarshak Beacon)</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isPlayingAudio && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span>बोल रहे हैं...</span>
              </span>
            )}
            <button
              type="button"
              onClick={onDismiss}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors pointer-events-auto"
              title="Dismiss Spotlight"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-sm font-semibold text-amber-100 leading-snug">
          {beacon.hindiInstruction}
        </p>

        {beacon.label && (
          <div className="mt-1.5 text-[11px] text-slate-300 font-mono bg-slate-800/80 px-2 py-0.5 rounded inline-block">
            फ़ोकस: {beacon.label}
          </div>
        )}
      </div>
    </div>
  );
}
