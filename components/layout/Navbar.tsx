'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { HeartIcon } from '@/components/icons/HeartIcon';
import { MessageIcon } from '@/components/icons/MessageIcon';
import { MenuIcon } from '@/components/icons/MenuIcon';
import { CloseIcon } from '@/components/icons/CloseIcon';
import { Button } from '@/components/ui/Button';
import { MobileMenuWave } from './MobileMenuWave';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/a-propos', label: 'À propos' },
];

// Order and content match the mobile menu reference: plain text links (no
// icons), Messagerie/Favoris included inline rather than in a separate
// icon row, "Ajouter un logement" last as a full brand button.
const MOBILE_NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/messagerie', label: 'Messagerie' },
  { href: '/favoris', label: 'Favoris' },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // True only once the wave has fully finished rising (or draining) — the nav
  // links fade in on top of the liquid only after it has filled the screen,
  // and disappear once it has fully drained, rather than moving with it.
  const [isRevealed, setIsRevealed] = useState(false);
  const handleRevealedChange = useCallback((revealed: boolean) => setIsRevealed(revealed), []);

  return (
    <header className={styles.wrapper}>
      <div className={styles.bar}>
        <nav className={styles.linksDesktop} aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.logoMobile}>
          <Logo variant="icon" />
        </div>
        <div className={styles.logoDesktop}>
          <Logo />
        </div>

        <div className={styles.actionsDesktop}>
          <Link href="/logement/ajouter" className={styles.addLink}>
            +Ajouter un logement
          </Link>
          <Link href="/favoris" aria-label="Favoris" className={styles.iconLink}>
            <HeartIcon className={styles.actionIcon} />
          </Link>
          <span className={styles.divider} aria-hidden="true" />
          <Link href="/messagerie" aria-label="Messagerie" className={styles.iconLink}>
            <MessageIcon className={styles.actionIcon} />
          </Link>
        </div>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Always mounted (not conditional on isMenuOpen) so the wave can
          animate in both directions. `inert` (not aria-hidden) removes it
          from focus/hit-testing/the accessibility tree the instant it starts
          closing, while still letting the drain animation play visually. */}
      <nav
        id="mobile-menu"
        className={styles.mobileMenu}
        aria-label="Navigation mobile"
        inert={!isMenuOpen}
      >
        <MobileMenuWave isOpen={isMenuOpen} onRevealedChange={handleRevealedChange} />

        <div
          className={[styles.mobileContent, isRevealed ? styles.revealed : '']
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles.mobileLinks}>
            {MOBILE_NAV_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.mobileLink}
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Button
            href="/logement/ajouter"
            variant="brand"
            className={styles.mobileAddButton}
            style={{ transitionDelay: `${MOBILE_NAV_LINKS.length * 60}ms` }}
          >
            Ajouter un logement
          </Button>
        </div>
      </nav>
    </header>
  );
}
