'use client';

import { useEffect, useRef } from 'react';
import styles from './MobileMenuWave.module.css';

type MobileMenuWaveProps = {
  isOpen: boolean;
  onRevealedChange: (revealed: boolean) => void;
};

const DURATION_MS = 900;
const POINTS = 40;

// Draws one frame of the liquid fill: `p` (0→1) is how full the screen is.
// Amplitude peaks mid-transition and flattens back to 0 at both ends (0 and
// 1), so the wave crest rises then settles flat instead of leaving a
// permanent ripple once fully open or fully closed.
function buildWavePath(p: number, phase: number): string {
  const baseline = 100 - p * 100;
  const amplitude = 7 * Math.sin(p * Math.PI);
  let d = 'M0,120';
  for (let i = 0; i <= POINTS; i += 1) {
    const x = (i / POINTS) * 100;
    const y = baseline + amplitude * Math.sin((x / 100) * Math.PI * 3.2 + phase);
    d += ` L${x},${y}`;
  }
  d += ' L100,120 Z';
  return d;
}

// Imperative rAF loop driving an SVG path's `d` attribute directly (bypassing
// React state per-frame, same as the reference implementation) — a state
// update on every animation frame would be both unnecessary and much slower
// than mutating the path node straight from the ref.
export function MobileMenuWave({ isOpen, onRevealedChange }: MobileMenuWaveProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const phaseRef = useRef(0);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) {
      return;
    }

    // Closing hides the text immediately (not at the end of the drain) so it
    // disappears first and the wave retreats after — opening still reveals
    // the text only once the wave has fully risen.
    if (!isOpen) {
      onRevealedChange(false);
    }

    const start = performance.now();
    if (frameRef.current !== undefined) {
      cancelAnimationFrame(frameRef.current);
    }

    function frame(now: number) {
      const t = Math.min((now - start) / DURATION_MS, 1);
      const eased = 1 - (1 - t) ** 3; // easeOutCubic
      phaseRef.current += 0.15; // the crest keeps rolling while it rises/drains
      path!.setAttribute('d', buildWavePath(isOpen ? eased : 1 - eased, phaseRef.current));

      if (t < 1) {
        frameRef.current = requestAnimationFrame(frame);
      } else if (isOpen) {
        onRevealedChange(true);
      }
    }

    frameRef.current = requestAnimationFrame(frame);

    return () => {
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isOpen, onRevealedChange]);

  return (
    <div className={styles.waveLayer} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path ref={pathRef} fill="var(--color-white)" />
      </svg>
    </div>
  );
}
