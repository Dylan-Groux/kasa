import Image from 'next/image';
import { StarIcon } from '@/components/icons/StarIcon';
import { Button } from '@/components/ui/Button';
import type { PropertyDetailSchema } from '@/lib/proxy/schemas/properties/propertyDetail.schema';
import styles from './HostCard.module.css';

type HostCardProps = {
  host: PropertyDetailSchema['host'];
  rating: number;
};

export function HostCard({ host, rating }: HostCardProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Votre hôte</h2>
      <div className={styles.profile}>
        <div className={styles.avatar}>
          {host.picture ? (
            <Image src={host.picture} alt={host.name} fill sizes="82px" />
          ) : (
            <span className={styles.avatarFallback} aria-hidden="true">
              {host.name.charAt(0)}
            </span>
          )}
        </div>
        <span className={styles.name}>{host.name}</span>
        <span className={styles.rating} aria-label={`Note : ${rating} sur 5`}>
          <StarIcon className={styles.star} />
          {rating}
        </span>
      </div>
      <Button variant="brand" className={styles.actionButton}>
        Contacter l&apos;hôte
      </Button>
      <Button variant="brand" className={styles.actionButton}>
        Envoyer un message
      </Button>
    </div>
  );
}
