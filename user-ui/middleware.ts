import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token");

  const { pathname } = request.nextUrl;

  const protectedRoutes = [
    "/profile",
    "/orders",
    "/wishlist",
    "/cart",
    "/checkout",
  ];

  const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Not logged in → protect routes
  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Already logged in → don't allow login/signup
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/login",
    "/signup/:path*",
    "/forgot-password/:path*",
  ],
};