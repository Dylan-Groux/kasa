import type { MessageSchema } from '@/lib/proxy/schemas/messages/messageBase.schema';
import { isSameLocalDay, toLocalDayKey } from './dateUtils';

export type MessageDayGroup = {
  date: string;
  label: string;
  messages: MessageSchema[];
};

/**
 * Regroupe une liste de messages triée chronologiquement par jour calendaire
 * local, pour afficher un séparateur de date. Fait côté client car le
 * backend renvoie des timestamps UTC non groupés (voir
 * conversationMessages.schema.ts) — seul le navigateur connaît le fuseau
 * horaire à utiliser pour "aujourd'hui"/"hier".
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
