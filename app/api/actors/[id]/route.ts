import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request, context: { params: { id: string } }) {
  const { id } = await context.params;
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const supabase = await createClient(token);

  const { data: actor, error } = await supabase
    .from("actors")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !actor) {
    return NextResponse.json({ error: "Actor not found." }, { status: 404 });
  }

  return NextResponse.json(actor);
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  const { id } = await context.params;
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const supabase = await createClient(token);
  const body = await req.json();

  if (!body.name || !body.bio) {
    return NextResponse.json(
      { error: "Name and bio are required" },
      { status: 400 }
    );
  }

  try {
    const { data: updatedActor, error } = await supabase
      .from("actors")
      .update({
        name: body.name,
        bio: body.bio,
        photo_url: body.photo_url || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(updatedActor);
  } catch (error) {
    console.error("Error updating actor:", error);
    return NextResponse.json(
      { error: "Error updating the actor." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const supabase = await createClient(token);

  try {
    const { error } = await supabase.from("actors").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: "Actor deleted successfully." });
  } catch (error) {
    console.error("Error deleting actor:", error);
    return NextResponse.json(
      { error: "Error deleting the actor." },
      { status: 500 }
    );
  }
}
