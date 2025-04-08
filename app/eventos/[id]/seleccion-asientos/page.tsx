import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getEvent, getEventSeats } from "@/lib/data-service"
import { SeatSelector } from "@/components/seats/seat-selector"

export default async function SeleccionAsientosPage({ params }: { params: { id: string } }) {
  const user = await getUser()

  if (!user) {
    redirect(`/auth?redirect=/eventos/${params.id}/seleccion-asientos`)
  }

  const event = await getEvent(params.id)

  if (!event) {
    redirect("/eventos")
  }

  const seats = await getEventSeats(params.id)

  return (
    <div className="container mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Selección de Asientos</h1>
      <h2 className="text-xl text-center mb-8">
        {event.name} - {new Date(event.date).toLocaleDateString("es-ES")} {event.time}
      </h2>

      <SeatSelector eventId={params.id} seats={seats} userId={user.id} />
    </div>
  )
}
