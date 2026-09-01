import { ChevronLeftIcon } from '@/components/icons/ChevronLeftIcon';
import { Button } from '@/components/ui/Button';
import type { PropertyDetailSchema } from '@/lib/proxy/schemas/properties/propertyDetail.schema';
import { AmenitySection } from './AmenitySection';
import { HostCard } from './HostCard';
import { PropertyCarousel } from './PropertyCarousel';
import { PropertyInfo } from './PropertyInfo';
import styles from './PropertyDetail.module.css';

type PropertyDetailProps = {
  property: PropertyDetailSchema;
};

export function PropertyDetail({ property }: PropertyDetailProps) {
  return (
    <div className={styles.page}>
      <Button href="/" variant="muted" icon={<ChevronLeftIcon />}>
        Retour aux annonces
      </Button>

      <div className={styles.layout}>
        <div className={styles.main}>
          <PropertyCarousel title={property.title} pictures={property.pictures} />

          <div className={styles.card}>
            <PropertyInfo
              title={property.title}
              location={property.location}
              description={property.description}
            />
            <AmenitySection title="Équipements" items={property.equipments} />
            <AmenitySection title="Catégorie" items={property.tags} />
          </div>
        </div>

        <HostCard host={property.host} rating={Math.round(property.rating_avg)} />
      </div>
    </div>
  );
}
