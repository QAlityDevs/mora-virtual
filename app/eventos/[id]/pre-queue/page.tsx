// /app/eventos/[id]/pre-queue/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

// --- DEFINICIÓN DE INTERFACES ---
interface EventDetails {
  name: string;
  date: string;
  image_url: string | null;
  sale_start_time: string; // Necesitamos este campo para el contador
}

// --- Lógica de formateo de tiempo ---
const formatTimeLeft = (ms: number) => {
    if (ms < 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};


// --- COMPONENTE DE CONTENIDO ---
function PreQueueContent() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Efecto para cargar datos del evento ---
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('events')
          .select('name, date, image_url, sale_start_time')
          .eq('id', eventId)
          .single();

        if (error || !data) throw new Error('No se pudo encontrar la información del evento.');
        
        setEventDetails(data);
        // Inicializamos el contador
        setTimeLeft(new Date(data.sale_start_time).getTime() - Date.now());

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventData();
  }, [eventId]);

  // --- Efecto para el contador y la transición ---
  useEffect(() => {
    if (timeLeft === null) return;
    
    // Condición de salida: el tiempo se acabó
    if (timeLeft <= 0) {
      // Intentamos unirnos a la cola principal
      const joinActiveQueue = async () => {
          setIsTransitioning(true);
          setError(null);
          try {
              const response = await fetch(`/api/queue/${eventId}`, { method: 'POST' });
              const data = await response.json();
              if (response.ok && data.token) {
                  router.push(`/eventos/${eventId}/waiting-room?token=${data.token}`);
              } else {
                  throw new Error(data.error || 'No se pudo unir a la cola.');
              }
          } catch (err: any) {
              setError(err.message);
              setIsTransitioning(false);
          }
      };
      
      joinActiveQueue();
      return; // Detenemos el timer
    }

    // Actualizamos el contador cada segundo
    const timer = setInterval(() => {
      setTimeLeft(prevTime => (prevTime ? prevTime - 1000 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, eventId, router]);


  // --- RENDERIZADO DEL COMPONENTE ---
  if (isLoading) {
    return <div className="text-center p-4">Cargando información del evento...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }
  
  if (!eventDetails) {
    return null;
  }

  return (
    <Card className="w-full max-w-md overflow-hidden">
      <CardHeader className="p-0">
        {eventDetails.image_url && (
            <img src={eventDetails.image_url} alt={eventDetails.name} className="w-full h-48 object-cover"/>
        )}
        <div className="p-6">
            <CardTitle>{eventDetails.name}</CardTitle>
            <p className="text-sm text-gray-500 pt-1">
                {new Date(eventDetails.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 border-t">
        <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">La venta de boletos comenzará pronto</h3>
            <p className="text-gray-600 mb-6 text-sm">Estás en la sala de espera previa. Cuando el contador llegue a cero, te asignaremos un lugar en la fila automáticamente.</p>
            
            <div className="p-6 bg-gray-100 rounded-lg">
                <div className="text-sm text-gray-500 mb-2">Tiempo restante para el inicio de la venta</div>
                <div className="text-5xl font-bold tracking-tighter">
                    {timeLeft !== null ? formatTimeLeft(timeLeft) : '00:00:00'}
                </div>
            </div>

            {isTransitioning && <p className="text-blue-500 mt-4">¡Es la hora! Uniéndote a la fila...</p>}
        </div>
      </CardContent>
    </Card>
  );
}


// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function PreQueuePage() {
  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md"><CardContent className="p-8 text-center">Cargando...</CardContent></Card>
      }>
        <PreQueueContent />
      </Suspense>
    </main>
  );
}