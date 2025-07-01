"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Seat, updateSeatStatus, createTicket } from "@/lib/data-service";

interface SeatSelectorProps {
  eventId: string
  seats: Seat[]
  userId: string
  token?: string
}

export function SeatSelector({ eventId, seats, userId, token }: SeatSelectorProps) {
  const router = useRouter()
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  // Sort rows
  const sortedRows = Object.keys(seatsByRow).sort();

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      // Time expired, redirect to event page
      router.push(`/eventos/${eventId}`);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, eventId, router]);

  const toggleSeatSelection = (seat: Seat) => {
    if (seat.status !== "available") return;

    const isSelected = selectedSeats.some((s) => s.id === seat.id);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleProceedToCheckout = async () => {
    if (selectedSeats.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Reserve seats
      for (const seat of selectedSeats) {
        await updateSeatStatus(seat.id, "reserved");
      }

      // Create tickets
      for (const seat of selectedSeats) {
        await createTicket({
          user_id: userId,
          event_id: eventId,
          seat_id: seat.id,
          purchase_date: new Date().toISOString(),
          status: "reserved",
        })
      }
      if (token) {
        await fetch(`/api/queue/${eventId}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token })
        });
      }
      // Redirect to checkout
      router.push(`/checkout?seats=${selectedSeats.map((s) => s.id).join(",")}&event=${eventId}`)
    } catch (err: any) {
      console.error("Error reserving seats:", err)
      setError("Error al reservar asientos. Por favor, inténtalo de nuevo.")
      setIsProcessing(false)
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
          Tiempo restante para completar su selección: {formatTime(timeLeft)}
        </div>
      </div>

      {error && (
        <div className="mb-8 text-center">
          <div className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded-lg">
            {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-100 p-6 rounded-lg">
            <div className="w-full bg-gray-300 h-8 mb-8 text-center text-gray-700 font-bold">
              ESCENARIO
            </div>

            <div className="flex flex-col items-center">
              {sortedRows.map((row) => (
                <div key={row} className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Fila {row}</div>
                  <div
                    className={`grid gap-2`}
                    style={{
                      gridTemplateColumns: `repeat(${seatsByRow[row].length}, minmax(100px, 1fr))`,
                      maxWidth: "100%",
                    }}
                  >
                    {seatsByRow[row].map((seat) => {
                      const isSelected = selectedSeats.some(
                        (s) => s.id === seat.id
                      );

                      return (
                        <button
                          key={seat.id}
                          onClick={() => toggleSeatSelection(seat)}
                          disabled={seat.status !== "available"}
                          className={`
                            aspect-square flex items-center justify-center text-xs font-medium rounded
                            ${
                              seat.status === "available" && !isSelected
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : ""
                            }
                            ${
                              seat.status === "reserved" ||
                              seat.status === "sold"
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : ""
                            }
                            ${isSelected ? "bg-purple-500 text-white" : ""}
                          `}
                          title={`Fila ${seat.row}, Asiento ${seat.number} - $${seat.price}`}
                        >
                          {seat.number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-8 mt-8">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                <span className="text-sm">Disponible</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                <span className="text-sm">Seleccionado</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                <span className="text-sm">No disponible</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Selección</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSeats.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">
                      Asientos seleccionados:
                    </h3>
                    <ul className="space-y-2">
                      {selectedSeats.map((seat) => (
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
                      <span>${getTotalPrice()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center">
                  Selecciona asientos para continuar
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleProceedToCheckout}
                disabled={selectedSeats.length === 0 || isProcessing}
                className="w-full"
              >
                {isProcessing ? "Procesando..." : "Proceder al Pago"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
