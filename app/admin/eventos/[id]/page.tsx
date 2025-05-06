"use client";

import { useEffect, useState } from "react";
import { EventForm } from "@/components/admin/event-form";
import { useParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function EditarEventoPage() {
  const params = useParams<{ id: string }>();
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/events/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error cargando el evento");
        const data = await res.json();

        // Asegurar el formato correcto de las fechas
        const formattedData = {
          ...data,
          sale_start_time: new Date(data.sale_start_time)
            .toISOString()
            .slice(0, 16),
        };

        setEventData(formattedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-6">
        <p>Cargando evento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 px-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-8">Editar Evento</h1>
      <div className="max-w-3xl mx-auto">
        {eventData ? (
          <EventForm event={eventData} isEditing={true} />
        ) : (
          <p>Evento no encontrado</p>
        )}
      </div>
    </div>
  );
}
