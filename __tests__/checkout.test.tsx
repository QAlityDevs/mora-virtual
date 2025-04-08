import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { getEvent, getEventSeats, updateSeatStatus, updateTicketStatus } from "@/lib/data-service"

// Mock the data service
jest.mock("@/lib/data-service", () => ({
  getEvent: jest.fn(),
  getEventSeats: jest.fn(),
  updateSeatStatus: jest.fn(),
  updateTicketStatus: jest.fn(),
}))

// Mock the next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe("CheckoutForm", () => {
  const mockEvent = {
    id: "event1",
    name: "Test Event",
    date: "2023-12-15",
    time: "19:00",
    description: "Test description",
    sale_start_time: "2023-12-10T18:00:00",
    status: "active",
  }

  const mockSeats = [
    { id: "seat1", row: "A", number: 1, price: 50, status: "reserved", event_id: "event1" },
    { id: "seat2", row: "A", number: 2, price: 50, status: "reserved", event_id: "event1" },
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    // Set up mocks
    ;(getEvent as jest.Mock).mockResolvedValue(mockEvent)
    ;(getEventSeats as jest.Mock).mockResolvedValue(mockSeats)
    ;(updateSeatStatus as jest.Mock).mockResolvedValue(true)
    ;(updateTicketStatus as jest.Mock).mockResolvedValue(true)
  })

  it("renders checkout form with event and seat information", async () => {
    render(
      <CheckoutForm
        userId="user1"
        eventId="event1"
        seatIds={["seat1", "seat2"]}
        userEmail="test@example.com"
        userName="Test User"
      />,
    )

    // Wait for data to load
    await waitFor(() => {
      expect(getEvent).toHaveBeenCalledWith("event1")
      expect(getEventSeats).toHaveBeenCalledWith("event1")
    })

    // Check if event info is displayed
    expect(screen.getByText("Test Event")).toBeInTheDocument()

    // Check if seats are displayed
    expect(screen.getByText("Fila A, Asiento 1")).toBeInTheDocument()
    expect(screen.getByText("Fila A, Asiento 2")).toBeInTheDocument()

    // Check if total price is correct
    expect(screen.getByText("$100")).toBeInTheDocument()
  })

  it("processes payment and redirects on successful checkout", async () => {
    const mockRouter = { push: jest.fn() }
    jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue(mockRouter)

    render(
      <CheckoutForm
        userId="user1"
        eventId="event1"
        seatIds={["seat1", "seat2"]}
        userEmail="test@example.com"
        userName="Test User"
      />,
    )

    // Wait for data to load
    await waitFor(() => {
      expect(getEvent).toHaveBeenCalledWith("event1")
    })

    // Fill in payment form
    fireEvent.change(screen.getByLabelText("Nombre en la Tarjeta"), {
      target: { value: "Test User" },
    })

    fireEvent.change(screen.getByLabelText("Número de Tarjeta"), {
      target: { value: "4242424242424242" },
    })

    fireEvent.change(screen.getByLabelText("Mes"), {
      target: { value: "12" },
    })

    fireEvent.change(screen.getByLabelText("Año"), {
      target: { value: "25" },
    })

    fireEvent.change(screen.getByLabelText("CVV"), {
      target: { value: "123" },
    })

    // Fill in contact form
    fireEvent.change(screen.getByLabelText("Teléfono"), {
      target: { value: "123456789" },
    })

    // Submit form
    fireEvent.click(screen.getByText("Pagar $100"))

    await waitFor(() => {
      // Check if seat status was updated to sold
      expect(updateSeatStatus).toHaveBeenCalledWith("seat1", "sold")
      expect(updateSeatStatus).toHaveBeenCalledWith("seat2", "sold")

      // Check if ticket status was updated to purchased
      expect(updateTicketStatus).toHaveBeenCalledWith("seat1", "purchased")
      expect(updateTicketStatus).toHaveBeenCalledWith("seat2", "purchased")

      // Check if redirected to confirmation page
      expect(mockRouter.push).toHaveBeenCalledWith("/confirmacion")
    })
  })

  it("displays error when payment processing fails", async () => {
    // Mock payment failure
    ;(updateSeatStatus as jest.Mock).mockRejectedValue(new Error("Payment failed"))

    render(
      <CheckoutForm
        userId="user1"
        eventId="event1"
        seatIds={["seat1", "seat2"]}
        userEmail="test@example.com"
        userName="Test User"
      />,
    )

    // Wait for data to load
    await waitFor(() => {
      expect(getEvent).toHaveBeenCalledWith("event1")
    })

    // Fill in payment form (minimal required fields)
    fireEvent.change(screen.getByLabelText("Nombre en la Tarjeta"), {
      target: { value: "Test User" },
    })

    fireEvent.change(screen.getByLabelText("Número de Tarjeta"), {
      target: { value: "4242424242424242" },
    })

    // Submit form
    fireEvent.click(screen.getByText("Pagar $100"))

    await waitFor(() => {
      // Check if error message is displayed
      expect(screen.getByText(/Error al procesar el pago/)).toBeInTheDocument()
    })
  })
})
