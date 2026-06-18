import type { SupabaseClient } from '@supabase/supabase-js';
import type { Obra, Contacto } from './types';

export function slugify(s: string): string {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getContacto(client: SupabaseClient): Promise<Contacto | null> {
  const { data } = await client.from('contacto').select('*').eq('id', 1).single();
  return (data as Contacto) ?? null;
}

export async function getObras(
  client: SupabaseClient,
  opts: { categoria?: string; destacadas?: boolean } = {},
): Promise<Obra[]> {
  let q = client.from('obras').select('*, obra_fotos(*)').order('orden', { ascending: true }).order('created_at', { ascending: false });
  if (opts.categoria) q = q.eq('categoria', opts.categoria);
  if (opts.destacadas) q = q.eq('destacada', true);
  const { data } = await q;
  return (data as Obra[]) ?? [];
}

export async function getObraBySlug(client: SupabaseClient, slug: string): Promise<Obra | null> {
  const { data } = await client.from('obras').select('*, obra_fotos(*)').eq('slug', slug).single();
  return (data as Obra) ?? null;
}
