export type GallerySlide = {
  src: string;
  alt: string;
};

export const EMPTY_GALLERY_IMAGE = '/images/properties/gallery-empty.svg';
export const EMPTY_GALLERY_MESSAGE = "Oups, il n'y a pas plus de détails sur ce logement...";

/**
 * @objectif Nombre de vignettes affichées à côté de la photo principale sur
 * desktop (grille 4 colonnes × 2 lignes : la première photo occupe un bloc
 * de 2×2, les 4 autres cases accueillent chacune une vignette). Réutilisée
 * pour plafonner l'upload côté formulaire (`AddPropertyForm`), afin que la
 * grille ne puisse jamais recevoir plus de vignettes que de cases.
 */
export const MAX_GALLERY_THUMBNAILS = 4;

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
