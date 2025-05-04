import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "../components/auth/auth-form";
import { signIn, signUp } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// Mock the auth functions
jest.mock("@/lib/auth", () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  getUser: jest.fn(),
}));

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock the supabase client
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
  },
}));

describe("AuthForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Sign In Tab", () => {
    it("submits the form and calls signIn with email and password", async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockResolvedValueOnce({ error: null });

      render(<AuthForm />);

      await user.type(
        screen.getByLabelText("Correo Electrónico"),
        "test@example.com"
      );
      await user.type(screen.getByLabelText("Contraseña"), "password");

      await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

      expect(signIn).toHaveBeenCalledWith("test@example.com", "password");

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it("displays an error message when signIn fails", async () => {
      const user = userEvent.setup();

      render(<AuthForm />);

      await user.type(
        screen.getByLabelText("Correo Electrónico"),
        "test@example.com"
      );
      await user.type(screen.getByLabelText("Contraseña"), "wrongpass");
      await user.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

      await waitFor(() => {
        const alert = screen.getByRole("alert");

        expect(alert).toBeInTheDocument();
      });
    });
  });

  describe("Sign Up Tab", () => {
    it("submits the form, calls signUp, and auto signs in", async () => {
      const user = userEvent.setup();
      (signUp as jest.Mock).mockResolvedValueOnce({ error: null });
      (signIn as jest.Mock).mockResolvedValueOnce({ error: null });

      render(<AuthForm />);

      await user.click(screen.getByRole("tab", { name: "Registrarse" }));

      await user.type(
        screen.getByLabelText("Nombre Completo"),
        "Usuario Prueba"
      );
      await user.type(
        screen.getByLabelText("Correo Electrónico"),
        "test@example.com"
      );
      await user.type(screen.getByLabelText("Contraseña"), "password");

      await user.click(screen.getByRole("button", { name: "Registrarse" }));

      expect(signUp).toHaveBeenCalledWith("test@example.com", "password", {
        name: "Usuario Prueba",
      });

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith("test@example.com", "password");
      });

      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("displays an error message when signUp fails", async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      await user.click(screen.getByRole("tab", { name: "Registrarse" }));
      await user.type(
        screen.getByLabelText("Nombre Completo"),
        "Usuario Prueba"
      );
      await user.type(
        screen.getByLabelText("Correo Electrónico"),
        "test@example.com"
      );
      await user.type(screen.getByLabelText("Contraseña"), "password");
      await user.click(screen.getByRole("button", { name: "Registrarse" }));

      await waitFor(() => {
        const alert = screen.getByRole("alert");

        expect(alert).toBeInTheDocument();
      });
    });
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    let resolveSignIn: () => void;

    (signIn as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSignIn = () => resolve({ error: null });
        })
    );

    render(<AuthForm />);

    await user.type(
      screen.getByLabelText("Correo Electrónico"),
      "test@example.com"
    );
    await user.type(screen.getByLabelText("Contraseña"), "password");
    const submitButton = screen.getByRole("button", { name: "Iniciar Sesión" });

    await user.click(submitButton);
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Iniciando sesión...");

    act(() => resolveSignIn());
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
