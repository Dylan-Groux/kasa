import type { PropertyBaseSchema } from '@/lib/proxy/schemas/properties/propertyBase.schema';
import { PropertyCardGrid } from '@/components/ui/PropertyCardGrid';
import styles from './Gallery.module.css';

type GalleryProps = {
  properties: PropertyBaseSchema[];
};

export function Gallery({ properties }: GalleryProps) {
  if (properties.length === 0) {
    return (
      <section aria-label="Logements disponibles">
        <p className={styles.empty}>Logements indisponibles pour le moment.</p>
      </section>
    );
  }

  return (
    <section id="logements" aria-label="Logements disponibles">
      <PropertyCardGrid properties={properties} />
    </section>
  );
}
