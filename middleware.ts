import { auth } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";

// Routes accessible without authentication.
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/privacy",
  "/terms",
  "/dpa",
  "/share",         // candidate-share view-only links
  "/api/auth",      // NextAuth endpoints
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) =>
    p === pathname || pathname === p + "/" || pathname.startsWith(p + "/"),
  );
}

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;
  const isAuthed = !!req.auth;

  if (!isPublic(pathname) && !isAuthed) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  if (pathname === "/login" && isAuthed) {
    return NextResponse.redirect(new URL("/jobs", req.url));
  }
  return NextResponse.next();
});

// Skip static assets and metadata files so they don't pay the auth cost.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|mp3|mp4|webm)$).*)",
  ],
};
