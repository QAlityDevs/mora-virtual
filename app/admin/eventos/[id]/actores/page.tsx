"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function AdminEventoActoresPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<any>(null)
  const [actors, setActors] = useState<any[]>([])
  const [selectedActors, setSelectedActors] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        // Fetch event details
        const { data: eventData } = await supabase.from("events").select("*").eq("id", params.id).single()

        setEvent(eventData)

        // Fetch all actors
        const { data: actorsData } = await supabase.from("actors").select("*").order("name")

        setActors(actorsData || [])

        // Fetch currently assigned actors
        const { data: eventActors } = await supabase.from("event_actors").select("actor_id").eq("event_id", params.id)

        if (eventActors) {
          setSelectedActors(eventActors.map((ea) => ea.actor_id))
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleActorToggle = (actorId: string) => {
    setSelectedActors((prev) => (prev.includes(actorId) ? prev.filter((id) => id !== actorId) : [...prev, actorId]))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Delete existing assignments
      await supabase.from("event_actors").delete().eq("event_id", params.id)

      // Create new assignments
      if (selectedActors.length > 0) {
        const eventActors = selectedActors.map((actorId) => ({
          event_id: params.id,
          actor_id: actorId,
        }))

        const { error } = await supabase.from("event_actors").insert(eventActors)

        if (error) throw error
      }

      setSuccess("Actores asignados correctamente")
    } catch (err: any) {
      setError(err.message || "Error al guardar los actores")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
          <p className="mt-4">Cargando información...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-2">Asignar Actores al Evento</h1>
      <p className="text-gray-600 mb-8">
        {event?.name} - {new Date(event?.date).toLocaleDateString("es-ES")} {event?.time}
      </p>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Seleccionar Actores</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {actors.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No hay actores disponibles.</p>
            ) : (
              actors.map((actor) => (
                <div key={actor.id} className="flex items-center space-x-2 border-b pb-4">
                  <Checkbox
                    id={`actor-${actor.id}`}
                    checked={selectedActors.includes(actor.id)}
                    onCheckedChange={() => handleActorToggle(actor.id)}
                  />
                  <Label htmlFor={`actor-${actor.id}`} className="flex-1 cursor-pointer">
                    <div className="font-medium">{actor.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{actor.bio}</div>
                  </Label>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
