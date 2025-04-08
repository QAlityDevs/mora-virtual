"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { joinQueue } from "@/lib/queue-service"
import { getUser } from "@/lib/auth"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface JoinQueueButtonProps {
  eventId: string
  isQueueActive: boolean
  saleStartTime: string
}

export function JoinQueueButton({ eventId, isQueueActive, saleStartTime }: JoinQueueButtonProps) {
  const router = useRouter()
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleJoinQueue = async () => {
    setIsJoining(true)
    setError(null)

    try {
      const user = await getUser()

      if (!user) {
        router.push(`/auth?redirect=/eventos/${eventId}`)
        return
      }

      const result = await joinQueue(user.id, eventId)

      if (!result.success) {
        throw new Error("No se pudo unir a la cola. Inténtalo de nuevo.")
      }

      router.push(`/queue/${result.data.token}`)
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al unirse a la cola")
    } finally {
      setIsJoining(false)
    }
  }

  const formatTimeRemaining = () => {
    const now = new Date()
    const saleStart = new Date(saleStartTime)
    const diffMs = saleStart.getTime() - now.getTime()

    if (diffMs <= 0) return "La venta comenzará pronto"

    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `La cola se habilitará en ${diffHrs}h ${diffMins}m`
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isQueueActive ? (
        <Button onClick={handleJoinQueue} disabled={isJoining} className="w-full">
          {isJoining ? "Uniéndose..." : "Unirse a la Cola Virtual"}
        </Button>
      ) : (
        <div className="bg-gray-100 p-4 rounded-lg mb-4 text-center">
          <p className="text-gray-700">{formatTimeRemaining()}</p>
        </div>
      )}

      <div className="text-center text-sm text-gray-600">
        <p>La cola virtual garantiza un proceso de compra justo y ordenado.</p>
      </div>
    </div>
  )
}
