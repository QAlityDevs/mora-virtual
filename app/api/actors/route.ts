import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: actors, error } = await supabase
    .from("actors")
    .select("*")
    .order("name");

  if (error) {
    return NextResponse.json(
      { error: "Error fetching actors." },
      { status: 500 }
    );
  }

  return NextResponse.json(actors);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  if (!body.name?.trim() || !body.bio?.trim()) {
    return NextResponse.json(
      { error: "Name and bio are required." },
      { status: 400 }
    );
  }

  try {
    const { data: newActor, error } = await supabase.from("actors").insert([
      {
        name: body.name,
        bio: body.bio,
        photo_url: body.photo_url || null,
      },
    ]);

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return NextResponse.json(newActor, { status: 201 });
  } catch (error) {
    console.error("Unhandled error:", error);
    return NextResponse.json(
      { error: "Error creating the actor." },
      { status: 500 }
    );
  }
}
