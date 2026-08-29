import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MessageBubble } from '../MessageBubble';
import type { MessageSchema } from '@/lib/proxy/schemas/messages/messageBase.schema';

const sender = { id: 1, name: 'Alex', picture: null };
const receiver = { id: 2, name: 'Dylan', picture: null };

const message: MessageSchema = {
  id: 'msg_1',
  content: 'Bonjour !',
  sender,
  receiver,
  created_at: '2026-08-29T14:32:00',
};

describe('MessageBubble', () => {
  it("shows the sender's name, avatar initial and content for a message from someone else", () => {
    render(<MessageBubble message={message} isOwnMessage={false} />);

    expect(screen.getByText('Bonjour !')).toBeInTheDocument();
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it("still shows the author's name for the current user's own message (matches the reference design)", () => {
    render(<MessageBubble message={message} isOwnMessage />);

    expect(screen.getByText('Bonjour !')).toBeInTheDocument();
    expect(screen.getByText('Alex')).toBeInTheDocument();
  });

  it('renders a formatted, machine-readable send time above the bubble', () => {
    const { container } = render(<MessageBubble message={message} isOwnMessage={false} />);

    const time = container.querySelector('time');
    expect(time).toHaveAttribute('dateTime', message.created_at);
    expect(time?.textContent).toMatch(/^\d{2}:\d{2}$/);
  });
});
