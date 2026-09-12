import {
  type NextRequest,
  NextResponse,
} from "next/server";

// ======================================================
// COOKIE NAMES
// ======================================================



// User UI protected-route authentication cookies.
const USER_ACCESS_TOKEN_COOKIE =
  "user_access_token";

const USER_REFRESH_TOKEN_COOKIE =
  "user_refresh_token";

// ======================================================
// MIDDLEWARE
// ======================================================

export function middleware(
  request: NextRequest
) {
  const accessToken =
    request.cookies.get(
      USER_ACCESS_TOKEN_COOKIE
    )?.value;

  const refreshToken =
    request.cookies.get(
      USER_REFRESH_TOKEN_COOKIE
    )?.value;

  const { pathname, search } =
    request.nextUrl;

  // ====================================================
  // ROUTE GROUPS
  // ====================================================

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

  const isProtectedRoute =
    protectedRoutes.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(
          `${route}/`
        )
    );

  const isAuthRoute =
    authRoutes.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(
          `${route}/`
        )
    );

  /*
   * A refresh token is accepted here so an expired access
   * token does not prevent the client from reaching the page
   * and refreshing its authentication session.
   *
   * This is only a navigation check. Protected backend APIs
   * must still validate the access token themselves.
   */
  const hasAuthenticationToken =
    Boolean(
      accessToken || refreshToken
    );

  // ====================================================
  // PROTECTED ROUTE REDIRECT
  // ====================================================

  if (
    isProtectedRoute &&
    !hasAuthenticationToken
  ) {
    const loginUrl =
      request.nextUrl.clone();

    loginUrl.pathname = "/login";

    loginUrl.search = "";

    const returnUrl =
      `${pathname}${search}`;

    loginUrl.searchParams.set(
      "returnUrl",
      returnUrl
    );

    return NextResponse.redirect(
      loginUrl
    );
  }

  // ====================================================
  // AUTH ROUTE REDIRECT
  // ====================================================

  if (
    isAuthRoute &&
    accessToken
  ) {
    const homeUrl =
      request.nextUrl.clone();

    homeUrl.pathname = "/";
    homeUrl.search = "";

    return NextResponse.redirect(
      homeUrl
    );
  }

  return NextResponse.next();
}

// ======================================================
// MATCHER
// ======================================================

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