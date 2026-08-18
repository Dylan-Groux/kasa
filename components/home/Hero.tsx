import Image from 'next/image';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.text}>
        <h1 className={styles.title}>Chez vous, partout et ailleurs</h1>
        <p className={styles.subtitle}>
          Avec Kasa, vivez des séjours uniques dans des hébergements chaleureux, sélectionnés avec
          soin par nos hôtes.
        </p>
      </div>
      <div className={styles.imageWrapper}>
        <Image
          src="/images/properties/hero.jpg"
          alt=""
          fill
          sizes="100vw"
          priority
          className={styles.image}
        />
      </div>
    </section>
  );
}
