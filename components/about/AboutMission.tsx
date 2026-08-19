import Image from 'next/image';
import styles from './AboutMission.module.css';

const MISSION_POINTS = [
  "Offrir une plateforme fiable et simple d'utilisation",
  'Proposer des hébergements variés et de qualité',
  'Favoriser des échanges humains et chaleureux entre hôtes et voyageurs',
];

export function AboutMission() {
  return (
    <section className={styles.mission}>
      <div className={styles.text}>
        <h2 className={styles.title}>Notre mission est simple :</h2>
        <ul className={styles.points}>
          {MISSION_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <p className={styles.closing}>
          Que vous cherchiez un appartement cosy en centre-ville, une maison en bord de mer ou un
          chalet à la montagne, Kasa vous accompagne pour que chaque séjour devienne un souvenir
          inoubliable.
        </p>
      </div>
      <div className={styles.imageWrapper}>
        <Image
          src="/images/about/about-mission.jpg"
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 494px"
        />
      </div>
    </section>
  );
}
