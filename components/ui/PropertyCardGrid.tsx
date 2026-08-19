import type { PropertyBaseSchema } from '@/lib/proxy/schemas/properties/propertyBase.schema';
import { PropertyCard } from './PropertyCard';
import styles from './PropertyCardGrid.module.css';

type PropertyCardGridProps = {
  properties: PropertyBaseSchema[];
};

export function PropertyCardGrid({ properties }: PropertyCardGridProps) {
  return (
    <ul className={styles.grid}>
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </ul>
  );
}
