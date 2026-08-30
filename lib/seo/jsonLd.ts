/**
 * Sérialise `data` en JSON-LD prêt pour `dangerouslySetInnerHTML`.
 * @objectif Échappe "</" pour qu'un titre/description contenant "</script>"
 * (les annonces viennent d'utilisateurs) ne puisse pas sortir de la balise
 * JSON-LD et injecter du markup.
 */
export function jsonLdScriptProps(data: unknown): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}
