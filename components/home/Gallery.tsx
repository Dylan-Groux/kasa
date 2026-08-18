import type { PropertyBaseSchema } from '@/lib/proxy/schemas/properties/propertyBase.schema';
import { PropertyCardGrid } from '@/components/ui/PropertyCardGrid';

type GalleryProps = {
  properties: PropertyBaseSchema[];
};

export function Gallery({ properties }: GalleryProps) {
  return (
    <section id="logements" aria-label="Logements disponibles">
      <PropertyCardGrid properties={properties} />
    </section>
  );
}
