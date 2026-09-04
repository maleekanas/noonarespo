import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveUserPrimaryLocale } from "@/lib/localization";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If path is exactly "/" or root landing
  if (pathname === "/") {
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    const acceptLanguage = request.headers.get("accept-language");

    // Validate and resolve: user's local language if within the 6 languages, else (GB) English ("en")
    const targetLocale = resolveUserPrimaryLocale({
      cookieLocale,
      acceptLanguage,
    });

    const response = NextResponse.redirect(new URL(`/${targetLocale}`, request.url));

    // Preserve the detected primary language in cookie
    response.cookies.set("NEXT_LOCALE", targetLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });

    return response;
  }
}

export const config = {
  matcher: [
    // Match root path
    "/",
  ],
};
