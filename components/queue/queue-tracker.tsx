"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getQueuePosition } from "@/lib/queue-service"
import { supabase } from "@/lib/supabase"

interface QueueTrackerProps {
  token: string
  initialPosition?: number
  initialStatus?: string
  eventId?: string
}

export function QueueTracker({ token, initialPosition, initialStatus, eventId }: QueueTrackerProps) {
  const router = useRouter()
  const [position, setPosition] = useState(initialPosition || 0)
  const [status, setStatus] = useState(initialStatus || "waiting")
  const [totalAhead, setTotalAhead] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQueueData = async () => {
      try {
        setLoading(true)

        // Get current position
        const result = await getQueuePosition(token)

        if (!result.success) {
          throw new Error("No se pudo obtener la posición en la cola")
        }

        setPosition(result.data.position)
        setStatus(result.data.status)

        // Get total people ahead
        const { count } = await supabase
          .from("queue")
          .select("*", { count: "exact" })
          .eq("event_id", result.data.event_id)
          .eq("status", "waiting")
          .lt("position", result.data.position)

        setTotalAhead(count || 0)

        // Estimate time (2 minutes per person)
        setEstimatedTime(Math.max(1, Math.ceil((count || 0) * 2)))
      } catch (err: any) {
        setError(err.message || "Error al cargar datos de la cola")
      } finally {
        setLoading(false)
      }
    }

    fetchQueueData()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`queue:${token}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "queue",
          filter: `token=eq.${token}`,
        },
        (payload) => {
          setStatus(payload.new.status)
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [token])

  const handleProceed = () => {
    if (eventId) {
      router.push(`/eventos/${eventId}/seleccion-asientos`)
    }
  }

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
        <p className="mt-4">Cargando información de la cola...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        <p>{error}</p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Volver al Inicio
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {status === "active" ? (
        <div className="text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-green-600">¡Es tu turno!</h3>
          <p className="text-gray-600">Ya puedes proceder a seleccionar tus asientos y completar tu compra.</p>
          <Button onClick={handleProceed} className="w-full">
            Proceder a la Selección de Asientos
          </Button>
        </div>
      ) : status === "completed" ? (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold">Compra Completada</h3>
          <p className="text-gray-600">Has completado tu compra exitosamente.</p>
          <Button asChild className="w-full">
            <a href="/mis-boletos">Ver Mis Boletos</a>
          </Button>
        </div>
      ) : status === "expired" ? (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-amber-600">Sesión Expirada</h3>
          <p className="text-gray-600">Tu tiempo para comprar ha expirado. Deberás volver a unirte a la cola.</p>
          <Button asChild className="w-full">
            <a href="/">Volver al Inicio</a>
          </Button>
        </div>
      ) : (
        <>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-700 mb-2">{position}</div>
            <p className="text-gray-600">Tu posición en la cola</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <span>{totalAhead > 0 ? `${totalAhead} personas antes que tú` : "Eres el siguiente"}</span>
            </div>
            <Progress
              value={totalAhead === 0 ? 100 : Math.min(100, Math.max(0, 100 - (totalAhead / position) * 100))}
              className="h-2"
            />
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-center text-purple-700">
              Tiempo estimado de espera: <strong>{estimatedTime} minutos</strong>
            </p>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>No cierres esta ventana o perderás tu lugar en la cola.</p>
            <p>Te notificaremos cuando sea tu turno.</p>
          </div>
        </>
      )}
    </div>
  )
}
