import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAmqpChannel } from '@/lib/amqp-client';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const UUIDSchema = z.string().uuid({ message: "El ID del evento debe ser un UUID válido." });

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = await params;
    const parsedEventId = UUIDSchema.safeParse(eventId);
    if (!parsedEventId.success) {
      return NextResponse.json({ error: parsedEventId.error.errors[0].message }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    const now = new Date();
    const saleStartTime = new Date(event.sale_start_time);

    if (event.status !== 'active' || now < saleStartTime) {
      return NextResponse.json({ error: 'El evento no está disponible para venta' }, { status: 403 });
    }

    const { data: existingEntry } = await supabase
      .from('queue')
      .select('token')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .maybeSingle();

    if (existingEntry) {
      // Si ya está, devolvemos su token existente con un código de éxito.
      return NextResponse.json({
        message: 'Ya estabas en la cola. Redirigiendo...',
        token: existingEntry.token,
      });
    }

    // --- Si no está, lo insertamos ---
    const token = uuidv4();
    const tempPosition = 999999; 

    // Usamos 'waiting' como estado inicial, que es un valor válido.
    const { error: insertError } = await supabase
      .from('queue')
      .insert({
        event_id: eventId,
        user_id: user.id,
        token: token,
        status: 'waiting', 
        position: tempPosition
      });
    
    if (insertError) throw insertError;

    // Enviamos el mensaje al worker para que calcule la posición final
    try {
      const channel = await getAmqpChannel();
      const queueName = `queue_event_${eventId}`;
      await channel.assertQueue(queueName, { durable: true });

      const message = {
        userId: user.id,
        eventId: eventId,
        queueToken: token,
      };

      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });

      return NextResponse.json({
        message: 'Te hemos añadido a la cola. Serás redirigido.',
        token: token,
      });
      
    } catch (amqpError) {
        await supabase.from('queue').delete().eq('token', token);
        throw amqpError;
    }

  } catch (err: any) {
    console.error('Error en endpoint de cola:', err);
    if (err.code === '23514') {
        return NextResponse.json({ error: 'El estado proporcionado no es válido.'}, {status: 400});
    }
    return NextResponse.json({ error: err.message || 'Error inesperado.' }, { status: 500 });
  }
}
