import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminActoresPage() {
  // This would normally be fetched from Supabase
  const actors = [
    {
      id: "1",
      name: "Carlos Rodríguez",
      bio: "Actor con más de 10 años de experiencia en teatro clásico.",
      photo_url: "/placeholder.svg?height=300&width=300",
    },
    {
      id: "2",
      name: "Ana García",
      bio: "Graduada de la Real Escuela de Arte Dramático, ha participado en numerosas producciones internacionales.",
      photo_url: "/placeholder.svg?height=300&width=300",
    },
    {
      id: "3",
      name: "Miguel Fernández",
      bio: "Reconocido por su versatilidad y energía en escena.",
      photo_url: "/placeholder.svg?height=300&width=300",
    },
  ]

  return (
    <div className="container mx-auto py-16 px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Actores</h1>
        <Button asChild>
          <Link href="/admin/actores/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Actor
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actors.map((actor) => (
          <div key={actor.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage src={actor.photo_url} alt={actor.name} />
                  <AvatarFallback>{actor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{actor.name}</h3>
                </div>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">{actor.bio}</p>
              <div className="flex justify-end">
                <Link href={`/admin/actores/${actor.id}`} className="text-purple-600 hover:text-purple-900 mr-4">
                  Editar
                </Link>
                <button className="text-red-600 hover:text-red-900">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
