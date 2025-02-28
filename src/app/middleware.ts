import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = "your-secret-key";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    jwt.verify(token, SECRET_KEY);
    return NextResponse.next();
  } catch (error ) {
    console.log(error)
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Protect only `/admin` routes
export const config = {
  matcher: "/admin/:path*",
};
