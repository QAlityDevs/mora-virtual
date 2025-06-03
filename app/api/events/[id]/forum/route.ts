import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UUIDSchema } from "@/schemas/events";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const id = params.id;

  // Validate UUID
  const validated = UUIDSchema.safeParse(id);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("forum_posts")
      .select(`
        *,
        user:user_id(id, name)
      `)
      .eq("event_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch forum posts" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const id = params.id;
  const body = await req.json();

  // Validate input
  if (!body.content || !body.userId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("forum_posts")
      .insert([{
        event_id: id,
        user_id: body.userId,
        content: body.content,
        parent_id: body.parentId || null
      }])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
} 