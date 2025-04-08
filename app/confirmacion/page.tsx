import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"

export default async function ConfirmacionPage() {
  const user = await getUser()

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="container mx-auto py-16 px-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl text-green-600">¡Compra Exitosa!</CardTitle>
          <CardDescription>Tu compra ha sido procesada correctamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-b pb-4">
            <p className="text-center text-gray-600">
              Número de Orden: <strong>ORD-{Math.floor(100000 + Math.random() * 900000)}</strong>
            </p>
            <p className="text-center text-gray-600">Fecha de Compra: {new Date().toLocaleString("es-ES")}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-700 text-center">
              Hemos enviado los boletos a tu correo electrónico. Por favor, revisa tu bandeja de entrada.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full">
            <Link href="/mis-boletos">Ver Mis Boletos</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
