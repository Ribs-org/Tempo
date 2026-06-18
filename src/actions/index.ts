import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { createAnonServerClient, createAdminClient } from '../lib/supabase';
import { slugify } from '../lib/queries';

export const server = {
  login: defineAction({
    accept: 'form',
    input: z.object({ email: z.string().email(), password: z.string().min(1) }),
    handler: async ({ email, password }, ctx) => {
      const supabase = createAnonServerClient(ctx.cookies);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new ActionError({ code: 'UNAUTHORIZED', message: 'Credenciales inválidas.' });
      return { ok: true };
    },
  }),
  logout: defineAction({
    accept: 'form',
    handler: async (_input, ctx) => {
      const supabase = createAnonServerClient(ctx.cookies);
      await supabase.auth.signOut();
      return { ok: true };
    },
  }),

  saveObra: defineAction({
    accept: 'form',
    input: z.object({
      id: z.string().uuid().optional(),
      titulo: z.string().min(1),
      categoria: z.enum(['obra_construida', 'proyecto', 'peritaje', 'licitacion']),
      descripcion: z.string().optional(),
      ubicacion: z.string().optional(),
      anio: z.coerce.number().int().optional(),
      cliente: z.string().optional(),
      estado: z.enum(['en_curso', 'finalizada']).optional(),
      destacada: z.coerce.boolean().optional(),
      orden: z.coerce.number().int().optional(),
      portada: z.instanceof(File).optional(),
      fotos: z.array(z.instanceof(File)).optional(),
    }),
    handler: async (input, ctx) => {
      if (!ctx.locals.user) throw new ActionError({ code: 'UNAUTHORIZED', message: 'No autorizado.' });
      const admin = createAdminClient();
      const base = {
        titulo: input.titulo,
        slug: slugify(input.titulo),
        categoria: input.categoria,
        descripcion: input.descripcion ?? null,
        ubicacion: input.ubicacion ?? null,
        anio: input.anio ?? null,
        cliente: input.cliente ?? null,
        estado: input.estado ?? null,
        destacada: input.destacada ?? false,
        orden: input.orden ?? 0,
      };

      let obraId = input.id;
      if (obraId) {
        const { error } = await admin.from('obras').update(base).eq('id', obraId);
        if (error) throw new ActionError({ code: 'BAD_REQUEST', message: error.message });
      } else {
        const { data, error } = await admin.from('obras').insert(base).select('id').single();
        if (error) throw new ActionError({ code: 'BAD_REQUEST', message: error.message });
        obraId = data!.id as string;
      }

      const upload = async (file: File): Promise<string> => {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const key = `${obraId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await admin.storage.from('obras').upload(key, file, { contentType: file.type, upsert: false });
        if (error) throw new ActionError({ code: 'BAD_REQUEST', message: error.message });
        return admin.storage.from('obras').getPublicUrl(key).data.publicUrl;
      };

      if (input.portada && input.portada.size > 0) {
        const url = await upload(input.portada);
        await admin.from('obras').update({ portada_url: url }).eq('id', obraId);
      }
      const fotos = (input.fotos ?? []).filter((f) => f && f.size > 0);
      for (const f of fotos) {
        const url = await upload(f);
        await admin.from('obra_fotos').insert({ obra_id: obraId, url });
      }
      return { id: obraId };
    },
  }),

  deleteFoto: defineAction({
    accept: 'form',
    input: z.object({ fotoId: z.string().uuid(), url: z.string() }),
    handler: async ({ fotoId, url }, ctx) => {
      if (!ctx.locals.user) throw new ActionError({ code: 'UNAUTHORIZED', message: 'No autorizado.' });
      const admin = createAdminClient();
      const path = url.split('/object/public/obras/')[1];
      if (path) await admin.storage.from('obras').remove([path]);
      await admin.from('obra_fotos').delete().eq('id', fotoId);
      return { ok: true };
    },
  }),
};
