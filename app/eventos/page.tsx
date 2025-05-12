import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Event = {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  image_url: string;
  status: string;
  sale_start_time: string;
  created_at: string;
};

export default async function EventosPage() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/events`);

  const events: Event[] = await response.json();

  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Eventos</h1>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            No hay eventos disponibles en este momento.
          </p>
          <Button asChild>
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event: any) => (
            <Card
              key={event.id}
              className="overflow-hidden transition-all hover:shadow-lg"
            >
              <img
                src={event.image_url || "/placeholder.svg?height=400&width=600"}
                alt={event.name}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                <p className="text-gray-600 mb-2">
                  {new Date(event.date).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  - {event.time}
                </p>
                <p className="text-gray-700 mb-4 line-clamp-2">
                  {event.description}
                </p>
                <Button asChild className="w-full">
                  <Link href={`/eventos/${event.id}`}>Ver Detalles</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
