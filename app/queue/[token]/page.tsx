"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { QueueTracker } from "@/components/queue/queue-tracker"
import { getQueuePosition } from "@/lib/queue-service"

export default function QueuePage({ params }: { params: { token: string } }) {
  const [eventId, setEventId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const result = await getQueuePosition(params.token)

        if (!result.success) {
          throw new Error("No se pudo encontrar tu posición en la cola")
        }

        setEventId(result.data.event_id)
      } catch (err: any) {
        setError(err.message || "Error al cargar datos de la cola")
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [params.token])

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-6 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Cola Virtual</CardTitle>
            <CardDescription>Cargando información de la cola...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 px-6 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>No se pudo cargar la información de la cola.</p>
          </CardContent>
          <CardFooter className="justify-center">
            <a href="/" className="text-purple-700 hover:underline">
              Volver al inicio
            </a>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 px-6 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Cola Virtual</CardTitle>
          <CardDescription>Estás en la cola para comprar entradas para el evento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <QueueTracker token={params.token} eventId={eventId || undefined} />
        </CardContent>
      </Card>
    </div>
  )
}
