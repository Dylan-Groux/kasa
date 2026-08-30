'use client';

import { useEffect, useRef } from 'react';
import styles from './MobileMenuWave.module.css';

type MobileMenuWaveProps = {
  isOpen: boolean;
  onRevealedChange: (revealed: boolean) => void;
};

const DURATION_MS = 900;
const POINTS = 40;

// Dessine une frame du remplissage liquide : `p` (0→1) est le taux de
// remplissage. L'amplitude est maximale au milieu et retombe à 0 aux deux
// bouts, pour que la vague s'aplatisse une fois pleine ou vide au lieu de
// laisser une ondulation permanente.
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

// Boucle rAF impérative qui modifie directement l'attribut `d` du path SVG
// (sans passer par le state React à chaque frame) — un setState par frame
// serait inutile et bien plus lent qu'une mutation directe via la ref.
export function MobileMenuWave({ isOpen, onRevealedChange }: MobileMenuWaveProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const phaseRef = useRef(0);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) {
      return;
    }

    // À la fermeture, le texte disparaît tout de suite (pas à la fin de la
    // vidange) — il part avant que la vague ne se retire. À l'ouverture, le
    // texte n'apparaît qu'une fois la vague complètement montée.
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
      phaseRef.current += 0.15; // la crête continue de rouler pendant la montée/descente
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
