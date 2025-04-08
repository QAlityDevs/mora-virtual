"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut, getUser } from "@/lib/auth"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, User, LogOut } from "lucide-react"

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getUser()
      setUser(currentUser)
    }

    checkUser()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    window.location.href = "/"
  }

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-purple-700">
          Teatro Mora
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`hover:text-purple-700 ${pathname === "/" ? "text-purple-700 font-medium" : "text-gray-600"}`}
          >
            Inicio
          </Link>
          <Link
            href="/eventos"
            className={`hover:text-purple-700 ${pathname === "/eventos" || pathname.startsWith("/eventos/") ? "text-purple-700 font-medium" : "text-gray-600"}`}
          >
            Eventos
          </Link>
          <Link
            href="/actores"
            className={`hover:text-purple-700 ${pathname === "/actores" ? "text-purple-700 font-medium" : "text-gray-600"}`}
          >
            Actores
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User size={18} />
                  <span className="max-w-[100px] truncate">{user.user_metadata?.name || "Usuario"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/perfil">Mi Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/mis-boletos">Mis Boletos</Link>
                </DropdownMenuItem>
                {user.user_metadata?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Panel Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut size={16} className="mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/auth">Iniciar Sesión</Link>
            </Button>
          )}
        </div>

        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden pt-4 pb-3 border-t border-gray-200">
          <div className="space-y-1 px-4">
            <Link
              href="/"
              className={`block py-2 ${pathname === "/" ? "text-purple-700 font-medium" : "text-gray-600"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/eventos"
              className={`block py-2 ${pathname === "/eventos" || pathname.startsWith("/eventos/") ? "text-purple-700 font-medium" : "text-gray-600"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Eventos
            </Link>
            <Link
              href="/actores"
              className={`block py-2 ${pathname === "/actores" ? "text-purple-700 font-medium" : "text-gray-600"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Actores
            </Link>

            {user ? (
              <>
                <Link href="/perfil" className="block py-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
                  Mi Perfil
                </Link>
                <Link href="/mis-boletos" className="block py-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
                  Mis Boletos
                </Link>
                {user.user_metadata?.role === "admin" && (
                  <Link href="/admin" className="block py-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
                    Panel Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left py-2 text-red-600"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="block py-2 text-purple-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
