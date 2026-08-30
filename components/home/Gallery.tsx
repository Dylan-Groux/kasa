import type { PropertyBaseSchema } from '@/lib/proxy/schemas/properties/propertyBase.schema';
import { PropertyCardGrid } from '@/components/ui/PropertyCardGrid';
import styles from './Gallery.module.css';

type GalleryProps = {
  properties: PropertyBaseSchema[];
};

export function Gallery({ properties }: GalleryProps) {
  return (
    <section id="logements" aria-label="Logements disponibles">
      {properties.length === 0 ? (
        <p className={styles.empty}>Logements indisponibles pour le moment.</p>
      ) : (
        <PropertyCardGrid properties={properties} />
      )}
    </section>
  );
}
