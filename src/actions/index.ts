import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { createAnonServerClient } from '../lib/supabase';

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
};
