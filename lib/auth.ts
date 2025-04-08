import { supabase } from "./supabase"

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

export async function updateUserRole(userId: string, role: string) {
  // Actualizar el rol en la tabla users
  const { error: updateError } = await supabase.from("users").update({ role }).eq("id", userId)

  if (updateError) throw updateError

  // Actualizar el rol en los metadatos de auth
  const { error: authError } = await supabase.auth.admin.updateUserById(userId, { app_metadata: { role } })

  if (authError) throw authError

  return { success: true }
}
