import { AboutIntro } from './AboutIntro';
import { AboutMission } from './AboutMission';
import styles from './AboutContent.module.css';

export function AboutContent() {
  return (
    <div className={styles.content}>
      <AboutIntro />
      <AboutMission />
    </div>
  );
}
