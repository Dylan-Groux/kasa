import { Avatar } from '@/components/ui/Avatar';
import { formatMessageTime } from '@/lib/messaging/timestampFormatting';
import type { MessageSchema } from '@/lib/proxy/schemas/messages/messageBase.schema';
import styles from './MessageBubble.module.css';

type MessageBubbleProps = {
  message: MessageSchema;
  isOwnMessage: boolean;
};

// The reusable "message card": name + time above, avatar and content below, aligned left/right depending on who sent it.
export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const classes = [styles.row, isOwnMessage ? styles.own : styles.other].join(' ');

  return (
    <div className={classes}>
      <div className={styles.header}>
        <span className={styles.author}>{message.sender.name}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={message.created_at}>{formatMessageTime(message.created_at)}</time>
      </div>
      <div className={styles.bubbleRow}>
        <Avatar name={message.sender.name} picture={message.sender.picture} size={32} />
        <p className={styles.bubble}>{message.content}</p>
      </div>
    </div>
  );
}
