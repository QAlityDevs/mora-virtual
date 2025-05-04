import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ActoresPage from "@/app/admin/actores/page";
import EditarActorPage from "@/app/admin/actores/[id]/page";

jest.mock("@/components/admin/actor-form", () => ({
  ActorForm: jest.fn((props) => <div>Mock Actor Form</div>),
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe("ActoresPage", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    Storage.prototype.getItem = jest.fn(() => "fake-token");
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("displays actors after successful fetch", async () => {
    const mockActors = [
      { id: "1", name: "Actor 1", bio: "Bio 1" },
      { id: "2", name: "Actor 2", bio: "Bio 2" },
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockActors),
    });

    render(<ActoresPage />);

    expect(await screen.findByText("Actor 1")).toBeInTheDocument();
    expect(screen.getByText("Actor 2")).toBeInTheDocument();
  });

  it("shows error when fetching actors fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Fetch error"));

    render(<ActoresPage />);

    await waitFor(() => {
      const alert = screen.getByRole("alert");

      expect(alert).toBeInTheDocument();
    });
  });

  it("filters actors using search input", async () => {
    const mockActors = [
      { id: "1", name: "Actor 1", bio: "Bio 1" },
      { id: "2", name: "Actor 2", bio: "Bio 2" },
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockActors),
    });

    render(<ActoresPage />);
    await screen.findByText("Actor 1");

    const searchInput = screen.getByPlaceholderText("Buscar actores...");

    await userEvent.type(searchInput, "Actor 1");

    await waitFor(() => {
      expect(screen.getByText("Actor 1")).toBeInTheDocument();
      expect(screen.queryByText("Actor 2")).not.toBeInTheDocument();
    });
  });

  it("navigates to add actor page", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    render(<ActoresPage />);

    await userEvent.click(screen.getByText("Agregar Actor"));
    expect(mockPush).toHaveBeenCalledWith("/admin/actores/nuevo");
  });

  it("navigates to edit actor page", async () => {
    const mockActor = { id: "1", name: "Actor 1", bio: "Bio" };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockActor]),
    });
    render(<ActoresPage />);

    await userEvent.click(await screen.findByText("Editar"));
    expect(mockPush).toHaveBeenCalledWith("/admin/actores/1");
  });

  it("deletes actor and refreshes page", async () => {
    const mockActor = { id: "1", name: "Actor 1", bio: "Bio" };
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockActor]),
      })
      .mockResolvedValueOnce({ ok: true });

    render(<ActoresPage />);
    await screen.findByText("Actor 1");

    userEvent.click(screen.getByText("Eliminar"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/actors/1", {
        method: "DELETE",
        headers: { Authorization: "Bearer fake-token" },
      });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows error on delete failure", async () => {
    const mockActor = { id: "1", name: "Actor 1", bio: "Bio" };
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockActor]),
      })
      .mockRejectedValueOnce(new Error("Delete error"));

    render(<ActoresPage />);

    const deleteButton = await screen.findByText("Eliminar");
    await userEvent.click(deleteButton);

    await waitFor(() => {
      const alert = screen.getByRole("alert");

      expect(alert).toBeInTheDocument();
    });
  });
});

describe("EditarActorPage", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    Storage.prototype.getItem = jest.fn(() => "fake-token");
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("displays loading state while fetching", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() => new Promise(() => {}));

    render(<EditarActorPage params={{ id: "123" }} />);
    expect(screen.getByText("Cargando datos del actor...")).toBeInTheDocument();
  });

  it("displays error on fetch failure", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<EditarActorPage params={{ id: "123" }} />);
    expect(await screen.findByText(/Error: Network error/)).toBeInTheDocument();
  });

  it("uses URL parameter in API call", async () => {
    const mockFetch = (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "123", name: "Test Actor" }),
    });

    render(<EditarActorPage params={{ id: "123" }} />);
    await screen.findByText("Mock Actor Form");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/actors/123",
      expect.anything()
    );
  });

  it("includes authorization token", async () => {
    const mockToken = "fake-token";
    Storage.prototype.getItem = jest.fn().mockReturnValue(mockToken);
    const mockFetch = (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "123", name: "Test Actor" }),
    });

    render(<EditarActorPage params={{ id: "123" }} />);
    await screen.findByText("Mock Actor Form");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      })
    );
  });

  it("handles API error responses", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<EditarActorPage params={{ id: "123" }} />);
    expect(
      await screen.findByText(/Error: Error al obtener los datos del actor/)
    ).toBeInTheDocument();
  });
});
