import Image from 'next/image';
import Link from 'next/link';
import type { PropertyBaseSchema } from '@/lib/proxy/schemas/properties/propertyBase.schema';
import { FavoriteButton } from './FavoriteButton';
import styles from './PropertyCard.module.css';

type PropertyCardProps = {
  property: PropertyBaseSchema;
  initialFavorite?: boolean;
};

export function PropertyCard({ property, initialFavorite = false }: PropertyCardProps) {
  return (
    <li className={styles.card}>
      <Link href={`/logement/${property.slug}`} className={styles.link}>
        <div className={styles.imageWrapper}>
          {property.cover ? (
            <Image
              src={property.cover}
              alt={property.title}
              fill
              sizes="(max-width: 768px) 100vw, 355px"
              className={styles.image}
            />
          ) : null}
        </div>
        <div className={styles.details}>
          <div className={styles.text}>
            <p className={styles.title}>{property.title}</p>
            {property.location ? <p className={styles.subtitle}>{property.location}</p> : null}
          </div>
          <p className={styles.price}>
            {property.price_per_night}
            <span className={styles.currency}>&euro;</span>
            <span className={styles.priceUnit}>par nuit</span>
          </p>
        </div>
      </Link>
      <div className={styles.favorite}>
        <FavoriteButton propertyTitle={property.title} initialFavorite={initialFavorite} />
      </div>
    </li>
  );
}
