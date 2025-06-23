import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const seats = Array.isArray(body) ? body : [body];

  for (const seat of seats) {
    if (
      !seat.event_id ||
      !seat.row ||
      typeof seat.number !== "number" ||
      typeof seat.price !== "number" ||
      !seat.status
    ) {
      return NextResponse.json(
        { error: "Required fields are missing in one or more seats." },
        { status: 400 }
      );
    }
  }

  try {
    const { data, error } = await supabase.from("seats").insert(seats).select();

    if (error) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Unhandled error:", error);
    return NextResponse.json(
      { error: "Error creating the actor." },
      { status: 500 }
    );
  }
}
