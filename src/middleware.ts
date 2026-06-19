import { defineMiddleware } from 'astro:middleware';
import { createAnonServerClient } from './lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createAnonServerClient(context.cookies, context.request.headers);
  const { data: { user } } = await supabase.auth.getUser();
  context.locals.supabase = supabase;
  context.locals.user = user;

  const { pathname } = context.url;
  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname === '/admin/login';
  if (isAdmin && !isLogin && !user) {
    return context.redirect('/admin/login');
  }
  if (isLogin && user) {
    return context.redirect('/admin');
  }
  return next();
});
