import { AuthForm } from "@/components/auth/auth-form"

export default function AuthPage() {
  return (
    <div className="container mx-auto py-16 px-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Acceso a Teatro Mora</h1>
        <AuthForm />
      </div>
    </div>
  )
}
