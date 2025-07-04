import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();

  const { tickets } = body;
  if (!Array.isArray(tickets) || tickets.length === 0) {
    return NextResponse.json(
      { error: "An array of tickets is required." },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("tickets")
      .insert(tickets)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tickets: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error creating tickets." },
      { status: 500 }
    );
  }
}
