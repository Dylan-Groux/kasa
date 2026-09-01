'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon } from '@/components/icons/ChevronLeftIcon';
import { resolveSwipeDirection } from '@/lib/carousel/carouselMath';
import { useCarousel } from '@/lib/carousel/useCarousel';
import {
  EMPTY_GALLERY_MESSAGE,
  MAX_GALLERY_THUMBNAILS,
  getPropertyGallerySlides,
} from './propertyGallerySlides';
import styles from './PropertyCarousel.module.css';

type PropertyCarouselProps = {
  title: string;
  pictures: string[];
};

/**
 * Carrousel des photos d'une propriété.
 * @objectif Slide (flèches, vignettes cliquables, clavier, glisser tactile)
 * construite sur `useCarousel` + `getPropertyGallerySlides`, sans lib
 * externe. Un logement sans photo affiche toujours une slide de repli avec
 * un message, plutôt qu'un carrousel vide.
 * @note Flèches et vignettes ne s'affichent que si `slides.length > 1` — un
 * logement à une seule photo (ou sans photo, donc une seule slide de repli)
 * n'a pas de navigation à proposer.
 */
export function PropertyCarousel({ title, pictures }: PropertyCarouselProps) {
  const slides = getPropertyGallerySlides(pictures, title);
  const { activeIndex, goNext, goPrev, goTo } = useCarousel(slides.length);
  const hasNavigation = slides.length > 1;
  const pointerStartX = useRef<number | null>(null);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!hasNavigation) {
      return;
    }
    pointerStartX.current = event.clientX;
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (pointerStartX.current === null) {
      return;
    }
    const deltaX = event.clientX - pointerStartX.current;
    pointerStartX.current = null;

    const direction = resolveSwipeDirection(deltaX);
    if (direction === 'prev') {
      goPrev();
    } else if (direction === 'next') {
      goNext();
    }
  }

  function handlePointerCancel() {
    pointerStartX.current = null;
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!hasNavigation) {
      return;
    }
    if (event.key === 'ArrowLeft') {
      goPrev();
    } else if (event.key === 'ArrowRight') {
      goNext();
    }
  }

  return (
    <div className={styles.gallery}>
      <div
        className={styles.viewport}
        role="group"
        aria-roledescription="carrousel"
        aria-label={`Photos de ${title}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div className={styles.track} style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
          {slides.map((slide, index) => (
            <div
              key={`${slide.src}-${index}`}
              className={styles.slide}
              aria-hidden={index !== activeIndex}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 616px"
                priority={index === 0}
                loading={index === 0 ? undefined : 'eager'}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {pictures.length === 0 ? (
          <p className={styles.emptyMessage}>{EMPTY_GALLERY_MESSAGE}</p>
        ) : null}

        {hasNavigation ? (
          <>
            <button
              type="button"
              className={styles.prevButton}
              onClick={goPrev}
              aria-label="Photo précédente"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className={styles.nextButton}
              onClick={goNext}
              aria-label="Photo suivante"
            >
              <ChevronLeftIcon />
            </button>
          </>
        ) : null}
      </div>

      {hasNavigation ? (
        <ul className={styles.thumbnails}>
          {/* Jamais la première photo (déjà affichée en grand), jamais plus
              que MAX_GALLERY_THUMBNAILS au total (donc MAX_GALLERY_THUMBNAILS
              - 1 vignettes) même si une propriété plus ancienne a plus de
              photos que le formulaire n'en autorise aujourd'hui. */}
          {slides.slice(1, MAX_GALLERY_THUMBNAILS).map((slide, offset) => {
            const index = offset + 1;
            const isActive = index === activeIndex;
            return (
              <li key={`${slide.src}-${index}`} className={styles.thumbnailItem}>
                <button
                  type="button"
                  className={
                    isActive ? `${styles.thumbnail} ${styles.thumbnailActive}` : styles.thumbnail
                  }
                  onClick={() => goTo(index)}
                  aria-label={`Voir la photo ${index + 1}`}
                  aria-current={isActive}
                >
                  <Image src={slide.src} alt="" fill sizes="(max-width: 1024px) 25vw, 150px" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
