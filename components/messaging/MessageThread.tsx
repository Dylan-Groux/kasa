import { groupMessagesByDay } from '@/lib/messaging/groupMessagesByDay';
import type { MessageSchema } from '@/lib/proxy/schemas/messages/messageBase.schema';
import { DateSeparator } from './DateSeparator';
import { MessageBubble } from './MessageBubble';
import styles from './MessageThread.module.css';

type MessageThreadProps = {
  messages: MessageSchema[];
  currentUserId: number;
};

export function MessageThread({ messages, currentUserId }: MessageThreadProps) {
  const days = groupMessagesByDay(messages);

  if (days.length === 0) {
    return <p className={styles.empty}>Envoyez le premier message de cette conversation.</p>;
  }

  return (
    <div className={styles.thread}>
      {days.map((day) => (
        <div key={day.date} className={styles.day}>
          <DateSeparator label={day.label} />
          {day.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.sender.id === currentUserId}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
