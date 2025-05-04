import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { EventSchema, UUIDSchema, ActorRelationSchema } from "@/schemas/events";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validación del ID
    const { id } = await params;
    const parsed = UUIDSchema.safeParse(id);
    if (!parsed.success) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("events")
        .select(
          `
      *,
      event_actors (
        actors ( * )
      )
    `
        )
        .eq("id", id)
        .single();

      if (error) {
        return NextResponse.json(
          { error: "Evento no encontrado o error en consulta." },
          { status: 404 }
        );
      }

      const actors =
        data.event_actors?.map((rel: any) => {
          return rel.actors;
        }) ?? [];

      // Construir y devolver la respuesta
      const responsePayload = {
        id: data.id,
        name: data.name,
        description: data.description,
        date: data.date,
        time: data.time,
        image_url: data.image_url,
        sale_start_time: data.sale_start_time,
        status: data.status,
        actors,
      };

      return NextResponse.json(responsePayload);
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

export async function POST(
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
    if (!token) {
      return NextResponse.json(
        { error: "Acceso no autorizado" },
        { status: 401 }
      );
    }
    try {
      const supabase = await createClient();

      // Parsear y validar el body
      const body = await request.json();
      const parsed = ActorRelationSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.format() },
          { status: 400 }
        );
      }

      const { actor_ids } = parsed.data;

      // Crear los registros para insertar
      const inserts = actor_ids.map((actor_id) => ({
        event_id: id,
        actor_id,
      }));

      // Insertar en la tabla event_actors
      const { error } = await supabase.from("event_actors").insert(inserts);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(
        { message: "Actores asociados correctamente al evento" },
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
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
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
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
      const supabase = await createClient();

      // Validar body
      const body = await req.json();
      const { actor_id } = body;
      const parsedBody = UUIDSchema.safeParse(actor_id);
      if (!parsedBody.success) {
        return NextResponse.json(
          { error: "actor_id inválido" },
          { status: 400 }
        );
      }
      const {
        data: rows,
        error: selectError,
        status,
      } = await supabase
        .from("event_actors")
        .select("*")
        .eq("event_id", id)
        .eq("actor_id", actor_id);

      if (selectError) {
        return NextResponse.json(
          { error: selectError.message },
          { status: 500 }
        );
      }

      if (!rows || rows.length === 0) {
        return NextResponse.json(
          { warning: "No se encontró relación entre actor y evento" },
          { status: 404 }
        );
      }

      const rowId = rows[0].id;

      const { error: deleteError } = await supabase
        .from("event_actors")
        .delete()
        .eq("id", rowId);

      if (deleteError) {
        return NextResponse.json(
          { error: deleteError.message },
          { status: 500 }
        );
      }
      return NextResponse.json({ message: "Actor desasociado del evento" });
    } catch (error) {
      console.error("Error crítico:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(error);
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
      return NextResponse.json(
        { error: "ID de evento inválido" },
        { status: 400 }
      );
    }

    // Validar autenticación
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
      const supabase = await createClient();
      const body = await request.json();

      // Validar body con el schema existente
      const parsed = ActorRelationSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.format() },
          { status: 400 }
        );
      }

      const { actor_ids } = parsed.data;

      // Eliminar todas las relaciones existentes para este evento
      const { error: deleteError } = await supabase
        .from("event_actors")
        .delete()
        .eq("event_id", id);

      if (deleteError) {
        return NextResponse.json(
          {
            error: `Error eliminando relaciones antiguas: ${deleteError.message}`,
          },
          { status: 500 }
        );
      }

      // Si no hay nuevos actores, terminar aquí
      if (actor_ids.length === 0) {
        return NextResponse.json(
          { message: "Todos los actores desasociados del evento" },
          { status: 200 }
        );
      }

      // Crear nuevas relaciones
      const uniqueActorIds = [...new Set(actor_ids)]; // Eliminar duplicados
      const inserts = uniqueActorIds.map((actor_id) => ({
        event_id: id,
        actor_id,
      }));

      // Insertar nuevas relaciones
      const { error: insertError } = await supabase
        .from("event_actors")
        .insert(inserts);

      if (insertError) {
        return NextResponse.json(
          { error: `Error creando nuevas relaciones: ${insertError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "Actores actualizados exitosamente" },
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
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
