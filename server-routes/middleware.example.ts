import { routing } from "@/i18n/routing";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.next();
    }

    let response = NextResponse.next({ request });

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    await supabase.auth.getUser();

    if (pathname.startsWith("/admin")) {
      const isLogin = pathname === "/admin/login";
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user && !isLogin) {
        const redirect = new URL("/admin/login", request.url);
        redirect.searchParams.set("next", pathname);
        return NextResponse.redirect(redirect);
      }

      if (user && isLogin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
