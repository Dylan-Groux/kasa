import type { MessageSchema } from '@/lib/proxy/schemas/messages/messageBase.schema';
import { isSameLocalDay, toLocalDayKey } from './dateUtils';

export type MessageDayGroup = {
  date: string;
  label: string;
  messages: MessageSchema[];
};

/**
 * Buckets a flat, chronologically-sorted message list by local calendar day
 * so the UI can render a date separator between days. Done client-side
 * because the backend returns UTC timestamps without grouping (see
 * conversationMessages.schema.ts) — only the viewer's browser reliably knows
 * which timezone is relevant for "today"/"yesterday".
 */
export function groupMessagesByDay(messages: MessageSchema[]): MessageDayGroup[] {
  const groups: MessageDayGroup[] = [];

  for (const message of messages) {
    const createdAt = new Date(message.created_at);
    const dayKey = toLocalDayKey(createdAt);
    const currentGroup = groups[groups.length - 1];

    if (currentGroup && currentGroup.date === dayKey) {
      currentGroup.messages.push(message);
    } else {
      groups.push({ date: dayKey, label: formatDayLabel(createdAt), messages: [message] });
    }
  }

  return groups;
}

function formatDayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameLocalDay(date, today)) {
    return "Aujourd'hui";
  }
  if (isSameLocalDay(date, yesterday)) {
    return 'Hier';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
