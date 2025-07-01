"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EventSchema } from "@/schemas/events";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Actor = {
  id: string;
  name: string;
};

interface EventFormProps {
  event?: {
    id: string;
    name: string;
    description: string;
    date: string;
    time: string;
    sale_start_time: string;
    image_url?: string;
    status: "upcoming" | "active" | "completed";
    actors?: Actor[];
  };
  isEditing?: boolean;
}

export function EventForm({
  event: initialEventData,
  isEditing: isEditing,
}: EventFormProps) {
  const router = useRouter();
  const [actors, setActors] = useState<Actor[]>([]);
  const [selectedActorIds, setSelectedActorIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    sale_start_time: "",
    image_url: undefined,
    status: "upcoming" as "upcoming" | "active" | "completed",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActorSelectOpen, setIsActorSelectOpen] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (initialEventData) {
      setFormData({
        name: initialEventData.name,
        description: initialEventData.description,
        date: initialEventData.date,
        time: initialEventData.time,
        sale_start_time: initialEventData.sale_start_time,
        image_url: initialEventData.image_url || undefined,
        status: initialEventData.status,
      });

      setSelectedActorIds(initialEventData.actors?.map((a) => a.id) || []);
    }
  }, [initialEventData]);

  // Cargar actores
  useEffect(() => {
    const fetchActors = async () => {
      try {
        const res = await fetch("/api/actors", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Error cargando actores");
        const data = await res.json();
        setActors(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchActors();
  }, []);

  const handleActorSelect = (actorId: string) => {
    setSelectedActorIds((prev) => {
      if (prev.includes(actorId)) {
        return prev.filter((id) => id !== actorId);
      }
      return [...prev, actorId];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const saleStartISO = new Date(formData.sale_start_time).toISOString();

      const validation = EventSchema.safeParse({
        ...formData,
        image_url: formData.image_url || undefined,
        sale_start_time: saleStartISO,
      });

      if (!validation.success) {
        const errors = validation.error.errors.map((e) => e.message).join(", ");
        throw new Error(`Validación fallida: ${errors}`);
      }

      const eventEndpoint =
        isEditing && initialEventData
          ? `/api/events/${initialEventData.id}`
          : "/api/events";

      const eventMethod = isEditing ? "PUT" : "POST";

      const eventResponse = await fetch(eventEndpoint, {
        method: eventMethod,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(validation.data),
      });

      if (!eventResponse.ok) {
        const errorData = await eventResponse.json();
        throw new Error(errorData.error || "Error guardando evento");
      }

      const eventData = await eventResponse.json();
      const eventId = eventData.id || initialEventData?.id;

      if (eventId && selectedActorIds.length > 0) {
        const actorsResponse = await fetch(`/api/events/${eventId}/actors`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ actor_ids: selectedActorIds }),
        });

        if (!actorsResponse.ok) {
          const errorData = await actorsResponse.json();
          throw new Error(errorData.error || "Error actualizando actores");
        }
      }

      if (!isEditing && eventId) {
        const rows = 5;
        const rowSeating = 5;
        const price = 5000;
        const lettersRows = Array.from({ length: rows }, (_, i) =>
          String.fromCharCode(65 + i)
        );

        const seatsPayload = [];
        for (const row of lettersRows) {
          for (let number = 1; number <= rowSeating; number++) {
            seatsPayload.push({
              event_id: eventId,
              row,
              number,
              price: price,
              status: "available",
            });
          }
        }

        await fetch("/api/events/seats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(seatsPayload),
        });
      }

      router.push("/admin/eventos");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al guardar el evento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={5}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleChange("time", e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale_start_time">Inicio de Venta</Label>
            <Input
              id="sale_start_time"
              type="datetime-local"
              value={formData.sale_start_time}
              onChange={(e) => handleChange("sale_start_time", e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL de Imagen (opcional)</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) =>
                handleChange("image_url", e.target.value || undefined)
              }
              placeholder="https://ejemplo.com/imagen.jpg"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Próximo</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="completed">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Actores Asociados</Label>
            <Select
              open={isActorSelectOpen}
              onOpenChange={setIsActorSelectOpen}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={`Seleccionados: ${selectedActorIds.length}`}
                />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {actors.map((actor) => (
                  <div
                    key={actor.id}
                    className="flex items-center p-2 hover:bg-accent cursor-pointer"
                    onClick={() => handleActorSelect(actor.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedActorIds.includes(actor.id)}
                      readOnly
                      className="mr-2 h-4 w-4"
                    />
                    <span>{actor.name}</span>
                  </div>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground mt-1">
              {selectedActorIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {actors
                    .filter((actor) => selectedActorIds.includes(actor.id))
                    .map((actor) => (
                      <span
                        key={actor.id}
                        className="px-2 py-1 bg-accent rounded-full text-xs"
                      >
                        {actor.name}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Guardando..."
              : isEditing
              ? "Actualizar Evento"
              : "Crear Evento"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
