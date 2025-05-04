"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ActorForm } from "@/components/admin/actor-form";

type Actor = {
  id: string;
  name: string;
  bio: string;
  photo_url?: string;
};

export default function EditarActorPage({
  params,
}: {
  params: { id: string };
}) {
  const [actor, setActor] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchActor() {
      try {
        const res = await fetch(`/api/actors/${params.id}`);
        if (!res.ok) throw new Error("Error al obtener los datos del actor.");
        const data: Actor = await res.json();
        setActor(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchActor();
  }, [params.id]);

  if (loading) return <p>Cargando datos del actor...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-8">Editar Actor</h1>
      <div className="max-w-3xl mx-auto">
        {actor && <ActorForm actor={actor} isEditing={true} />}
      </div>
    </div>
  );
}
