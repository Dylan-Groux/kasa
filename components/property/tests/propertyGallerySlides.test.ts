import { describe, expect, it } from 'vitest';
import { EMPTY_GALLERY_IMAGE, getPropertyGallerySlides } from '../propertyGallerySlides';

describe('getPropertyGallerySlides', () => {
  it('maps each picture to a slide, using the title alone for the first one', () => {
    const slides = getPropertyGallerySlides(
      ['https://cdn.test/a.jpg', 'https://cdn.test/b.jpg'],
      'Appartement cosy',
    );

    expect(slides).toEqual([
      { src: 'https://cdn.test/a.jpg', alt: 'Appartement cosy' },
      { src: 'https://cdn.test/b.jpg', alt: 'Appartement cosy - photo 2' },
    ]);
  });

  it('returns a single fallback slide when there are no pictures', () => {
    const slides = getPropertyGallerySlides([], 'Studio sans photo');

    expect(slides).toHaveLength(1);
    expect(slides[0].src).toBe(EMPTY_GALLERY_IMAGE);
  });

  it('returns exactly one slide for a single picture, same as the empty case', () => {
    const slides = getPropertyGallerySlides(['https://cdn.test/only.jpg'], 'Studio');

    expect(slides).toHaveLength(1);
  });
});
