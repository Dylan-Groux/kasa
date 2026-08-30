'use client';

import { usePathname } from 'next/navigation';
import { ChevronLeftIcon } from '@/components/icons/ChevronLeftIcon';
import { Button } from '@/components/ui/Button';
import { useMessaging } from '@/lib/messaging/MessagingContext';
import { ConversationList } from './ConversationList';
import styles from './MessagerieShell.module.css';

type MessagerieShellProps = {
  children: React.ReactNode;
};

/**
 * Shell responsive en maître-détail : un écran desktop combiné vs. deux
 * écrans mobiles séparés. Les deux volets sont toujours dans le DOM (CSS
 * Modules + @media, pas de routes mobiles séparées) ; sur mobile, un seul
 * est visible à la fois, selon que l'URL contient un id de conversation
 * (deep-link) plutôt qu'un state local. L'en-tête mobile (retour + titre)
 * change selon cette même condition — retour vers "/" depuis la liste, vers
 * "/messagerie" depuis un fil — desktop affiche un en-tête statique unique
 * puisque les deux volets sont déjà visibles ensemble.
 */
export function MessagerieShell({ children }: MessagerieShellProps) {
  const pathname = usePathname();
  const { unreadCount } = useMessaging();
  const hasActiveConversation = pathname !== '/messagerie';

  const listClasses = [styles.listPane, hasActiveConversation ? styles.hiddenOnMobile : '']
    .filter(Boolean)
    .join(' ');
  const detailClasses = [styles.detailPane, hasActiveConversation ? '' : styles.hiddenOnMobile]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.page}>
      <div className={styles.mobileHeader}>
        <Button
          href={hasActiveConversation ? '/messagerie' : '/'}
          variant="muted"
          icon={<ChevronLeftIcon />}
          className={styles.backButton}
        >
          Retour
        </Button>
        {!hasActiveConversation ? (
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Messages</h1>
            {unreadCount > 0 ? (
              <span
                className={styles.unreadBadge}
                aria-label={`${unreadCount} conversation(s) non lue(s)`}
              >
                {unreadCount}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={styles.desktopHeader}>
        <h1 className={styles.title}>Messages</h1>
        {unreadCount > 0 ? (
          <span
            className={styles.unreadBadge}
            aria-label={`${unreadCount} conversation(s) non lue(s)`}
          >
            {unreadCount}
          </span>
        ) : null}
      </div>

      <div className={styles.container}>
        <div className={listClasses}>
          <ConversationList />
        </div>
        <div className={detailClasses}>{children}</div>
      </div>
    </div>
  );
}
