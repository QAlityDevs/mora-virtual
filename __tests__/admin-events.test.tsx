import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EventosPage from "@/app/admin/eventos/page";
import EditarEventoPage from "@/app/admin/eventos/[id]/page";
import { EventForm } from "@/components/admin/event-form";
import { useParams, useRouter } from "next/navigation";

type Event = {
  id: string;
  name: string;
  date: string;
  status: "upcoming" | "active" | "completed";
  actors: Actor[];
};

type Actor = {
  id: string;
  name: string;
  bio: string;
  photo_url?: string;
};

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock("@/components/admin/event-form", () => ({
  EventForm: jest.fn(() => <div>EventForm Mock</div>),
}));

global.fetch = jest.fn();
Storage.prototype.getItem = jest.fn();

describe("EventosPage", () => {
  const mockRouter = {
    push: jest.fn(),
  };
  const mockEvents: Event[] = [
    {
      id: "1",
      name: "Concierto de Rock",
      date: "2024-03-20",
      status: "active",
      actors: [],
    },
    {
      id: "2",
      name: "Teatro Clásico",
      date: "2023-12-15",
      status: "upcoming",
      actors: [],
    },
  ];

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (fetch as jest.Mock).mockClear();
    mockRouter.push.mockClear();
  });

  it("shows error when fetching events fails", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Error"));

    render(<EventosPage />);

    await waitFor(() => {
      const alert = screen.getByRole("alert");

      expect(alert).toBeInTheDocument();
    });
  });

  it("filters events correctly", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEvents,
    });

    render(<EventosPage />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Buscar eventos...");
      fireEvent.change(searchInput, { target: { value: "Rock" } });

      expect(screen.getByText("Concierto de Rock")).toBeInTheDocument();
      expect(screen.queryByText("Teatro Clásico")).not.toBeInTheDocument();
    });
  });

  it("deletes event correctly", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockEvents })
      .mockResolvedValueOnce({ ok: true });

    window.confirm = jest.fn().mockReturnValue(true);

    render(<EventosPage />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText("Eliminar");
      fireEvent.click(deleteButtons[0]);
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/events/1",
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });

  it("shows states correctly", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEvents,
    });

    render(<EventosPage />);

    await waitFor(() => {
      expect(screen.getByText("Activo")).toBeInTheDocument();
      expect(screen.getByText("Próximo")).toBeInTheDocument();
    });
  });

  it("navigates to edit and creation correctly", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEvents,
    });

    render(<EventosPage />);

    await waitFor(() => {
      fireEvent.click(screen.getByText("Nuevo Evento"));
      expect(mockRouter.push).toHaveBeenCalledWith("/admin/eventos/nuevo");

      const editButtons = screen.getAllByText("Editar");
      fireEvent.click(editButtons[0]);
      expect(mockRouter.push).toHaveBeenCalledWith("/admin/eventos/1");
    });
  });

  it("shows message when there is no events", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<EventosPage />);

    await waitFor(() => {
      expect(
        screen.getByText("No se encontraron eventos.")
      ).toBeInTheDocument();
    });
  });

  it("shows spanish dates correctly", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockEvents[1]],
    });

    render(<EventosPage />);

    await waitFor(() => {
      expect(screen.getByText("14 de diciembre de 2023")).toBeInTheDocument();
    });
  });
});

describe("EditarEventoPage", () => {
  const mockEvent = {
    id: "1",
    name: "Test Event",
    sale_start_time: "2024-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue({ id: "1" });
    (Storage.prototype.getItem as jest.Mock).mockReturnValue("fake-token");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading state", () => {
    render(<EditarEventoPage />);
    expect(screen.getByText("Cargando evento...")).toBeInTheDocument();
  });

  test("handles fetch error", async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
    render(<EditarEventoPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  test("displays event form on successful fetch", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => mockEvent,
    });

    render(<EditarEventoPage />);

    await waitFor(() => {
      // avoid undefined check
      const firstCallArgs = (EventForm as jest.Mock).mock.calls[0];
      expect(firstCallArgs[0]).toEqual(
        expect.objectContaining({
          event: {
            ...mockEvent,
            sale_start_time: "2024-01-01T00:00",
          },
          isEditing: true,
        })
      );
    });
  });
});
