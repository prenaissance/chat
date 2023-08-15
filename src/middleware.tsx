//write next.js middleware to redirect all unauthorized users to login page
import {
  NextResponse,
  type NextRequest,
  type NextMiddleware,
} from "next/server";

const middleware: NextMiddleware = (req: NextRequest) => {
  if (
    req.nextUrl.pathname === "/api/auth/signin" ||
    req.nextUrl.pathname === "/"
  ) {
    return NextResponse.next();
  }
  const sessionToken = req.cookies.get("next-auth.session-token")?.value;
  if (!sessionToken) {
    return NextResponse.redirect(
      new URL(
        `/api/auth/signin?${new URLSearchParams({
          callbackUrl: req.nextUrl.toString(),
        }).toString()}`,
        req.nextUrl.origin
      )
    );
  }
  return NextResponse.next();
};

export default middleware;

export const config = {
  runtime: "experimental-edge",
  matcher: ["/((?!api/auth/.*|_next/static|_next/image|favicon.ico|$).*)"],
};
