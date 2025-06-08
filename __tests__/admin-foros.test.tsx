import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

import ForosPage from "@/app/admin/foros/page";
import { EventForum } from "@/components/events/event-forum";
import { getUser } from "@/lib/auth";
import { createForumPost, getEventForumPosts } from "@/lib/data-service";

jest.mock("@/lib/auth", () => ({ getUser: jest.fn() }));
jest.mock("@/lib/data-service", () => ({
  getEventForumPosts: jest.fn(),
  createForumPost: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

global.fetch = jest.fn();
const mockLocalStorage = { getItem: jest.fn() };
Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

type ForumPost = {
  id: string;
  content: string;
  created_at: string;
  user: { id: string; name: string; role: string; avatar_url?: string };
  event?: { id: string; name: string };
  event_id?: string;
  replies?: ForumPost[];
};

const mockPosts: ForumPost[] = [
  {
    id: "1",
    content: "Test post 1",
    created_at: "2023-01-01T00:00:00Z",
    user: { id: "u1", name: "User 1", role: "actor" },
    event: { id: "e1", name: "Event 1" },
  },
  {
    id: "2",
    content: "Test post 2",
    created_at: "2023-01-02T00:00:00Z",
    user: { id: "u2", name: "User 2", role: "user" },
    event: { id: "e1", name: "Event 1" },
  },
];

const mockNestedPosts: ForumPost[] = [
  {
    id: "1",
    content: "Main post",
    created_at: new Date().toISOString(),
    user: { id: "u1", name: "User", role: "actor", avatar_url: "avatar1.jpg" },
    event_id: "e1",
    replies: [
      {
        id: "2",
        content: "Reply post",
        created_at: new Date().toISOString(),
        user: {
          id: "u2",
          name: "User2",
          role: "user",
          avatar_url: "avatar2.jpg",
        },
        event_id: "e1",
        replies: [],
      },
    ],
  },
];

describe("Admin ForosPage", () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockReturnValue("fake-token");
    (fetch as jest.Mock).mockReset();
  });

  it("handles fetch error", async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error("Fetch error"));
    render(<ForosPage />);
    await waitFor(() => {
      const alert = screen.getByRole("alert");

      expect(alert).toBeInTheDocument();
    });
  });

  it("displays grouped posts", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPosts),
    });
    render(<ForosPage />);

    await waitFor(() => {
      expect(screen.getByText("Event 1")).toBeInTheDocument();
      expect(screen.getByText("Test post 1")).toBeInTheDocument();
      expect(screen.getByText("Actor")).toBeInTheDocument();
    });
  });

  it("filters posts via search", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPosts),
    });
    render(<ForosPage />);
    await screen.findByText("Test post 1");

    fireEvent.change(screen.getByPlaceholderText("Buscar mensajes..."), {
      target: { value: "Actor" },
    });

    await waitFor(() => {
      expect(screen.getByText("User 1")).toBeInTheDocument();
      expect(screen.queryByText("User 2")).not.toBeInTheDocument();
    });
  });

  it("deletes a post", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      })
      .mockResolvedValueOnce({ ok: true });

    render(<ForosPage />);
    await screen.findByText("Test post 1");

    window.confirm = jest.fn().mockReturnValue(true);
    fireEvent.click(screen.getAllByText("Eliminar")[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/admin/forum/posts/1",
        expect.objectContaining({
          method: "DELETE",
          headers: {
            Authorization: "Bearer fake-token",
          },
        })
      );
    });
  });

  it("renders no posts if forum is empty", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<ForosPage />);

    const rows = screen.queryAllByRole("row");
    expect(rows.length).toBeLessThanOrEqual(1);
  });

  it("does not delete post if user cancels confirmation", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPosts),
    });
    render(<ForosPage />);
    await screen.findByText("Test post 1");

    window.confirm = jest.fn().mockReturnValue(false);
    fireEvent.click(screen.getAllByText("Eliminar")[0]);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("shows error if delete fails", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      })
      .mockResolvedValueOnce({ ok: false, statusText: "Delete failed" });

    render(<ForosPage />);
    await screen.findByText("Test post 1");

    window.confirm = jest.fn().mockReturnValue(true);
    fireEvent.click(screen.getAllByText("Eliminar")[0]);

    expect(
      await screen.findByText(/Error al eliminar el mensaje/)
    ).toBeInTheDocument();
  });

  it("search is case-insensitive", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPosts),
    });
    render(<ForosPage />);
    await screen.findByText("Test post 1");

    fireEvent.change(screen.getByPlaceholderText("Buscar mensajes..."), {
      target: { value: "user 1" },
    });

    await waitFor(() => {
      expect(screen.getByText("User 1")).toBeInTheDocument();
      expect(screen.queryByText("User 2")).not.toBeInTheDocument();
    });
  });
});

describe("EventForum", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUser as jest.Mock).mockResolvedValue({ id: "u1", name: "Test User" });
  });

  it("shows login prompt for unauthenticated users", async () => {
    (getUser as jest.Mock).mockResolvedValue(null);
    (getEventForumPosts as jest.Mock).mockResolvedValue([]);

    render(<EventForum eventId="e1" />);

    expect(
      await screen.findByText(
        /No hay mensajes en el foro. ¡Sé el primero en comentar!/
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Debes iniciar sesión para participar en el foro/)
    ).toBeInTheDocument();
  });

  it("submits new post", async () => {
    (getUser as jest.Mock).mockResolvedValue({ id: "u1" });
    (getEventForumPosts as jest.Mock).mockResolvedValue([]);
    render(<EventForum eventId="e1" />);

    const input = await screen.findByPlaceholderText("Escribe tu mensaje...");
    fireEvent.change(input, { target: { value: "New" } });
    fireEvent.click(screen.getByText("Enviar Mensaje"));

    await waitFor(() => {
      expect(createForumPost).toHaveBeenCalledWith(
        expect.objectContaining({ content: "New", event_id: "e1" })
      );
    });
  });

  it("renders nested replies", async () => {
    (getUser as jest.Mock).mockResolvedValue({ id: "u1" });
    (getEventForumPosts as jest.Mock).mockResolvedValue(mockNestedPosts);
    render(<EventForum eventId="e1" />);

    expect(await screen.findByText("Main post")).toBeInTheDocument();
    expect(await screen.findByText("Reply post")).toBeInTheDocument();
  });

  it("handles reply functionality", async () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    (getUser as jest.Mock).mockResolvedValue({
      id: "u1",
      name: "Test User",
      avatar_url: "avatar.jpg",
    });
    (getEventForumPosts as jest.Mock).mockResolvedValue(mockNestedPosts);
    render(<EventForum eventId="e1" />);

    await screen.findByText("Main post");
    fireEvent.click(screen.getAllByText("Responder")[0]);

    expect(screen.getByText("Respondiendo a un mensaje")).toBeInTheDocument();

    const replyInput = screen.getByPlaceholderText("Escribe tu mensaje...");
    fireEvent.change(replyInput, { target: { value: "Test reply" } });
    await userEvent.click(screen.getByText("Enviar Mensaje"));

    await waitFor(() => {
      expect(createForumPost).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "Test reply",
          event_id: "e1",
          parent_id: "1",
        })
      );
    });
  });

  it("shows actor badge for actor users", async () => {
    (getUser as jest.Mock).mockResolvedValue({
      id: "u1",
      name: "Test User",
      role: "actor",
    });
    (getEventForumPosts as jest.Mock).mockResolvedValue(mockNestedPosts);
    render(<EventForum eventId="e1" />);

    expect((await screen.findAllByText("Actor")).length).toBeGreaterThan(0);
  });

  it("disables send button when input is empty", async () => {
    (getEventForumPosts as jest.Mock).mockResolvedValue([]);
    render(<EventForum eventId="e1" />);
    await screen.findByPlaceholderText("Escribe tu mensaje...");
    expect(screen.getByText("Enviar Mensaje")).toBeDisabled();
  });

  it("shows error if post creation fails", async () => {
    (getEventForumPosts as jest.Mock).mockResolvedValue([]);
    (createForumPost as jest.Mock).mockRejectedValue(
      new Error("Create failed")
    );
    render(<EventForum eventId="e1" />);

    const input = await screen.findByPlaceholderText("Escribe tu mensaje...");
    fireEvent.change(input, { target: { value: "Hola" } });
    fireEvent.click(screen.getByText("Enviar Mensaje"));

    expect(await screen.findByText(/Create failed/)).toBeInTheDocument();
  });

  it("clears input after successful post", async () => {
    (getEventForumPosts as jest.Mock).mockResolvedValue([]);
    (createForumPost as jest.Mock).mockResolvedValue({});
    render(<EventForum eventId="e1" />);

    const input = await screen.findByPlaceholderText("Escribe tu mensaje...");
    fireEvent.change(input, { target: { value: "Hola" } });
    fireEvent.click(screen.getByText("Enviar Mensaje"));

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("shows loading indicator while fetching posts", async () => {
    (getEventForumPosts as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );
    render(<EventForum eventId="e1" />);
    expect(
      await screen.findByText(/Cargando mensajes del foro/)
    ).toBeInTheDocument();
  });
});
