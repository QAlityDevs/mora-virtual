import { EventForm } from "@/components/admin/event-form"

export default function NuevoEventoPage() {
  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-8">Crear Nuevo Evento</h1>
      <div className="max-w-3xl mx-auto">
        <EventForm />
      </div>
    </div>
  )
}
