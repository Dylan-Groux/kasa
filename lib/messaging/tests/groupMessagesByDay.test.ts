import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { groupMessagesByDay } from '../groupMessagesByDay';
import type { MessageSchema } from '@/lib/proxy/schemas/messages/messageBase.schema';

const sender = { id: 1, name: 'Dylan', picture: null };
const receiver = { id: 2, name: 'Alex', picture: null };

function message(id: string, createdAt: string): MessageSchema {
  return { id, content: `msg ${id}`, sender, receiver, created_at: createdAt };
}

describe('groupMessagesByDay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-29T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('buckets messages by local calendar day, preserving order within each day', () => {
    const messages = [
      message('1', '2026-08-28T14:32:00'),
      message('2', '2026-08-28T14:35:00'),
      message('3', '2026-08-29T10:15:00'),
    ];

    const groups = groupMessagesByDay(messages);

    expect(groups).toHaveLength(2);
    expect(groups[0].date).toBe('2026-08-28');
    expect(groups[0].messages.map((m) => m.id)).toEqual(['1', '2']);
    expect(groups[1].date).toBe('2026-08-29');
    expect(groups[1].messages.map((m) => m.id)).toEqual(['3']);
  });

  it('labels today and yesterday explicitly rather than a raw date', () => {
    const groups = groupMessagesByDay([
      message('1', '2026-08-28T14:32:00'),
      message('2', '2026-08-29T10:15:00'),
    ]);

    expect(groups[0].label).toBe('Hier');
    expect(groups[1].label).toBe("Aujourd'hui");
  });

  it('formats an older date fully', () => {
    const groups = groupMessagesByDay([message('1', '2026-08-01T09:00:00')]);

    expect(groups[0].label).toBe('1 août 2026');
  });

  it('returns an empty array for no messages', () => {
    expect(groupMessagesByDay([])).toEqual([]);
  });
});
