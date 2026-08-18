import { Tag } from '@/components/ui/Tag';
import styles from './AmenitySection.module.css';

type AmenitySectionProps = {
  title: string;
  items: string[];
};

export function AmenitySection({ title, items }: AmenitySectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <Tag key={item}>{item}</Tag>
        ))}
      </ul>
    </div>
  );
}
