import { describe, expect, it } from 'vitest';
import { propertyUpdateBodySchema } from '../propertyUpdate.schema';

describe('propertyUpdateBodySchema', () => {
  it('accepte un body avec un seul champ renseigné', () => {
    const result = propertyUpdateBodySchema.safeParse({ title: 'Nouveau titre' });

    expect(result.success).toBe(true);
  });

  it('refuse un body vide', () => {
    const result = propertyUpdateBodySchema.safeParse({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Au moins un champ est requis pour la mise à jour',
      );
    }
  });

  it('refuse un champ inconnu (additionalProperties: false côté backend)', () => {
    const result = propertyUpdateBodySchema.safeParse({
      title: 'Villa',
      unknownField: 'x',
    });

    expect(result.success).toBe(false);
  });
});
