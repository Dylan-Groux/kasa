// Escapes "</" so a title/description containing "</script>" (property data
// comes from user-submitted listings) can't break out of the JSON-LD script
// tag and inject markup.
export function jsonLdScriptProps(data: unknown): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}
