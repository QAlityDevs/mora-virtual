import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { AuthForm } from "@/components/auth/auth-form"
import { signIn, signUp } from "@/lib/auth"

// Mock the auth functions
jest.mock("@/lib/auth", () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  getUser: jest.fn(),
}))

// Mock the next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

describe("AuthForm", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders login and register tabs", () => {
    render(<AuthForm />)

    expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument()
    expect(screen.getByText("Registrarse")).toBeInTheDocument()
  })

  it("handles login submission", async () => {
    // Mock successful login
    ;(signIn as jest.Mock).mockResolvedValue({ error: null })

    render(<AuthForm />)

    // Fill in login form
    fireEvent.change(screen.getByPlaceholderText("tu@email.com"), {
      target: { value: "test@example.com" },
    })

    fireEvent.change(screen.getAllByLabelText(/Contraseña/i)[0], {
      target: { value: "password123" },
    })

    // Submit form
    fireEvent.click(screen.getByText("Iniciar Sesión"))

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("test@example.com", "password123")
    })
  })

  it("handles registration submission", async () => {
    // Mock successful registration
    ;(signUp as jest.Mock)
      .mockResolvedValue({ error: null })(signIn as jest.Mock)
      .mockResolvedValue({ error: null })

    render(<AuthForm />)

    // Switch to register tab
    fireEvent.click(screen.getByText("Registrarse"))

    // Fill in registration form
    fireEvent.change(screen.getByPlaceholderText("Tu nombre"), {
      target: { value: "Test User" },
    })

    fireEvent.change(screen.getByPlaceholderText("tu@email.com"), {
      target: { value: "test@example.com" },
    })

    fireEvent.change(screen.getAllByLabelText(/Contraseña/i)[1], {
      target: { value: "password123" },
    })

    // Submit form
    fireEvent.click(screen.getByText("Registrarse"))

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith("test@example.com", "password123", { name: "Test User" })
    })
  })

  it("displays error message on login failure", async () => {
    // Mock failed login
    ;(signIn as jest.Mock).mockResolvedValue({
      error: { message: "Invalid credentials" },
    })

    render(<AuthForm />)

    // Fill in login form
    fireEvent.change(screen.getByPlaceholderText("tu@email.com"), {
      target: { value: "test@example.com" },
    })

    fireEvent.change(screen.getAllByLabelText(/Contraseña/i)[0], {
      target: { value: "wrong-password" },
    })

    // Submit form
    fireEvent.click(screen.getByText("Iniciar Sesión"))

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
    })
  })
})
