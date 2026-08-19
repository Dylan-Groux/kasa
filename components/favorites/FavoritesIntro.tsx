import styles from './FavoritesIntro.module.css';

export function FavoritesIntro() {
  return (
    <div className={styles.intro}>
      <h1 className={styles.title}>Vos favoris</h1>
      <p className={styles.subtitle}>
        Retrouvez ici tous les logements que vous avez aimés. Prêts à réserver ? Un simple clic et
        votre prochain séjour est en route.
      </p>
    </div>
  );
}
