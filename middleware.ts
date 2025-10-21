// import { NextRequest, NextResponse } from "next/server";

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   const publicRoutes = ["/", "/signup", "/forgot-password"];
//   const protectedAuthRoutes = [
//     "/otp",
//     "/profile",
//     "/interest",
//     "/verify-email",
//     "/verify-code",
//     "/create-password",
//     "/confirm-password",
//     "/success",
//     "/home",
//   ];

//   const isPublicRoute =
//     publicRoutes.includes(pathname) ||
//     pathname.startsWith("/layout") ||
//     pathname.startsWith("/shared");
//   const accessToken = request.cookies.get("accessToken")?.value;
//   const signupFlow = request.cookies.get("signupFlow")?.value;
//   const resetFlow = request.cookies.get("resetFlow")?.value;
//   // const loginFlow = request.cookies.get("loginFlow")?.value;
//   const isProtectedAuthRoute = protectedAuthRoutes.includes(pathname);

//   if (isPublicRoute) {
//     return NextResponse.next();
//   }
//   if (isProtectedAuthRoute) {
//     if (
//       (pathname === "/otp" ||
//         pathname === "/profile" ||
//         pathname === "/interest") &&
//       signupFlow
//     ) {
//       return NextResponse.next();
//     }

//     if (
//       (pathname === "/verify-code" ||
//         pathname === "/create-password" ||
//         pathname === "/confirm-password" ||
//         pathname === "/success") &&
//       resetFlow
//     ) {
//       return NextResponse.next();
//     }

//     // if (pathname === "/home" && accessToken) {
//     //   return NextResponse.next();
//     // }

//     if (accessToken) {
//       return NextResponse.next();
//     }

//     if (accessToken) {
//       return NextResponse.next();
//     }

//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   if (!accessToken) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif).*)",
//   ],
// };

/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif).*)",
  ],
};
