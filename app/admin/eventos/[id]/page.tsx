import { EventForm } from "@/components/admin/event-form"

export default function EditarEventoPage({ params }: { params: { id: string } }) {
  // This would normally be fetched from Supabaseparams}: {params: {id: string}}) {
  // This would normally be fetched from Supabase
  const mockEvent = {
    id: params.id,
    name: "Romeo y Julieta",
    description: "La clásica historia de amor de Shakespeare en una producción moderna.",
    date: "2023-12-15",
    time: "19:00",
    sale_start_time: "2023-12-10T18:00:00",
    image_url: "/placeholder.svg?height=600&width=800",
  }

  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-8">Editar Evento</h1>
      <div className="max-w-3xl mx-auto">
        <EventForm event={mockEvent} isEditing={true} />
      </div>
    </div>
  )
}
