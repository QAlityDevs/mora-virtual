import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { seats?: string; event?: string }
}) {
  const user = await getUser()

  if (!user) {
    redirect("/auth?redirect=/checkout")
  }

  const { seats, event } = searchParams

  if (!seats || !event) {
    redirect("/eventos")
  }

  const seatIds = seats.split(",")

  return (
    <div className="container mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Finalizar Compra</h1>

      <CheckoutForm
        userId={user.id}
        eventId={event}
        seatIds={seatIds}
        userEmail={user.email}
        userName={user.user_metadata?.name || ""}
      />
    </div>
  )
}
