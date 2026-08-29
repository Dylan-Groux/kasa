import { isSameLocalDay } from './dateUtils';

/** Time-only timestamp shown inside a message bubble, e.g. "14:32". */
export function formatMessageTime(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(isoDate),
  );
}

/** Compact timestamp for a conversation list preview: time if today, short date otherwise. */
export function formatConversationPreviewTimestamp(isoDate: string): string {
  const date = new Date(isoDate);

  if (isSameLocalDay(date, new Date())) {
    return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);
  }

  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date);
}
