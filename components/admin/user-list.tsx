"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  name: string
  role: string
  created_at: string
}

interface UserListProps {
  users: User[]
}

export function UserList({ users }: UserListProps) {
  const [userList, setUserList] = useState<User[]>(users)
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading((prev) => ({ ...prev, [userId]: true }))
    setError(null)
    setSuccess(null)

    try {
      // Actualizar el rol en la tabla users
      const { error: updateError } = await supabase.from("users").update({ role: newRole }).eq("id", userId)

      if (updateError) throw updateError

      // Actualizar el rol en los metadatos de auth
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, { app_metadata: { role: newRole } })

      if (authError) throw authError

      // Actualizar la lista local
      setUserList(userList.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

      setSuccess(`Rol de usuario actualizado correctamente a ${newRole}`)
    } catch (err: any) {
      console.error("Error updating user role:", err)
      setError(err.message || "Error al actualizar el rol del usuario")
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              ) : (
                userList.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "actor"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role === "admin" ? "Administrador" : user.role === "actor" ? "Actor" : "Usuario"}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString("es-ES")}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                        disabled={loading[user.id]}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuario</SelectItem>
                          <SelectItem value="actor">Actor</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
