import { isSameLocalDay } from './dateUtils';

export function formatMessageTime(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(isoDate),
  );
}

export function formatConversationPreviewTimestamp(isoDate: string): string {
  const date = new Date(isoDate);

  if (isSameLocalDay(date, new Date())) {
    return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);
  }

  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date);
}
