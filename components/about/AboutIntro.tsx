import Image from 'next/image';
import styles from './AboutIntro.module.css';

export function AboutIntro() {
  return (
    <section className={styles.intro}>
      <div className={styles.text}>
        <h1 className={styles.title}>À propos</h1>
        <p className={styles.paragraph}>
          Chez Kasa, nous croyons que chaque voyage mérite un lieu unique où se sentir bien.
        </p>
        <p className={styles.paragraph}>
          Depuis notre création, nous mettons en relation des voyageurs en quête d&apos;authenticité
          avec des hôtes passionnés qui aiment partager leur région et leurs bonnes adresses.
        </p>
      </div>
      <div className={styles.imageWrapper}>
        <Image src="/images/about/about-hero.jpg" alt="" fill sizes="100vw" priority />
      </div>
    </section>
  );
}
