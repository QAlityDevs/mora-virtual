"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Actor = {
  id: string;
  name: string;
  bio: string;
  photo_url?: string;
};

export default function ActoresPage() {
  const [actores, setActores] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchActores() {
      try {
        const res = await fetch("/api/actors");
        if (!res.ok) throw new Error("Error al obtener los actores.");
        const data: Actor[] = await res.json();
        setActores(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchActores();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este actor?")) return;

    try {
      const res = await fetch(`/api/actors/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar el actor.");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredActores = actores.filter((actor) =>
    actor.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Actores</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Buscar actores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded"
          />
          <Button onClick={() => router.push("/admin/actores/nuevo")}>
            Agregar Actor
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  No se encontraron actores.
                </TableCell>
              </TableRow>
            ) : (
              filteredActores.map((actor) => (
                <TableRow key={actor.id}>
                  <TableCell>{actor.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/admin/actores/${actor.id}`)}
                      className="mr-2"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(actor.id)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
