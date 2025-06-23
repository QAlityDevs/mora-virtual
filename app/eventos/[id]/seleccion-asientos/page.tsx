import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/data-service";
import { SeatSelector } from "@/components/seats/seat-selector";

export default async function SeleccionAsientosPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect(`/auth?redirect=/eventos/${params.id}/seleccion-asientos`);
  }

  const event = await getEvent(params.id);

  if (!event) {
    redirect("/eventos");
  }

  const seatsFetch = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/events/${params.id}/seats`
  );
  const seats = await seatsFetch.json();

  return (
    <div className="container mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Selección de Asientos
      </h1>
      <h2 className="text-xl text-center mb-8">
        {event.name} - {new Date(event.date).toLocaleDateString("es-ES")}{" "}
        {event.time}
      </h2>
      <SeatSelector eventId={params.id} seats={seats} userId={data.user.id} />
    </div>
  );
}
