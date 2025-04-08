import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { getActors } from "@/lib/data-service"

export default async function ActoresPage() {
  const actors = await getActors()

  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Actores</h1>

      {actors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay actores disponibles en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {actors.map((actor) => (
            <Card key={actor.id} className="overflow-hidden transition-all hover:shadow-lg">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={actor.photo_url || ""} alt={actor.name} />
                  <AvatarFallback className="text-2xl">{actor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold mb-2">{actor.name}</h3>
                <p className="text-gray-700 mb-4 line-clamp-3">{actor.bio}</p>
                <Link href={`/actores/${actor.id}`} className="text-purple-600 hover:underline">
                  Ver perfil completo
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
