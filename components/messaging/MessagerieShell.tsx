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
 * Responsive master-detail shell, matching the Figma frames: one combined
 * desktop screen ("Messagerie") vs. two separate mobile screens ("messagerie
 * mobile liste" / "messagerie mobile detail"). Both panes always render in
 * the DOM (same pattern as Navbar/PropertyDetail — CSS Modules + @media, no
 * separate mobile routes); on mobile only one is visible at a time, decided
 * by whether the URL has a conversation id (deep-link) rather than local UI
 * state. The mobile header (back link + "Messages" title) swaps content
 * based on that same condition — back goes to "/" from the list, to
 * "/messagerie" from a thread — while desktop shows a single static header
 * since both panes are already visible together there.
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
