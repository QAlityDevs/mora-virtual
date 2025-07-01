// app/api/queue/[eventId]/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    const token = req.nextUrl.searchParams.get('token');

    // 1. Validar que los parámetros necesarios existen
    if (!eventId || !token) {
      return NextResponse.json(
        { error: 'Faltan los parámetros eventId o token.' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();

    // 2. Obtener la entrada de la cola del usuario actual de forma segura
    const { data: queueEntry, error: queueError } = await supabase
      .from('queue')
      .select('position, status, event_id')
      .eq('token', token)
      .single();

    if (queueError || !queueEntry) {
      return NextResponse.json(
        { error: 'No se encontró tu sesión en la cola. Por favor, intenta de nuevo.' },
        { status: 404 }
      );
    }
    
    // Verificación de seguridad adicional
    if (queueEntry.event_id !== eventId) {
        return NextResponse.json(
            { error: 'El token no corresponde al evento solicitado.' },
            { status: 409 } // 409 Conflict
        );
    }

    // 3. Lógica de activación: Si el usuario está en posición 1 y esperando, es su turno.
    if (queueEntry.position === 1 && queueEntry.status === 'waiting') {
        const { error: updateError } = await supabase
            .from('queue')
            .update({ status: 'active' })
            .eq('token', token);

        if (updateError) {
            // Si la actualización falla, se lanza un error para que no continúe.
            throw new Error(`Error al activar el turno: ${updateError.message}`);
        }
        // Actualizamos el objeto en memoria para que la respuesta sea inmediata.
        queueEntry.status = 'active';
    }
    
    // 4. Contar usuarios que están por delante en la misma cola
    const { count: usersAhead, error: countError } = await supabase
      .from('queue')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'waiting')
      .lt('position', queueEntry.position);
      
    if (countError) {
        throw new Error("Error al calcular los usuarios en la fila.");
    }
    
    // 5. Calcular tiempo de espera estimado (ej: 1 minuto por persona)
    // Puedes ajustar el '1' según el 'flow_rate_per_minute' del evento si lo deseas.
    const estimatedWaitTime = (usersAhead ?? 0) * 1; 

    // 6. Construir y devolver la respuesta final y completa
    const responsePayload = {
      status: queueEntry.status,
      position: queueEntry.position,
      usersAhead: usersAhead ?? 0,
      estimatedWaitTime: estimatedWaitTime,
      lastUpdatedAt: new Date().toISOString(),
    };

    return NextResponse.json(responsePayload, { status: 200 });

  } catch (err: any) {
    // Un único manejador de errores para producción
    console.error('Error en API /api/queue/[eventId]/status:', err.message);
    return NextResponse.json(
      { error: 'Ocurrió un error en el servidor.' },
      { status: 500 }
    );
  }
}