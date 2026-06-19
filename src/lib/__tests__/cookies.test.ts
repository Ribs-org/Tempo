import { describe, it, expect } from 'vitest';
import { buildCookieAdapter } from '../supabase';

describe('buildCookieAdapter', () => {
  it('getAll parses cookies from the request Cookie header (AstroCookies has no getAll)', () => {
    // Real Astro 5 AstroCookies exposes get/set/has/delete/merge — NOT getAll.
    const astroCookies = {
      get: () => undefined,
      set: () => {},
      has: () => false,
      delete: () => {},
      merge: () => {},
    } as any;
    const headers = new Headers({ cookie: 'sb-access=abc; sb-refresh=def' });

    const adapter = buildCookieAdapter(astroCookies, headers);

    expect(adapter.getAll()).toEqual([
      { name: 'sb-access', value: 'abc' },
      { name: 'sb-refresh', value: 'def' },
    ]);
  });

  it('getAll returns [] when there is no Cookie header', () => {
    const adapter = buildCookieAdapter({} as any, new Headers());
    expect(adapter.getAll()).toEqual([]);
  });

  it('setAll writes each cookie through AstroCookies.set', () => {
    const calls: Array<[string, string, unknown]> = [];
    const astroCookies = { set: (n: string, v: string, o: unknown) => calls.push([n, v, o]) } as any;

    const adapter = buildCookieAdapter(astroCookies, new Headers());
    adapter.setAll([{ name: 'x', value: 'y', options: { path: '/' } }]);

    expect(calls).toEqual([['x', 'y', { path: '/' }]]);
  });
});
