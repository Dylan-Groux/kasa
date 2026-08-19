import { LocationPinIcon } from '@/components/icons/LocationPinIcon';
import styles from './PropertyInfo.module.css';

type PropertyInfoProps = {
  title: string;
  location: string | null | undefined;
  description: string | null | undefined;
};

export function PropertyInfo({ title, location, description }: PropertyInfoProps) {
  return (
    <div className={styles.info}>
      <div className={styles.heading}>
        <h1 className={styles.title}>{title}</h1>
        {location ? (
          <p className={styles.location}>
            <LocationPinIcon className={styles.pin} />
            {location}
          </p>
        ) : null}
      </div>
      {description ? <p className={styles.description}>{description}</p> : null}
    </div>
  );
}
