import { describe, expect, it } from 'vitest';
import { userUpdateBodySchema } from '../userUpdate.schema';

describe('userUpdateBodySchema', () => {
  it('accepte un body avec un seul champ renseigné', () => {
    const result = userUpdateBodySchema.safeParse({ name: 'Bob' });

    expect(result.success).toBe(true);
  });

  it('refuse un body vide', () => {
    const result = userUpdateBodySchema.safeParse({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Au moins un champ est requis pour la mise à jour',
      );
    }
  });

  it('accepte { picture: null } comme un champ renseigné', () => {
    const result = userUpdateBodySchema.safeParse({ picture: null });

    expect(result.success).toBe(true);
  });

  it('refuse un champ inconnu (additionalProperties: false côté backend)', () => {
    const result = userUpdateBodySchema.safeParse({ name: 'Bob', unknownField: 'x' });

    expect(result.success).toBe(false);
  });
});
