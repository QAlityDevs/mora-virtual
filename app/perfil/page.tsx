import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/data-service"
import { ProfileForm } from "@/components/profile/profile-form"

export default async function ProfilePage() {

  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect("/auth?redirect=/perfil")
  }

  const profile = await getUserProfile(data.user.id)

  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      <div className="max-w-3xl mx-auto">
        <ProfileForm user={data.user} profile={profile} />
      </div>
    </div>
  )
}
