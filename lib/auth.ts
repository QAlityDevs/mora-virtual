import { createBrowserClient } from '@supabase/ssr'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export async function signUp(email: string, password: string, userData: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  })

  return { data, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function isAdmin(user: any) {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()
  if (error) throw error
  return data.role === "admin"
  }

export async function updateUserRole(userId: string, role: string) {
  // Actualizar el rol en la tabla users
  const { error: updateError } = await supabase.from("users").update({ role }).eq("id", userId)

  if (updateError) throw updateError

  // Actualizar el rol en los metadatos de auth
  const { error: authError } = await supabase.auth.admin.updateUserById(userId, { app_metadata: { role } })

  if (authError) throw authError

  return { success: true }
}
