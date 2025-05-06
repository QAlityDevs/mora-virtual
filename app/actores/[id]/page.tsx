import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getActor } from "@/lib/data-service"
import { notFound } from "next/navigation"

export default async function ActorDetailPage({ params }: { params: { id: string } }) {
  const actor = await getActor(params.id)

  if (!actor) {
    notFound()
  }

  return (
    <div className="container mx-auto py-16 px-6">
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <Avatar className="w-48 h-48">
              <AvatarImage src={actor.photo_url || ""} alt={actor.name} />
              <AvatarFallback className="text-4xl">{actor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold mb-4">{actor.name}</h1>
              <div className="space-y-4">
                <p className="text-gray-700 whitespace-pre-line">{actor.bio}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
