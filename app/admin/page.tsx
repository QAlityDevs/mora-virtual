import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Eventos</CardTitle>
            <CardDescription>Crear, editar y eliminar eventos teatrales</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/eventos">Administrar Eventos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestión de Actores</CardTitle>
            <CardDescription>Administrar perfiles de actores</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/actores">Administrar Actores</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moderación de Foros</CardTitle>
            <CardDescription>Revisar y moderar mensajes en los foros</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/foros">Moderar Foros</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ventas de Boletos</CardTitle>
            <CardDescription>Ver estadísticas y reportes de ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/ventas">Ver Ventas</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>Administrar cuentas de usuarios y roles</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/usuarios">Administrar Usuarios</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Ajustes generales del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/configuracion">Configuración</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
