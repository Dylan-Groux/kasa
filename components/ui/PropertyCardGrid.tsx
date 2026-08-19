import type { PropertyBaseSchema } from '@/lib/proxy/schemas/properties/propertyBase.schema';
import { PropertyCard } from './PropertyCard';
import styles from './PropertyCardGrid.module.css';

type PropertyCardGridProps = {
  properties: PropertyBaseSchema[];
  initialFavorite?: boolean;
};

export function PropertyCardGrid({ properties, initialFavorite = false }: PropertyCardGridProps) {
  return (
    <ul className={styles.grid}>
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} initialFavorite={initialFavorite} />
      ))}
    </ul>
  );
}
