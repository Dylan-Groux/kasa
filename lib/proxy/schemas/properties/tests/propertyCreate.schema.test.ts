import { describe, expect, it } from 'vitest';
import { propertyCreateBodySchema } from '../propertyCreate.schema';

describe('propertyCreateBodySchema', () => {
  it('accepte un body avec seulement host_id', () => {
    const result = propertyCreateBodySchema.safeParse({
      title: 'Villa',
      host_id: 1,
    });

    expect(result.success).toBe(true);
  });

  it('accepte un body avec seulement host', () => {
    const result = propertyCreateBodySchema.safeParse({
      title: 'Villa',
      host: { name: 'Alice' },
    });

    expect(result.success).toBe(true);
  });

  it('accepte un body avec host_id ET host tous les deux', () => {
    const result = propertyCreateBodySchema.safeParse({
      title: 'Villa',
      host_id: 1,
      host: { name: 'Alice' },
    });

    expect(result.success).toBe(true);
  });

  it('refuse un body sans host_id ni host', () => {
    const result = propertyCreateBodySchema.safeParse({ title: 'Villa' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['host_id']);
      expect(result.error.issues[0].message).toBe('host_id ou host est obligatoire');
    }
  });
});
