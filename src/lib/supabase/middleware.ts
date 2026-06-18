import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { UserRole } from '@/types';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Define route classifications
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAdminRoute = pathname.startsWith('/admin');
  const isFreelancerRoute = pathname.startsWith('/freelancer');
  const isClientRoute = pathname.startsWith('/client');

  if (user) {
    // User is logged in, fetch their role
    // First, try reading from user_metadata to avoid DB query if possible
    let role: UserRole = user.user_metadata?.role as UserRole;

    if (!role) {
      // Fallback: Query the public.users table
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!error && dbUser) {
        role = dbUser.role as UserRole;
      } else {
        role = 'client'; // default fallback
      }
    }

    // Redirect logged-in users away from auth routes (login/register) to their respective dashboards
    if (isAuthRoute) {
      if (role === 'admin') {
        url.pathname = '/admin/dashboard';
      } else if (role === 'freelancer') {
        url.pathname = '/freelancer/dashboard';
      } else {
        url.pathname = '/client/dashboard';
      }
      return NextResponse.redirect(url);
    }

    // Enforce role-based access for protected dashboards
    if (isAdminRoute && role !== 'admin') {
      // Redirect to correct dashboard based on role
      url.pathname = role === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard';
      return NextResponse.redirect(url);
    }

    if (isFreelancerRoute && role !== 'freelancer') {
      url.pathname = role === 'admin' ? '/admin/dashboard' : '/client/dashboard';
      return NextResponse.redirect(url);
    }

    if (isClientRoute && role !== 'client') {
      url.pathname = role === 'admin' ? '/admin/dashboard' : '/freelancer/dashboard';
      return NextResponse.redirect(url);
    }
  } else {
    // User is not logged in
    // Redirect unauthenticated users trying to access protected dashboards to login
    if (isAdminRoute || isFreelancerRoute || isClientRoute) {
      url.pathname = '/login';
      // Optionally preserve redirect path
      url.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
