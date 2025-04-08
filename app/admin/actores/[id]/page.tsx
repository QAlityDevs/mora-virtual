import { ActorForm } from "@/components/admin/actor-form"

export default function EditarActorPage({ params }: { params: { id: string } }) {
  // This would normally be fetched from Supabase
  const mockActor = {
    id: params.id,
    name: "Carlos Rodríguez",
    bio: "Actor con más de 10 años de experiencia en teatro clásico.",
    photo_url: "/placeholder.svg?height=300&width=300",
  }

  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-8">Editar Actor</h1>
      <div className="max-w-3xl mx-auto">
        <ActorForm actor={mockActor} isEditing={true} />
      </div>
    </div>
  )
}
