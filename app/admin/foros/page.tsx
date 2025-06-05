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
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type ForumPost = {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
  event: {
    id: string;
    name: string;
  };
};

export default function ForosPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [groupedPosts, setGroupedPosts] = useState<Record<string, ForumPost[]>>(
    {}
  );
  const router = useRouter();
  const [allPosts, setAllPosts] = useState<ForumPost[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/admin/forum/posts", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Error al obtener los mensajes");
        const data = await res.json();
        setAllPosts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  useEffect(() => {
    const filtered = allPosts.filter(post => {
      const searchLower = search.toLowerCase();
      return (
        post.content.toLowerCase().includes(searchLower) ||
        post.user.name.toLowerCase().includes(searchLower) ||
        post.user.role.toLowerCase().includes(searchLower) ||
        post.event.name.toLowerCase().includes(searchLower)
      );
    });

    const grouped = filtered.reduce((acc, post) => {
      const eventId = post.event.id;
      if (!acc[eventId]) acc[eventId] = [];
      acc[eventId].push(post);
      return acc;
    }, {} as Record<string, ForumPost[]>);

    setGroupedPosts(grouped);
  }, [search, allPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este mensaje?")) return;

    try {
      const res = await fetch(`/api/admin/forum/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("Error al eliminar el mensaje");

      setGroupedPosts((prevGrouped) =>
        Object.fromEntries(
          Object.entries(prevGrouped)
            .map(([eventId, posts]) => [
              eventId,
              posts.filter((post) => post.id !== id),
            ])
            .filter(([, posts]) => posts.length > 0)
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPp", { locale: es });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderación de Foros</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between mb-4 gap-4">
          <Input
            placeholder="Buscar mensajes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {Object.entries(groupedPosts).map(([eventId, posts]) => (
          <div key={eventId} className="mb-8 border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{posts[0].event.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/eventos/${eventId}`)}
              >
                Ver Evento
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Contenido</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{post.user.name}</span>
                        {post.user.role === "actor" && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            Actor
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      {post.content}
                    </TableCell>
                    <TableCell>{formatDate(post.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
