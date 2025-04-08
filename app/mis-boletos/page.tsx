import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getUserTickets } from "@/lib/data-service"
import { TicketList } from "@/components/tickets/ticket-list"

export default async function MisBoletosPage() {
  const user = await getUser()

  if (!user) {
    redirect("/auth?redirect=/mis-boletos")
  }

  const tickets = await getUserTickets(user.id)

  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-8">Mis Boletos</h1>

      <TicketList tickets={tickets} />
    </div>
  )
}
