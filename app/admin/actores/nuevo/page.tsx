import { ActorForm } from "@/components/admin/actor-form"

export default function NuevoActorPage() {
  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-8">Crear Nuevo Actor</h1>
      <div className="max-w-3xl mx-auto">
        <ActorForm />
      </div>
    </div>
  )
}
