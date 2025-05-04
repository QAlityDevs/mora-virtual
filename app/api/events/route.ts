import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { EventSchema } from "@/schemas/events";

export async function GET() {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Error al obtener los eventos" },
      { status: 500 }
    );
  }

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 });
    }

    try {
      const supabase = await createClient(token);
      const body = await request.json();
      const validation = EventSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.errors.map((e) => e.message) },
          { status: 400 }
        );
      }

      const { data: newEvent, error } = await supabase
        .from("events")
        .insert([
          {
            name: body.name,
            description: body.description,
            date: body.date,
            time: body.time,
            image_url: body.image_url || null,
            sale_start_time: body.sale_start_time,
            status: body.status,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error de Supabase:", error);
        return NextResponse.json(
          { error: error.message || "Error al insertar el evento" },
          { status: 500 }
        );
      }

      return NextResponse.json(newEvent, { status: 201 });
    } catch (error) {
      console.error("Error crítico:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error en POST:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
