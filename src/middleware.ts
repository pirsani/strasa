import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { DEFAULT_ROUTE_AFTER_LOGIN, isLoginRoute } from "./route";
export const middleware = auth(async (req) => {
  try {
    console.log("[MIDDLEWARE] time", Date.now());
    console.log("[MIDDLEWARE] req.url", req.url);
    const { nextUrl } = req;
    const session = req.auth;
    const isLoggedIn = !!session;

    console.log("[MIDDLEWARE] user: ", session);
    console.log("[MIDDLEWARE] trying access to url:", nextUrl.pathname);

    if (isLoggedIn && isLoginRoute(nextUrl.pathname)) {
      return Response.redirect(new URL(DEFAULT_ROUTE_AFTER_LOGIN, nextUrl));
    }

    if (!isLoggedIn && isLoginRoute(nextUrl.pathname)) {
      console.log("[MIDDLEWARE] login page");
      return;
    }

    if (isLoggedIn && !isLoginRoute(nextUrl.pathname)) {
      console.log("[MIDDLEWARE] logged in");
      const headers = new Headers(req.headers);
      headers.set("x-current-path", nextUrl.pathname);
      return NextResponse.next({
        request: {
          headers: headers,
        },
      });
    }

    console.log("[MIDDLEWARE] session", session);

    if (!isLoggedIn && !isLoginRoute(nextUrl.pathname)) {
      console.log("[MIDDLEWARE] not logged in");
      const response = NextResponse.redirect(new URL("/login", req.url));
      return response;
    }

    return;
  } catch (error) {
    console.error("[MIDDLEWARE] Unexpected error:", error);
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.set("authjs.csrf-token", "", { maxAge: 0 });
    response.cookies.set("__Secure-authjs.csrf-token", "", { maxAge: 0 });
    response.cookies.set("authjs.session-token", "", { maxAge: 0 });
    response.cookies.set("__Secure-authjs.session-token", "", {
      maxAge: 0,
    });
    return response;
  }
  return;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next|api/auth|trpc).*)"],
};

export default middleware;
