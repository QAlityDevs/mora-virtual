"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import type { TicketWithDetails } from "@/lib/data-service"

interface TicketQRProps {
  ticket: TicketWithDetails
}

export function TicketQR({ ticket }: TicketQRProps) {
  const [qrCode, setQrCode] = useState<string | null>(null)

  useEffect(() => {
    const generateQR = async () => {
      try {
        const ticketData = {
          id: ticket.id,
          eventId: ticket.event_id,
          seatId: ticket.seat_id,
          row: ticket.seat.row,
          number: ticket.seat.number,
        }

        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(ticketData))
        setQrCode(qrDataUrl)
      } catch (err) {
        console.error("Error generating QR code:", err)
      }
    }

    generateQR()
  }, [ticket])

  if (!qrCode) {
    return <div className="h-32 w-32 bg-gray-200 animate-pulse mx-auto"></div>
  }

  return (
    <div className="flex justify-center">
      <img src={qrCode || "/placeholder.svg"} alt="Ticket QR Code" className="h-32 w-32" />
    </div>
  )
}
