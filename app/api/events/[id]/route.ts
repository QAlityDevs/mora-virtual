import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { EventSchema, UUIDSchema } from "@/schemas/events";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validación del ID
    const { id } = await params;
    const parsedId = UUIDSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
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

    try {
      const { data: event, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return NextResponse.json(
          { error: "Evento no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(event);
    } catch (error) {
      console.error("Error crítico:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error en GET:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validación del ID
    const { id } = await params;
    const parsedId = UUIDSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
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
    try {
      const body = await request.json();

      // 3. Validación del cuerpo
      const bodyValidation = EventSchema.safeParse(body);
      if (!bodyValidation.success) {
        return NextResponse.json(
          {
            error: "Validación fallida",
            details: bodyValidation.error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }

      const { data: updatedEvent, error } = await supabase
        .from("events")
        .update({
          name: body.name,
          description: body.description,
          date: body.date,
          time: body.time,
          image_url: body.image_url || null,
          sale_start_time: body.sale_start_time,
          status: body.status,
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return NextResponse.json(
            { error: "Evento no encontrado" },
            { status: 404 }
          );
        }

        return NextResponse.json(
          {
            error: "Error en base de datos",
            details: error.message,
            code: error.code,
          },
          { status: 500 }
        );
      }

      if (!updatedEvent) {
        return NextResponse.json(
          { error: "El evento no existe" },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedEvent, { status: 200 });
    } catch (error) {
      console.error("Error crítico:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error en PUT:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validación del ID
    const { id } = await params;
    const parsedId = UUIDSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
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

    try {
      // Primero eliminar relaciones con actores
      const { error: relationError } = await supabase
        .from("event_actors")
        .delete()
        .eq("event_id", id);

      if (relationError) {
        console.error("Error deleting actor relations:", relationError.message);
        return NextResponse.json(
          {
            error: "Error eliminando relaciones de actores del evento",
            details: relationError.message,
          },
          { status: 500 }
        );
      }

      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) {
        return NextResponse.json(
          {
            error: "Error deleting event",
            details: error.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: "Event deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error crítico:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error en DELETE:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
