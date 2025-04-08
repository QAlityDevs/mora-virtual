import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SeatSelector } from "@/components/seats/seat-selector"
import { updateSeatStatus, createTicket } from "@/lib/data-service"

// Mock the data service
jest.mock("@/lib/data-service", () => ({
  updateSeatStatus: jest.fn(),
  createTicket: jest.fn(),
}))

// Mock the next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe("SeatSelector", () => {
  const mockSeats = [
    { id: "seat1", row: "A", number: 1, price: 50, status: "available", event_id: "event1" },
    { id: "seat2", row: "A", number: 2, price: 50, status: "available", event_id: "event1" },
    { id: "seat3", row: "A", number: 3, price: 50, status: "sold", event_id: "event1" },
    { id: "seat4", row: "B", number: 1, price: 40, status: "available", event_id: "event1" },
    { id: "seat5", row: "B", number: 2, price: 40, status: "reserved", event_id: "event1" },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("renders seats correctly", () => {
    render(<SeatSelector eventId="event1" seats={mockSeats} userId="user1" />)

    // Check if rows are rendered
    expect(screen.getByText("Fila A")).toBeInTheDocument()
    expect(screen.getByText("Fila B")).toBeInTheDocument()

    // Check if seat numbers are rendered
    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
  })

  it("allows selecting available seats", () => {
    render(<SeatSelector eventId="event1" seats={mockSeats} userId="user1" />)

    // Initially no seats selected
    expect(screen.getByText("Selecciona asientos para continuar")).toBeInTheDocument()

    // Click on an available seat
    const availableSeat = screen.getAllByText("1")[0]
    fireEvent.click(availableSeat)

    // Check if seat is selected and total is updated
    expect(screen.getByText("Fila A, Asiento 1")).toBeInTheDocument()
    expect(screen.getByText("$50")).toBeInTheDocument()
  })

  it("prevents selecting unavailable seats", () => {
    render(<SeatSelector eventId="event1" seats={mockSeats} userId="user1" />)

    // Try to click on a sold seat
    const soldSeat = screen.getByText("3")
    fireEvent.click(soldSeat)

    // Check that no seats are selected
    expect(screen.getByText("Selecciona asientos para continuar")).toBeInTheDocument()
  })

  it("processes checkout when seats are selected", async () => {
    // Mock successful seat reservation and ticket creation
    ;(updateSeatStatus as jest.Mock).mockResolvedValue(true)
    ;(createTicket as jest.Mock).mockResolvedValue({ id: "ticket1" })

    const mockRouter = { push: jest.fn() }
    jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue(mockRouter)

    render(<SeatSelector eventId="event1" seats={mockSeats} userId="user1" />)

    // Select a seat
    const availableSeat = screen.getAllByText("1")[0]
    fireEvent.click(availableSeat)

    // Click checkout button
    fireEvent.click(screen.getByText("Proceder al Pago"))

    await waitFor(() => {
      // Check if seat status was updated
      expect(updateSeatStatus).toHaveBeenCalledWith("seat1", "reserved")

      // Check if ticket was created
      expect(createTicket).toHaveBeenCalledWith({
        user_id: "user1",
        event_id: "event1",
        seat_id: "seat1",
        purchase_date: expect.any(String),
        status: "reserved",
      })

      // Check if redirected to checkout
      expect(mockRouter.push).toHaveBeenCalledWith("/checkout?seats=seat1&event=event1")
    })
  })

  it("shows timer countdown", () => {
    render(<SeatSelector eventId="event1" seats={mockSeats} userId="user1" />)

    // Initial time should be 10:00
    expect(screen.getByText("Tiempo restante para completar su selección: 10:00")).toBeInTheDocument()

    // Advance timer by 1 second
    jest.advanceTimersByTime(1000)

    // Time should now be 9:59
    expect(screen.getByText("Tiempo restante para completar su selección: 9:59")).toBeInTheDocument()
  })
})
