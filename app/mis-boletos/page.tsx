import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserTickets } from "@/lib/data-service"
import { TicketList } from "@/components/tickets/ticket-list"


export default async function MisBoletosPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect("/auth?redirect=/mis-boletos")
  }

  const tickets = await getUserTickets(data.user.id)

  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-8">Mis Boletos</h1>

      <TicketList tickets={tickets} />
    </div>
  )
}
