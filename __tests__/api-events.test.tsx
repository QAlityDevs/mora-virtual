import { GET, POST } from "@/app/api/events/route";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

import { EventSchema } from "@/schemas/events";

jest.mock("@/lib/supabase/server");
jest.mock("next/server", () => ({
  NextResponse: { json: jest.fn() },
}));

const mockRequest = (body: any) =>
  ({
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Request);

describe("/api/events", () => {
  const mockSelect = jest.fn();
  const mockOrder = jest.fn();
  const mockFrom = jest.fn();

  let safeParseSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    safeParseSpy = jest.spyOn(EventSchema, "safeParse").mockReturnValue({
      success: true,
      data: {
        name: "EvenT",
        description: "Description",
        date: "2025-06-22",
        time: "12:00",
        sale_start_time: "2025-06-22T11:00",
        status: "upcoming",
        image_url: "https://example.com/image.jpg",
      },
    });

    mockOrder.mockReturnThis();
    mockSelect.mockReturnValue({ order: mockOrder });
    mockFrom.mockReturnValue({ select: mockSelect });

    (createClient as jest.Mock).mockResolvedValue({
      from: () => ({
        select: () => ({
          order: () => ({
            data: [{ id: 1, name: "Event 1" }],
            error: null,
          }),
        }),
      }),
    });
  });

  afterEach(() => {
    safeParseSpy.mockRestore();
  });

  it("(GET) returns events when supabase succeeds", async () => {
    const events = [{ id: 1, name: "Event 1" }];
    (createClient as jest.Mock).mockResolvedValue({
      from: () => ({
        select: () => ({
          order: () => ({
            data: events,
            error: null,
          }),
        }),
      }),
    });

    const jsonMock = NextResponse.json as jest.Mock;
    await GET();

    expect(jsonMock).toHaveBeenCalledWith(events);
  });

  it("(GET) returns 500 when supabase returns error", async () => {
    (createClient as jest.Mock).mockResolvedValue({
      from: () => ({
        select: () => ({
          order: () => ({
            data: null,
            error: { message: "Some error" },
          }),
        }),
      }),
    });

    const jsonMock = NextResponse.json as jest.Mock;
    await GET();

    expect(jsonMock).toHaveBeenCalledWith(
      { error: "Error al obtener los eventos" },
      { status: 500 }
    );
  });

  it("(POST) returns 401 if user is not authenticated", async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    await POST(mockRequest({}));

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "No autorizado" },
      { status: 401 }
    );
  });

  it("(POST) returns 401 if auth error", async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "fail" },
        }),
      },
    });

    await POST(mockRequest({}));

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "No autorizado" },
      { status: 401 }
    );
  });

  it("(POST) returns 400 if validation fails", async () => {
    safeParseSpy.mockReturnValue({
      success: false,
      error: { errors: [{ message: "Invalid data" }] },
    });

    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: 1 } }, error: null }),
      },
    });

    await POST(mockRequest({}));

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: ["Invalid data"] },
      { status: 400 }
    );
  });

  it("(POST) returns 500 if supabase insert fails", async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: 1 } }, error: null }),
      },
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Insert error" },
            }),
          }),
        }),
      }),
    });
    safeParseSpy.mockReturnValue({ success: true });

    await POST(mockRequest({}));

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Insert error" },
      { status: 500 }
    );
  });

  it("(POST) returns 201 if event is created", async () => {
    const newEvent = { id: 1, name: "Test" };
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: 1 } }, error: null }),
      },
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: newEvent,
              error: null,
            }),
          }),
        }),
      }),
    });
    safeParseSpy.mockReturnValue({ success: true });

    await POST(mockRequest({ name: "Test" }));

    expect(NextResponse.json).toHaveBeenCalledWith(newEvent, { status: 201 });
  });

  it("(POST) returns 500 on unexpected error", async () => {
    (createClient as jest.Mock).mockImplementation(() => {
      throw new Error("fail");
    });

    await POST(mockRequest({}));

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  });
});
