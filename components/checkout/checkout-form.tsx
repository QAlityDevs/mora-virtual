"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getEvent, getEventSeats, updateSeatStatus, updateTicketStatus } from "@/lib/data-service"

interface CheckoutFormProps {
  userId: string
  eventId: string
  seatIds: string[]
  userEmail: string
  userName: string
}

export function CheckoutForm({ userId, eventId, seatIds, userEmail, userName }: CheckoutFormProps) {
  const router = useRouter()
  const [event, setEvent] = useState<any>(null)
  const [seats, setSeats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: userName.split(" ")[0] || "",
    lastName: userName.split(" ").slice(1).join(" ") || "",
    email: userEmail,
    phone: "",
    cardName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Get event details
        const eventData = await getEvent(eventId)
        setEvent(eventData)

        // Get seats
        const allSeats = await getEventSeats(eventId)
        const selectedSeats = allSeats.filter((seat) => seatIds.includes(seat.id))
        setSeats(selectedSeats)
      } catch (err) {
        console.error("Error fetching checkout data:", err)
        setError("Error al cargar los datos de la compra")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId, seatIds])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)

    try {
      // Update seat status to sold
      for (const seatId of seatIds) {
        await updateSeatStatus(seatId, "sold")
      }

      // Update ticket status to purchased
      for (const seatId of seatIds) {
        // Find the ticket for this seat and update it
        // In a real app, you would have a more direct way to get the ticket ID
        // For now, we'll simulate this by updating based on seat_id
        await updateTicketStatus(seatId, "purchased")
      }

      // Redirect to confirmation page
      router.push("/confirmacion")
    } catch (err: any) {
      console.error("Error processing payment:", err)
      setError("Error al procesar el pago. Por favor, inténtalo de nuevo.")
      setIsProcessing(false)
    }
  }

  const totalPrice = seats.reduce((total, seat) => total + seat.price, 0)

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
        <p className="mt-4">Cargando información de la compra...</p>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="text-center py-12">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/eventos")} className="mt-4">
          Volver a Eventos
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Información de Pago</CardTitle>
              <CardDescription>Selecciona tu método de pago preferido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card" className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    Tarjeta de Crédito/Débito
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.217a.641.641 0 0 1 .632-.544h6.964c2.075 0 3.76.545 4.814 1.58.898.879 1.335 2.15 1.304 3.703-.138 5.05-3.395 6.455-6.725 6.455H9.308a.642.642 0 0 0-.633.543l-.955 5.703a.639.639 0 0 1-.633.544l-.01.136Z" />
                    </svg>
                    PayPal
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === "credit_card" && (
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
                      <Input
                        id="cardName"
                        placeholder="Nombre completo"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryMonth">Mes</Label>
                      <Input
                        id="expiryMonth"
                        placeholder="MM"
                        value={formData.expiryMonth}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryYear">Año</Label>
                      <Input
                        id="expiryYear"
                        placeholder="YY"
                        value={formData.expiryYear}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" value={formData.cvv} onChange={handleInputChange} required />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>Para enviarte los boletos y actualizaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" value={formData.firstName} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" value={formData.lastName} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing ? "Procesando..." : `Pagar $${totalPrice}`}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Compra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Evento:</h3>
              <p>{event?.name}</p>
              <p className="text-gray-600">
                {new Date(event?.date).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                - {event?.time}
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Asientos:</h3>
              <ul className="space-y-2">
                {seats.map((seat) => (
                  <li key={seat.id} className="flex justify-between">
                    <span>
                      Fila {seat.row}, Asiento {seat.number}
                    </span>
                    <span>${seat.price}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-sm text-gray-600">
          <p className="mb-2">
            <strong>Política de Cancelación:</strong> Puedes cancelar hasta 48 horas antes del evento para un reembolso
            completo.
          </p>
          <p>
            <strong>Nota:</strong> Los boletos serán enviados a tu correo electrónico después de completar la compra.
          </p>
        </div>
      </div>
    </div>
  )
}
