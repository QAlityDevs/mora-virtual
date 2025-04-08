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

interface ActorFormProps {
  actor?: {
    id: string
    name: string
    bio: string
    photo_url?: string
  }
  isEditing?: boolean
}

export function ActorForm({ actor, isEditing = false }: ActorFormProps) {
  const router = useRouter()
  const [name, setName] = useState(actor?.name || "")
  const [bio, setBio] = useState(actor?.bio || "")
  const [photoUrl, setPhotoUrl] = useState(actor?.photo_url || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const actorData = {
        name,
        bio,
        photo_url: photoUrl || null,
      }

      if (isEditing && actor) {
        // Update existing actor
        const { error } = await supabase.from("actors").update(actorData).eq("id", actor.id)

        if (error) throw error
      } else {
        // Create new actor
        const { error } = await supabase.from("actors").insert([actorData])

        if (error) throw error
      }

      router.push("/admin/actores")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al guardar el actor")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Actor" : "Nuevo Actor"}</CardTitle>
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
            <Label htmlFor="name">Nombre del Actor</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={5} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo_url">URL de Foto (opcional)</Label>
            <Input
              id="photo_url"
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : isEditing ? "Actualizar Actor" : "Crear Actor"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
