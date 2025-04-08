import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificar si el usuario está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si no hay sesión y la ruta es protegida, redirigir a login
  if (!session && req.nextUrl.pathname.startsWith("/admin")) {
    const redirectUrl = new URL("/auth", req.url)
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si hay sesión, verificar si el usuario es admin para rutas de administración
  if (session && req.nextUrl.pathname.startsWith("/admin")) {
    const { data: user } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (!user || user.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return res
}

// Configurar las rutas que deben ser verificadas por el middleware
export const config = {
  matcher: ["/admin/:path*"],
}
