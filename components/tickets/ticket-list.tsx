import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { TicketWithDetails } from "@/lib/data-service"
import { TicketQR } from "./ticket-qr"

interface TicketListProps {
  tickets: TicketWithDetails[]
}

export function TicketList({ tickets }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500 mb-4">No tienes boletos comprados.</p>
        <Button asChild>
          <Link href="/eventos">Ver Eventos Disponibles</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="overflow-hidden">
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-xl">{ticket.event.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="font-medium">Fecha y Hora:</p>
              <p className="text-gray-700">
                {new Date(ticket.event.date).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-gray-700">{ticket.event.time}</p>
            </div>

            <div>
              <p className="font-medium">Asiento:</p>
              <p className="text-gray-700">
                Fila {ticket.seat.row}, Asiento {ticket.seat.number}
              </p>
            </div>

            <div>
              <p className="font-medium">Estado:</p>
              <p
                className={`${
                  ticket.status === "purchased"
                    ? "text-green-600"
                    : ticket.status === "reserved"
                      ? "text-amber-600"
                      : "text-red-600"
                }`}
              >
                {ticket.status === "purchased" ? "Comprado" : ticket.status === "reserved" ? "Reservado" : "Cancelado"}
              </p>
            </div>

            <TicketQR ticket={ticket} />
          </CardContent>
          <CardFooter className="bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Comprado el {new Date(ticket.purchase_date).toLocaleDateString("es-ES")}
            </p>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
