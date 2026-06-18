import { describe, it, expect } from 'vitest';
import { CATEGORIAS, ESTADOS, categoriaLabel } from '../types';

describe('types', () => {
  it('exposes 4 categories', () => { expect(CATEGORIAS).toHaveLength(4); });
  it('exposes 2 estados', () => { expect(ESTADOS).toHaveLength(2); });
  it('maps a categoria value to its label', () => {
    expect(categoriaLabel('peritaje')).toBe('Peritaje');
  });
  it('returns the raw value for unknown categoria', () => {
    expect(categoriaLabel('zzz')).toBe('zzz');
  });
});
