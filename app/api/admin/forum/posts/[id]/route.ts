import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UUIDSchema } from "@/schemas/events";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const postId = params.id;

  console.log(postId);
  try {
    // Validate admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    // Validate post ID
    const validated = UUIDSchema.safeParse(postId);
    if (!validated.success) {
      return NextResponse.json(
        { error: "ID de mensaje inválido" },
        { status: 400 }
      );
    }

    // Delete post
    const { error: deleteError } = await supabase
      .from("forum_posts")
      .delete()
      .eq("id", postId);

    if (deleteError) throw deleteError;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar el mensaje" },
      { status: 500 }
    );
  }
}
