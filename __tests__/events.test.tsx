import { render, screen } from "@testing-library/react"
import EventosPage from "@/app/eventos/page"
import { getEvents } from "@/lib/data-service"

// Mock the data service
jest.mock("@/lib/data-service", () => ({
  getEvents: jest.fn(),
}))

describe("EventosPage", () => {
  it("renders events when data is available", async () => {
    // Mock event data
    const mockEvents = [
      {
        id: "1",
        name: "Test Event 1",
        description: "Test description 1",
        date: "2023-12-15",
        time: "19:00",
        image_url: "/test1.jpg",
        sale_start_time: "2023-12-10T18:00:00",
        status: "upcoming",
      },
      {
        id: "2",
        name: "Test Event 2",
        description: "Test description 2",
        date: "2023-12-20",
        time: "20:00",
        image_url: "/test2.jpg",
        sale_start_time: "2023-12-15T18:00:00",
        status: "upcoming",
      },
    ]

    // Set up the mock implementation
    ;(getEvents as jest.Mock).mockResolvedValue(mockEvents)

    render(await EventosPage())

    // Check if events are rendered
    expect(screen.getByText("Test Event 1")).toBeInTheDocument()
    expect(screen.getByText("Test Event 2")).toBeInTheDocument()
  })

  it("renders empty state when no events are available", async () => {
    // Mock empty events array
    ;(getEvents as jest.Mock).mockResolvedValue([])

    render(await EventosPage())

    // Check if empty state message is rendered
    expect(screen.getByText("No hay eventos disponibles en este momento.")).toBeInTheDocument()
  })
})
