import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { JoinQueueButton } from "@/components/events/join-queue-button"
import { joinQueue } from "@/lib/queue-service"
import { getUser } from "@/lib/auth"

// Mock the queue service and auth
jest.mock("@/lib/queue-service", () => ({
  joinQueue: jest.fn(),
}))

jest.mock("@/lib/auth", () => ({
  getUser: jest.fn(),
}))

// Mock the next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe("JoinQueueButton", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders inactive state when queue is not active", () => {
    render(<JoinQueueButton eventId="123" isQueueActive={false} saleStartTime="2023-12-31T23:59:59" />)

    // Check if inactive message is displayed
    expect(screen.getByText(/La cola se habilitará en/)).toBeInTheDocument()
  })

  it("renders active button when queue is active", () => {
    render(<JoinQueueButton eventId="123" isQueueActive={true} saleStartTime="2023-01-01T00:00:00" />)

    // Check if join button is displayed
    expect(screen.getByText("Unirse a la Cola Virtual")).toBeInTheDocument()
  })

  it("redirects to auth when user is not logged in", async () => {
    // Mock user not logged in
    ;(getUser as jest.Mock).mockResolvedValue(null)

    const mockRouter = { push: jest.fn() }
    jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue(mockRouter)

    render(<JoinQueueButton eventId="123" isQueueActive={true} saleStartTime="2023-01-01T00:00:00" />)

    // Click join button
    fireEvent.click(screen.getByText("Unirse a la Cola Virtual"))

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/auth?redirect=/eventos/123")
    })
  })

  it("joins queue when user is logged in", async () => {
    // Mock logged in user
    ;(getUser as jest.Mock)
      .mockResolvedValue({ id: "user123" })(
        // Mock successful queue join
        joinQueue as jest.Mock,
      )
      .mockResolvedValue({
        success: true,
        data: { token: "queue-token-123" },
      })

    const mockRouter = { push: jest.fn() }
    jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue(mockRouter)

    render(<JoinQueueButton eventId="123" isQueueActive={true} saleStartTime="2023-01-01T00:00:00" />)

    // Click join button
    fireEvent.click(screen.getByText("Unirse a la Cola Virtual"))

    await waitFor(() => {
      expect(joinQueue).toHaveBeenCalledWith("user123", "123")
      expect(mockRouter.push).toHaveBeenCalledWith("/queue/queue-token-123")
    })
  })

  it("displays error when queue join fails", async () => {
    // Mock logged in user
    ;(getUser as jest.Mock)
      .mockResolvedValue({ id: "user123" })(
        // Mock failed queue join
        joinQueue as jest.Mock,
      )
      .mockResolvedValue({
        success: false,
        error: new Error("Queue join failed"),
      })

    render(<JoinQueueButton eventId="123" isQueueActive={true} saleStartTime="2023-01-01T00:00:00" />)

    // Click join button
    fireEvent.click(screen.getByText("Unirse a la Cola Virtual"))

    await waitFor(() => {
      expect(screen.getByText(/No se pudo unir a la cola/)).toBeInTheDocument()
    })
  })
})
