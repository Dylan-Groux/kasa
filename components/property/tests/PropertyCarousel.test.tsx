import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PropertyCarousel } from '../PropertyCarousel';
import { EMPTY_GALLERY_MESSAGE, MAX_GALLERY_THUMBNAILS } from '../propertyGallerySlides';

const pictures = ['https://cdn.test/a.jpg', 'https://cdn.test/b.jpg', 'https://cdn.test/c.jpg'];

function getViewport() {
  return screen.getByRole('group', { name: 'Photos de Appartement cosy' });
}

function getTrackTransform() {
  const track = getViewport().firstElementChild as HTMLElement;
  return track.style.transform;
}

describe('PropertyCarousel', () => {
  it('renders a single picture with no navigation controls', () => {
    render(<PropertyCarousel title="Studio" pictures={['https://cdn.test/only.jpg']} />);

    expect(screen.getByAltText('Studio')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Photo précédente' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Photo suivante' })).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('falls back to a single placeholder slide with a message when there are no pictures', () => {
    render(<PropertyCarousel title="Studio sans photo" pictures={[]} />);

    expect(screen.getByText(EMPTY_GALLERY_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Photo suivante' })).not.toBeInTheDocument();
    // Exactly one slide behind the message: the fallback image (decorative,
    // empty alt, so it exposes as role "presentation" rather than "img").
    expect(screen.getAllByRole('presentation')).toHaveLength(1);
  });

  it('shows arrows and a thumbnail for every picture except the first (already the big slide)', () => {
    render(<PropertyCarousel title="Appartement cosy" pictures={pictures} />);

    expect(screen.getByRole('button', { name: 'Photo précédente' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Photo suivante' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Voir la photo 1' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voir la photo 2' })).toHaveAttribute(
      'aria-current',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Voir la photo 3' })).toHaveAttribute(
      'aria-current',
      'false',
    );
  });

  it('never renders more thumbnails than the desktop grid has cells for', () => {
    const manyPictures = Array.from(
      { length: MAX_GALLERY_THUMBNAILS + 3 },
      (_, i) => `https://cdn.test/${i}.jpg`,
    );
    render(<PropertyCarousel title="Grande maison" pictures={manyPictures} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(MAX_GALLERY_THUMBNAILS - 1);
    // Still reachable through the big slide's own navigation, just not as a thumbnail.
    expect(
      screen.queryByRole('button', { name: `Voir la photo ${manyPictures.length}` }),
    ).not.toBeInTheDocument();
  });

  it('advances to the next slide on click and wraps past the last one', () => {
    render(<PropertyCarousel title="Appartement cosy" pictures={pictures} />);
    const next = screen.getByRole('button', { name: 'Photo suivante' });

    expect(getTrackTransform()).toBe('translateX(-0%)');

    fireEvent.click(next);
    expect(getTrackTransform()).toBe('translateX(-100%)');
    expect(screen.getByRole('button', { name: 'Voir la photo 2' })).toHaveAttribute(
      'aria-current',
      'true',
    );

    fireEvent.click(next);
    fireEvent.click(next);
    expect(getTrackTransform()).toBe('translateX(-0%)');
  });

  it('goes back to the previous slide on click and wraps before the first one', () => {
    render(<PropertyCarousel title="Appartement cosy" pictures={pictures} />);

    fireEvent.click(screen.getByRole('button', { name: 'Photo précédente' }));

    expect(getTrackTransform()).toBe('translateX(-200%)');
    expect(screen.getByRole('button', { name: 'Voir la photo 3' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('jumps directly to a slide when its thumbnail is clicked', () => {
    render(<PropertyCarousel title="Appartement cosy" pictures={pictures} />);

    fireEvent.click(screen.getByRole('button', { name: 'Voir la photo 3' }));

    expect(getTrackTransform()).toBe('translateX(-200%)');
  });

  it('navigates with the left/right arrow keys', () => {
    render(<PropertyCarousel title="Appartement cosy" pictures={pictures} />);
    const viewport = getViewport();

    fireEvent.keyDown(viewport, { key: 'ArrowRight' });
    expect(getTrackTransform()).toBe('translateX(-100%)');

    fireEvent.keyDown(viewport, { key: 'ArrowLeft' });
    expect(getTrackTransform()).toBe('translateX(-0%)');
  });

  it('changes slide on a horizontal swipe past the threshold', () => {
    render(<PropertyCarousel title="Appartement cosy" pictures={pictures} />);
    const viewport = getViewport();

    // Drag left (finger moves toward negative X) -> next slide.
    fireEvent.pointerDown(viewport, { clientX: 200 });
    fireEvent.pointerUp(viewport, { clientX: 100 });
    expect(getTrackTransform()).toBe('translateX(-100%)');

    // Drag right (finger moves toward positive X) -> previous slide.
    fireEvent.pointerDown(viewport, { clientX: 100 });
    fireEvent.pointerUp(viewport, { clientX: 200 });
    expect(getTrackTransform()).toBe('translateX(-0%)');
  });

  it('ignores a small drag that stays under the swipe threshold', () => {
    render(<PropertyCarousel title="Appartement cosy" pictures={pictures} />);
    const viewport = getViewport();

    fireEvent.pointerDown(viewport, { clientX: 100 });
    fireEvent.pointerUp(viewport, { clientX: 110 });

    expect(getTrackTransform()).toBe('translateX(-0%)');
  });
});
