"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

interface EventFormProps {
  event?: {
    id: string
    name: string
    description: string
    date: string
    time: string
    sale_start_time: string
    image_url?: string
  }
  isEditing?: boolean
}

export function EventForm({ event, isEditing = false }: EventFormProps) {
  const router = useRouter()
  const [name, setName] = useState(event?.name || "")
  const [description, setDescription] = useState(event?.description || "")
  const [date, setDate] = useState(event?.date || "")
  const [time, setTime] = useState(event?.time || "")
  const [saleStartTime, setSaleStartTime] = useState(
    event?.sale_start_time ? new Date(event.sale_start_time).toISOString().slice(0, 16) : "",
  )
  const [imageUrl, setImageUrl] = useState(event?.image_url || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const eventData = {
        name,
        description,
        date,
        time,
        sale_start_time: new Date(saleStartTime).toISOString(),
        image_url: imageUrl || null,
        status: "upcoming",
      }

      if (isEditing && event) {
        // Update existing event
        const { error } = await supabase.from("events").update(eventData).eq("id", event.id)

        if (error) throw error
      } else {
        // Create new event
        const { error } = await supabase.from("events").insert([eventData])

        if (error) throw error
      }

      router.push("/admin/eventos")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al guardar el evento")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Evento" : "Nuevo Evento"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Evento</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale_start_time">Inicio de Venta</Label>
            <Input
              id="sale_start_time"
              type="datetime-local"
              value={saleStartTime}
              onChange={(e) => setSaleStartTime(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL de Imagen (opcional)</Label>
            <Input
              id="image_url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : isEditing ? "Actualizar Evento" : "Crear Evento"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
