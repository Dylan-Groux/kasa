import Image from 'next/image';
import styles from './PropertyGallery.module.css';

type PropertyGalleryProps = {
  title: string;
  pictures: string[];
};

export function PropertyGallery({ title, pictures }: PropertyGalleryProps) {
  const [main, ...thumbnails] = pictures;

  return (
    <div className={styles.gallery}>
      {main ? (
        <div className={styles.mainImage}>
          <Image src={main} alt={title} fill sizes="(max-width: 1024px) 100vw, 616px" priority />
        </div>
      ) : null}
      {thumbnails.length > 0 ? (
        <ul className={styles.thumbnails}>
          {thumbnails.map((picture, index) => (
            <li key={picture} className={styles.thumbnail}>
              <Image
                src={picture}
                alt={`${title} - photo ${index + 2}`}
                fill
                sizes="(max-width: 1024px) 25vw, 150px"
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
