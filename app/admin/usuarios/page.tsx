import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { UserList } from "@/components/admin/user-list"

export default async function AdminUsuariosPage() {
  const user = await getUser()

  if (!user) {
    redirect("/auth?redirect=/admin/usuarios")
  }

  // Verificar si el usuario es administrador
  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!userData || userData.role !== "admin") {
    redirect("/")
  }

  // Obtener todos los usuarios
  const { data: users } = await supabase.from("users").select("*").order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>
      <UserList users={users || []} />
    </div>
  )
}
