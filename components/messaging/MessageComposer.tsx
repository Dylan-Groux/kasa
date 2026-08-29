'use client';

import { useState } from 'react';
import { ArrowUpIcon } from '@/components/icons/ArrowUpIcon';
import styles from './MessageComposer.module.css';

type MessageComposerProps = {
  onSend: (content: string) => Promise<void>;
};

// Local input state only — the parent owns the actual send request and its error handling.
export function MessageComposer({ onSend }: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);
    try {
      await onSend(trimmed);
      setContent('');
    } catch {
      setError("Le message n'a pas pu être envoyé.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <div className={styles.box}>
        <label htmlFor="message-input" className={styles.visuallyHidden}>
          Votre message
        </label>
        <input
          id="message-input"
          className={styles.input}
          type="text"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Envoyer un message"
          maxLength={2000}
          disabled={isSending}
          autoComplete="off"
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={isSending || content.trim().length === 0}
          aria-label="Envoyer le message"
        >
          <ArrowUpIcon />
        </button>
      </div>
    </form>
  );
}
