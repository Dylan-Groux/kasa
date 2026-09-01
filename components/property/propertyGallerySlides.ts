export type GallerySlide = {
  src: string;
  alt: string;
};

export const EMPTY_GALLERY_IMAGE = '/images/properties/gallery-empty.svg';
export const EMPTY_GALLERY_MESSAGE = "Oups, il n'y a pas plus de détails sur ce logement...";

/**
 * @objectif Plafond du nombre de photos d'un logement, réutilisé pour
 * plafonner l'upload côté formulaire (`AddPropertyForm`) et pour découper
 * les vignettes du carrousel desktop (`PropertyCarousel`, grille 2×2 à côté
 * de la photo principale).
 * @note Vaut 1 (photo principale) + 4 (cases de la grille de vignettes),
 * pas 4 seul : la première photo n'a pas de vignette dédiée
 * (`slides.slice(1, ...)` dans `PropertyCarousel`), donc plafonner l'upload
 * à 4 ne remplissait jamais que 3 des 4 cases.
 */
export const MAX_GALLERY_THUMBNAILS = 5;

/**
 * Construit la liste des slides du carrousel d'une propriété.
 * @objectif Convertit les URLs brutes en slides avec un alt descriptif, et
 * garantit qu'il y a toujours au moins une slide à afficher (jamais de
 * carrousel vide) via une image de repli quand `pictures` est vide.
 * @note L'image de repli forme à elle seule un carrousel à une seule slide :
 * les flèches et vignettes restent donc masquées pour ce cas, exactement
 * comme pour un logement qui n'aurait qu'une seule vraie photo.
 */
export function getPropertyGallerySlides(pictures: string[], title: string): GallerySlide[] {
  if (pictures.length === 0) {
    return [{ src: EMPTY_GALLERY_IMAGE, alt: '' }];
  }

  return pictures.map((src, index) => ({
    src,
    alt: index === 0 ? title : `${title} - photo ${index + 1}`,
  }));
}
