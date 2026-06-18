import { describe, it, expect } from 'vitest';
import { slugify } from '../queries';

describe('slugify', () => {
  it('lowercases and hyphenates', () => { expect(slugify('Edificio Central')).toBe('edificio-central'); });
  it('strips accents', () => { expect(slugify('Construcción Ñuñoa')).toBe('construccion-nunoa'); });
  it('removes punctuation and collapses dashes', () => { expect(slugify('Obra #1: Norte!!')).toBe('obra-1-norte'); });
});
