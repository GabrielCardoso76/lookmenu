import { jwtVerify } from "jose"
import { NextResponse, type NextRequest } from "next/server"

import { SESSION_COOKIE } from "@/lib/session"

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) return null
  return new TextEncoder().encode(secret)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const secret = getSecret()

  if (pathname.startsWith("/login")) {
    if (token && secret) {
      try {
        const { payload } = await jwtVerify(token, secret)
        const papel = payload.papel as string
        const dest = papel === "LOJISTA" ? "/painel" : "/admin"
        return NextResponse.redirect(new URL(dest, request.url))
      } catch {
        // token inválido — mostra login
      }
    }
    return NextResponse.next()
  }

  if (!token || !secret) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    const papel = payload.papel as string

    if (pathname.startsWith("/admin")) {
      if (papel !== "SUPER_ADMIN") {
        if (papel === "LOJISTA") {
          return NextResponse.redirect(new URL("/painel", request.url))
        }
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }

    if (pathname.startsWith("/painel")) {
      if (papel !== "LOJISTA") {
        if (papel === "SUPER_ADMIN") {
          return NextResponse.redirect(new URL("/admin", request.url))
        }
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/admin/:path*", "/painel/:path*", "/login"],
}
