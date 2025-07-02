'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

// --- DEFINICIÓN DE INTERFACES ---
interface QueueState {
  status: string;
  position: number;
  usersAhead: number;
  estimatedWaitTime: number;
  lastUpdatedAt: string;
}

interface EventDetails {
  name: string;
  date: string;
  image_url: string | null;
}

// --- COMPONENTE DE CONTENIDO ---
function WaitingRoomContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const eventId = params.id as string;
  const token = searchParams.get('token');

  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const playNotificationSound = () => {
    const audio = new Audio('/sounds/queue-notification.mp3');
    audio.play().catch(error => {
      console.warn("El sonido de notificación fue bloqueado por el navegador:", error);
    });
  };

  useEffect(() => {
    // Carga los datos iniciales del evento y del estado en la cola.
    const fetchInitialData = async () => {
      if (!token || !eventId) {
        setIsLoading(false);
        if(!token) setError('Token de sesión no encontrado en la URL.');
        return;
      }

      try {
        const supabase = createClient();
        
        const [eventResponse, queueResponse] = await Promise.all([
          supabase.from('events').select('name, date, image_url').eq('id', eventId).single(),
          fetch(`/api/queue/${eventId}/status?token=${token}`)
        ]);

        const { data: eventData, error: eventError } = eventResponse;
        if (eventError || !eventData) throw new Error('No se pudo encontrar la información del evento.');
        setEventDetails(eventData);

        if (!queueResponse.ok) {
            const errorData = await queueResponse.json();
            throw new Error(errorData.error || 'No se pudo obtener el estado de la cola.');
        }
        const queueData: QueueState = await queueResponse.json();
        setQueueState(queueData);

        if (queueData.status === 'active') {
          playNotificationSound(); 
          router.push(`/eventos/${eventId}/seleccion-asientos?token=${token}`);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [token, eventId, router]);

  useEffect(() => {
    // Se suscribe a actualizaciones en tiempo real.
    if (!token || !queueState) return;

    const supabase = createClient();
    const channel = supabase.channel(`queue-updates-for-${token}`)
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'queue', filter: `token=eq.${token}` }, 
          (payload) => {
              const updatedEntry = payload.new as { status: string, position: number };

              // Cuando el estado se actualice a 'active', redirigir.
              if (updatedEntry.status === 'active') {
                playNotificationSound();
                router.push(`/eventos/${eventId}/seleccion-asientos?token=${token}`);
              } else {
                // Si no es 'active', actualizamos el estado para mostrar la nueva posición.
                fetch(`/api/queue/${eventId}/status?token=${token}`)
                    .then(res => res.json())
                    .then(data => setQueueState(data));
              }
          }
      )
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [token, eventId, router, queueState]);


  // --- RENDERIZADO DEL COMPONENTE (sin cambios) ---
  if (isLoading) {
    return <div className="text-center p-4">Cargando tu lugar en la fila...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }
  
  if (!queueState || !eventDetails) {
    return <div className="text-center p-4">Verificando tu sesión...</div>;
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
            <h3 className="text-xl font-bold mb-2">Estás en la fila</h3>
            <p className="text-gray-600 mb-6 text-sm">Por favor, no cierres esta página. Serás redirigido automáticamente cuando sea tu turno.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-100 rounded-lg">
                    <div className="text-sm text-gray-500">Tu Posición</div>
                    <div className="text-3xl font-bold">{queueState.position}</div>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                    <div className="text-sm text-gray-500">Espera Estimada</div>
                    <div className="text-3xl font-bold">~{queueState.estimatedWaitTime} min</div>
                </div>
            </div>
            <p className="text-xs text-gray-400">Última actualización: {new Date(queueState.lastUpdatedAt).toLocaleTimeString('es-ES')}</p>
        </div>
      </CardContent>
    </Card>
  );
}


// --- COMPONENTE PRINCIPAL DE LA PÁGINA (sin cambios) ---
export default function WaitingRoomPage() {
  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md"><CardContent className="p-8 text-center">Cargando...</CardContent></Card>
      }>
        <WaitingRoomContent />
      </Suspense>
    </main>
  );
}