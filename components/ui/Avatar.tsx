import Image from 'next/image';
import styles from './Avatar.module.css';

type AvatarProps = {
  name: string;
  picture?: string | null;
  size?: number;
  className?: string;
};

// Same avatar-with-initial-fallback pattern HostCard used inline, extracted so messaging can reuse it at different sizes.
export function Avatar({ name, picture, size = 40, className }: AvatarProps) {
  const classes = [styles.avatar, className].filter(Boolean).join(' ');

  return (
    <div className={classes} style={{ width: size, height: size }}>
      {picture ? (
        <Image src={picture} alt={name} fill sizes={`${size}px`} />
      ) : (
        <span className={styles.fallback} aria-hidden="true" style={{ fontSize: size * 0.4 }}>
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
