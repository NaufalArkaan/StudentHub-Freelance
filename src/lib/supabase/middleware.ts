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
    // Query public.users to fetch role and status
    const { data: dbUser, error: dbUserError } = await supabase
      .from('users')
      .select('role, status')
      .eq('id', user.id)
      .single();

    let role: UserRole = 'client';
    let status = 'active';

    if (!dbUserError && dbUser) {
      role = dbUser.role as UserRole;
      status = dbUser.status || 'active';
    } else {
      // Fallback: Try reading from user_metadata if database query fails
      role = (user.user_metadata?.role as UserRole) || 'client';
    }

    // If account is suspended, log the user out and block access
    if (status === 'suspended') {
      await supabase.auth.signOut();

      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { error: 'Account is suspended' },
          { status: 403 }
        );
      }

      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('error', 'suspended');
      return NextResponse.redirect(loginUrl);
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
