import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  const path = request.nextUrl.pathname;

  const publicRoutes = ["/", "/login", "/signup", "/api/auth"];
  if (publicRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Safely check role with fallback
  const userRole = (session.user as { role: string }).role || "engineer";

  if (path.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
