"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { activateNextInQueue } from "@/lib/queue-service"

export default function AdminEventoColaPage({ params }: { params: { id: string } }) {
  const [queueItems, setQueueItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [event, setEvent] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Fetch event details
      const { data: eventData } = await supabase.from("events").select("*").eq("id", params.id).single()

      setEvent(eventData)

      // Fetch queue items
      const { data } = await supabase
        .from("queue")
        .select(`
          *,
          users:user_id (name, email)
        `)
        .eq("event_id", params.id)
        .order("position", { ascending: true })

      setQueueItems(data || [])
      setLoading(false)
    }

    fetchData()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`queue:${params.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue",
          filter: `event_id=eq.${params.id}`,
        },
        () => {
          fetchData()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [params.id])

  const handleActivateNext = async (count: number) => {
    setActivating(true)
    await activateNextInQueue(params.id, count)
    setActivating(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
          <p className="mt-4">Cargando información de la cola...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-2">Gestión de Cola Virtual</h1>
      <p className="text-gray-600 mb-8">
        {event?.name} - {new Date(event?.date).toLocaleDateString("es-ES")} {event?.time}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cola de Espera</CardTitle>
            </CardHeader>
            <CardContent>
              {queueItems.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No hay usuarios en la cola actualmente.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Posición
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Usuario
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Estado
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Hora de Ingreso
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {queueItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.position}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.users?.name || "Usuario"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.status === "waiting"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : item.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : item.status === "completed"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.status === "waiting"
                                ? "En espera"
                                : item.status === "active"
                                  ? "Activo"
                                  : item.status === "completed"
                                    ? "Completado"
                                    : "Expirado"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.created_at).toLocaleString("es-ES")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Activa el siguiente grupo de usuarios en la cola para que puedan seleccionar asientos.
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleActivateNext(1)}
                    disabled={activating || queueItems.filter((item) => item.status === "waiting").length === 0}
                    className="w-full"
                  >
                    Activar Siguiente Usuario
                  </Button>
                  <Button
                    onClick={() => handleActivateNext(5)}
                    disabled={activating || queueItems.filter((item) => item.status === "waiting").length === 0}
                    className="w-full"
                  >
                    Activar 5 Usuarios
                  </Button>
                  <Button
                    onClick={() => handleActivateNext(10)}
                    disabled={activating || queueItems.filter((item) => item.status === "waiting").length === 0}
                    className="w-full"
                  >
                    Activar 10 Usuarios
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="font-medium mb-2">Estadísticas:</p>
                <ul className="space-y-1 text-sm">
                  <li>
                    <span className="text-gray-600">Total en cola:</span>{" "}
                    <span className="font-medium">{queueItems.length}</span>
                  </li>
                  <li>
                    <span className="text-gray-600">En espera:</span>{" "}
                    <span className="font-medium">{queueItems.filter((item) => item.status === "waiting").length}</span>
                  </li>
                  <li>
                    <span className="text-gray-600">Activos:</span>{" "}
                    <span className="font-medium">{queueItems.filter((item) => item.status === "active").length}</span>
                  </li>
                  <li>
                    <span className="text-gray-600">Completados:</span>{" "}
                    <span className="font-medium">
                      {queueItems.filter((item) => item.status === "completed").length}
                    </span>
                  </li>
                  <li>
                    <span className="text-gray-600">Expirados:</span>{" "}
                    <span className="font-medium">{queueItems.filter((item) => item.status === "expired").length}</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
