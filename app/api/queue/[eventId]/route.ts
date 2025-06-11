import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { UUIDSchema } from '@/schemas/events';

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    // Validar eventId como UUID
    const { eventId } = await params;
    const parsedEventId = UUIDSchema.safeParse(eventId);
    if (!parsedEventId.success) {
      return NextResponse.json({ error: "Event ID inválido" }, { status: 400 });
    }

    // Validar autenticación
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 1. Obtener información del evento
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // 2. Validar estado del evento y hora de inicio de venta
    const now = new Date();
    const saleStartTime = new Date(event.sale_start_time);

    if (event.status !== 'active' || now < saleStartTime) {
      return NextResponse.json({ error: 'El evento no está disponible para venta' }, { status: 403 });
    }

    const token = uuidv4();

    // 6. Enviar mensaje a RabbitMQ
    try {
      const amqpUrl = process.env.CLOUDAMQP_URL!;
      const conn = await amqp.connect(amqpUrl);
      const channel = await conn.createChannel();

      const queueName = `queue_event_${eventId}`;
      await channel.assertQueue(queueName, { durable: true });

      const message = JSON.stringify({
        eventId,
        userId: user.id,
        token,
        timestamp: new Date().toISOString(),
      });

      channel.sendToQueue(queueName, Buffer.from(message), { persistent: true });

      setTimeout(() => {
        channel.close();
        conn.close();
      }, 500);

      return NextResponse.json({
        message: 'Solicitud de ingreso enviada. En espera de ser procesada.',
        token,
      });
      
    } catch (err) {
      console.error('RabbitMQ error:', err);
      return NextResponse.json({ error: 'Error en la cola de procesamiento' }, { status: 500 });
    }

  } catch (err) {
    console.error('Error general:', err);
    return NextResponse.json({ error: 'Error inesperado en el servidor' }, { status: 500 });
  }
}
