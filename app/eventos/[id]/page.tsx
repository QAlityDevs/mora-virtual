import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventForum } from "@/components/events/event-forum"
import { EventActors } from "@/components/events/event-actors"
import { JoinQueueButton } from "@/components/events/join-queue-button"
import { getEvent, getEventActors } from "@/lib/data-service"
import { notFound } from "next/navigation"

export default async function EventoDetallePage({ params: { id } }: { params: { id: string } }) {
  // --- FETCHING DE DATOS ---:
  const event = await getEvent(id);
  if (!event) {
    notFound();
  }
 // Check if queue is active (based on current time vs sale_start_time)
  const now = new Date()
  const saleStart = new Date(event.sale_start_time)
  const isQueueActive = now >= saleStart
    const actors = await getEventActors(id);

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* --- ENCABEZADO Y DESCRIPCIÓN DEL EVENTO --- */}
          <img
            src={event.image_url || "/placeholder.svg?height=600&width=800"}
            alt={event.name}
            className="w-full h-auto rounded-lg mb-6"
          />
          <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full">
              {new Date(event.date).toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full">{event.time}</div>
          </div>
          <p className="text-gray-700 mb-8 whitespace-pre-line">{event.description}</p>

          {/* --- PESTAÑAS DE ACTORES Y FORO --- */}
          <Tabs defaultValue="actors">
            <TabsList className="mb-6">
              <TabsTrigger value="actors">Actores</TabsTrigger>
              <TabsTrigger value="forum">Foro</TabsTrigger>
            </TabsList>
            <TabsContent value="actors">
              <EventActors actors={actors} />
            </TabsContent>
            <TabsContent value="forum">
              <EventForum eventId={event.id} />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          {/* --- TARJETA DE INFORMACIÓN DE VENTA --- */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Información de Venta</h2>
              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  <strong>Inicio de venta:</strong> {new Date(event.sale_start_time).toLocaleString("es-ES")}
                </p>
                <p className="text-gray-700">
                  <strong>Estado:</strong>{" "}
                  <span className={`${event.status === "upcoming" ? "text-blue-600" : event.status === "active" ? "text-green-600" : "text-gray-600"}`}>
                    {event.status === "upcoming" ? "Próximamente" : event.status === "active" ? "Activo" : "Completado"}
                  </span>
                </p>
              </div>

              {/* --- BOTÓN DE COLA DINÁMICO --- */}
              <JoinQueueButton
                eventId={event.id}
                eventStatus={event.status || 'upcoming'}
                saleStartTime={event.sale_start_time}
              />
            </CardContent>
          </Card>

          {/* --- BOTONES PARA COMPARTIR --- */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3">Compartir</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full">{/* ... SVG ... */}</Button>
              <Button variant="outline" size="icon" className="rounded-full">{/* ... SVG ... */}</Button>
              <Button variant="outline" size="icon" className="rounded-full">{/* ... SVG ... */}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}