import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function AdminEventosPage() {
  // This would normally be fetched from Supabase
  const events = [
    {
      id: "1",
      name: "Romeo y Julieta",
      date: "2023-12-15",
      time: "19:00",
      status: "upcoming",
    },
    {
      id: "2",
      name: "El Fantasma de la Ópera",
      date: "2023-12-20",
      time: "20:00",
      status: "upcoming",
    },
    {
      id: "3",
      name: "Hamlet",
      date: "2023-12-25",
      time: "18:30",
      status: "upcoming",
    },
  ]

  return (
    <div className="container mx-auto py-16 px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Eventos</h1>
        <Button asChild>
          <Link href="/admin/eventos/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Evento
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nombre
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Fecha
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Hora
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{event.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{event.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      event.status === "upcoming"
                        ? "bg-blue-100 text-blue-800"
                        : event.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {event.status === "upcoming" ? "Próximo" : event.status === "active" ? "Activo" : "Completado"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/eventos/${event.id}`} className="text-purple-600 hover:text-purple-900 mr-4">
                    Editar
                  </Link>
                  <Link
                    href={`/admin/eventos/${event.id}/actores`}
                    className="text-purple-600 hover:text-purple-900 mr-4"
                  >
                    Actores
                  </Link>
                  <Link href={`/admin/eventos/${event.id}/cola`} className="text-purple-600 hover:text-purple-900">
                    Cola
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
