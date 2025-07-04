'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface JoinQueueButtonProps {
  eventId: string;
  eventStatus: string;
  saleStartTime: string;
}

const formatTimeLeft = (ms: number) => {
    if (ms < 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};


export function JoinQueueButton({ eventId, eventStatus, saleStartTime }: JoinQueueButtonProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(new Date(saleStartTime).getTime() - Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(new Date(saleStartTime).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [saleStartTime]);

  const handleJoinQueue = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    if (timeLeft > 0 && timeLeft <= 5 * 60 * 1000) {
      router.push(`/eventos/${eventId}/pre-queue`);
      return; 
    }

    try {
      const response = await fetch(`/api/queue/${eventId}`, { method: 'POST' });
      const data = await response.json();

      if (response.ok && data.token) {
        router.push(`/eventos/${eventId}/waiting-room?token=${data.token}`);
      } else {
        throw new Error(data.error || 'Ocurrió un error desconocido.');
      }
    } catch (error: any) {
      console.error('Error al unirse a la cola:', error);
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  };
  
  const saleIsActive = timeLeft <= 0;
  const inPreSaleWindow = timeLeft > 0 && timeLeft <= 5 * 60 * 1000;
  const saleIsFuture = timeLeft > 5 * 60 * 1000;

  let buttonText = '';
  if (isLoading) {
    buttonText = 'Ingresando...';
  } else if (eventStatus === 'completed') {
    buttonText = 'Venta Finalizada';
  } else if (saleIsActive) {
    buttonText = 'Unirse a la Fila';
  } else if (inPreSaleWindow) {
    buttonText = 'Unirse a la Sala de Espera';
  } else if (saleIsFuture) {
    buttonText = 'Venta Próximamente';
  }

  return (
    <div>
      <Button
        onClick={handleJoinQueue}
        disabled={isLoading || eventStatus === 'completed' || saleIsFuture}
        className="w-full"
        size="lg"
      >
        {buttonText}
      </Button>
      {errorMessage && <p className="text-red-500 text-sm mt-2 text-center">{errorMessage}</p>}
    </div>
  );
}