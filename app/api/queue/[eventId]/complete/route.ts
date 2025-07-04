import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    // Validar autenticación
    const supabase = await createClient();
    const {
        data: { user },
        error: authError,
        } = await supabase.auth.getUser();
    const { eventId } = params;
    const { token } = await req.json();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }
    if (!token) {
        return NextResponse.json({ error: 'Falta el token de la cola.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('queue')
      .update({ status: 'completed' })
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .eq('token', token);

    if (error) {
      throw new Error(`Error al actualizar la cola: ${error.message}`);
    }

    return NextResponse.json({ success: true, message: 'Turno completado.' });
  } catch (err: any) {
    console.error('Error en /api/queue/complete:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}