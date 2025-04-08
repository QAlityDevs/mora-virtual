import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import type { Actor } from "@/lib/data-service"

interface EventActorsProps {
  actors: Actor[]
}

export function EventActors({ actors }: EventActorsProps) {
  if (actors.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay actores asignados a este evento.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {actors.map((actor) => (
        <Card key={actor.id}>
          <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-center md:items-start">
            <Avatar className="w-24 h-24">
              <AvatarImage src={actor.photo_url || ""} alt={actor.name} />
              <AvatarFallback>{actor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">{actor.name}</h3>
              <p className="text-gray-700">{actor.bio}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
