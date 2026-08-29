import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { useMessaging } from '@/lib/messaging/MessagingContext';
import { formatConversationPreviewTimestamp } from '@/lib/messaging/timestampFormatting';
import type { ConversationSchema } from '@/lib/proxy/schemas/conversations/conversationBase.schema';
import styles from './ConversationListItem.module.css';

type ConversationListItemProps = {
  conversation: ConversationSchema;
  isActive: boolean;
};

export function ConversationListItem({ conversation, isActive }: ConversationListItemProps) {
  const { isConversationUnread } = useMessaging();
  const { other_participant: otherParticipant, last_message: lastMessage } = conversation;
  const isUnread = isConversationUnread(conversation.id);
  const classes = [styles.item, isActive ? styles.active : '', isUnread ? styles.unreadRow : '']
    .filter(Boolean)
    .join(' ');

  return (
    <Link
      href={`/messagerie/${conversation.id}`}
      className={classes}
      aria-current={isActive ? 'page' : undefined}
    >
      <Avatar name={otherParticipant.name} picture={otherParticipant.picture} size={48} />
      <div className={styles.details}>
        <div className={styles.topRow}>
          <span className={styles.name}>{otherParticipant.name}</span>
          {lastMessage ? (
            <time className={styles.timestamp} dateTime={lastMessage.created_at}>
              {formatConversationPreviewTimestamp(lastMessage.created_at)}
            </time>
          ) : null}
        </div>
        <p className={[styles.preview, isUnread ? styles.unread : ''].filter(Boolean).join(' ')}>
          {lastMessage?.content ?? 'Démarrez la conversation'}
        </p>
      </div>
      {isUnread ? <span className={styles.unreadDot} aria-hidden="true" /> : null}
    </Link>
  );
}
