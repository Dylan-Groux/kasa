'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { HeartIcon } from '@/components/icons/HeartIcon';
import { MessageIcon } from '@/components/icons/MessageIcon';
import { MenuIcon } from '@/components/icons/MenuIcon';
import { CloseIcon } from '@/components/icons/CloseIcon';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/a-propos', label: 'À propos' },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

        <Logo />

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

      {isMenuOpen ? (
        <nav id="mobile-menu" className={styles.mobileMenu} aria-label="Navigation mobile">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.mobileLink}>
              {link.label}
            </Link>
          ))}
          <Link href="/logement/ajouter" className={styles.mobileLink}>
            +Ajouter un logement
          </Link>
          <div className={styles.mobileIcons}>
            <Link href="/favoris" className={styles.mobileIconLink}>
              <HeartIcon className={styles.actionIcon} />
              Favoris
            </Link>
            <Link href="/messagerie" className={styles.mobileIconLink}>
              <MessageIcon className={styles.actionIcon} />
              Messagerie
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
