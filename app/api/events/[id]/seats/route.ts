import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const eventId = params.id;

  if (!eventId) {
    return NextResponse.json(
      { error: "Event ID is required." },
      { status: 400 }
    );
  }

  try {
    const { data: seats, error } = await supabase
      .from("seats")
      .select("*")
      .eq("event_id", eventId)
      .order("row", { ascending: true })
      .order("number", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(seats, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error fetching seats." },
      { status: 500 }
    );
  }
}
