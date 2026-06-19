import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { createAnonServerClient, createAdminClient } from '../lib/supabase';
import { slugify } from '../lib/queries';

export const server = {
  login: defineAction({
    accept: 'form',
    input: z.object({ email: z.string().email(), password: z.string().min(1) }),
    handler: async ({ email, password }, ctx) => {
      const supabase = createAnonServerClient(ctx.cookies, ctx.request.headers);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new ActionError({ code: 'UNAUTHORIZED', message: 'Credenciales inválidas.' });
      return { ok: true };
    },
  }),
  logout: defineAction({
    accept: 'form',
    handler: async (_input, ctx) => {
      const supabase = createAnonServerClient(ctx.cookies, ctx.request.headers);
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

      // Attempt insert or update, retrying with a suffixed slug on unique-constraint collisions.
      const baseSlug = base.slug;
      let lastError: { code: string; message: string } | null = null;
      let written = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        const slug = attempt === 0 ? baseSlug : `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
        const row = { ...base, slug };
        if (obraId) {
          const { error } = await admin.from('obras').update(row).eq('id', obraId);
          if (!error) { written = true; break; }
          if (error.code !== '23505') throw new ActionError({ code: 'BAD_REQUEST', message: error.message });
          lastError = error;
        } else {
          const { data, error } = await admin.from('obras').insert(row).select('id').single();
          if (!error) { obraId = data!.id as string; written = true; break; }
          if (error.code !== '23505') throw new ActionError({ code: 'BAD_REQUEST', message: error.message });
          lastError = error;
        }
      }
      if (!written) throw new ActionError({ code: 'BAD_REQUEST', message: lastError?.message ?? 'Slug duplicado.' });

      const upload = async (file: File): Promise<string> => {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const key = `${obraId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await admin.storage.from('obras').upload(key, file, { contentType: file.type, upsert: false });
        if (error) throw new ActionError({ code: 'BAD_REQUEST', message: error.message });
        return admin.storage.from('obras').getPublicUrl(key).data.publicUrl;
      };

      if (input.portada && input.portada.size > 0) {
        const url = await upload(input.portada);
        const { error: portadaError } = await admin.from('obras').update({ portada_url: url }).eq('id', obraId);
        if (portadaError) throw new ActionError({ code: 'BAD_REQUEST', message: portadaError.message });
      }
      const fotos = (input.fotos ?? []).filter((f) => f && f.size > 0);
      for (const f of fotos) {
        const url = await upload(f);
        const { error: fotoError } = await admin.from('obra_fotos').insert({ obra_id: obraId, url });
        if (fotoError) throw new ActionError({ code: 'BAD_REQUEST', message: fotoError.message });
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

  deleteObra: defineAction({
    accept: 'form',
    input: z.object({ id: z.string().uuid() }),
    handler: async ({ id }, ctx) => {
      if (!ctx.locals.user) throw new ActionError({ code: 'UNAUTHORIZED', message: 'No autorizado.' });
      const admin = createAdminClient();
      const { data: files } = await admin.storage.from('obras').list(id);
      if (files && files.length) {
        await admin.storage.from('obras').remove(files.map((f) => `${id}/${f.name}`));
      }
      const { error } = await admin.from('obras').delete().eq('id', id);
      if (error) throw new ActionError({ code: 'BAD_REQUEST', message: error.message });
      return { ok: true };
    },
  }),

  saveContacto: defineAction({
    accept: 'form',
    input: z.object({
      razon_social: z.string().min(1),
      direccion: z.string().optional(),
      telefono: z.string().optional(),
      email: z.string().optional(),
      horario: z.string().optional(),
      linkedin: z.string().optional(),
      instagram: z.string().optional(),
      mapa_embed: z.string().optional(),
    }),
    handler: async (input, ctx) => {
      if (!ctx.locals.user) throw new ActionError({ code: 'UNAUTHORIZED', message: 'No autorizado.' });
      const admin = createAdminClient();
      const redes: Record<string, string> = {};
      if (input.linkedin) redes.linkedin = input.linkedin;
      if (input.instagram) redes.instagram = input.instagram;
      const { error } = await admin.from('contacto').upsert({
        id: 1,
        razon_social: input.razon_social,
        direccion: input.direccion ?? null,
        telefono: input.telefono ?? null,
        email: input.email ?? null,
        horario: input.horario ?? null,
        mapa_embed: input.mapa_embed ?? null,
        redes: Object.keys(redes).length ? redes : null,
      });
      if (error) throw new ActionError({ code: 'BAD_REQUEST', message: error.message });
      return { ok: true };
    },
  }),
};
