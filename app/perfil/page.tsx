import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getUserProfile } from "@/lib/data-service"
import { ProfileForm } from "@/components/profile/profile-form"

export default async function ProfilePage() {
  const user = await getUser()

  if (!user) {
    redirect("/auth?redirect=/perfil")
  }

  const profile = await getUserProfile(user.id)

  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      <div className="max-w-3xl mx-auto">
        <ProfileForm user={user} profile={profile} />
      </div>
    </div>
  )
}
