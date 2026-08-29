import styles from './ConversationEmptyState.module.css';

export function ConversationEmptyState() {
  return (
    <div className={styles.empty}>
      <p>Sélectionnez une conversation pour afficher les messages.</p>
    </div>
  );
}
