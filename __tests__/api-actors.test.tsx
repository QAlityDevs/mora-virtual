import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GET, POST } from "@/app/api/actors/route";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, opts) => ({ data, ...(opts || {}) })),
  },
}));

const mockSelect = jest.fn().mockReturnThis();
const mockOrder = jest.fn().mockResolvedValue({ data: null, error: null });
const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });

const mockTableInstance = {
  select: mockSelect,
  order: mockOrder,
  insert: mockInsert,
};

const mockFrom = jest.fn().mockReturnValue(mockTableInstance);

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
  })),
}));

describe("api/actors", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockSelect.mockReturnThis();
    mockOrder.mockResolvedValue({ data: null, error: null });
    mockInsert.mockResolvedValue({ data: null, error: null });
  });

  it("(GET) returns actors on success", async () => {
    mockOrder.mockResolvedValueOnce({
      data: [{ id: 1, name: "actor", bio: "bio" }],
      error: null,
    });

    await GET();

    expect(createClient).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith("actors");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockOrder).toHaveBeenCalledWith("name");
    expect(NextResponse.json).toHaveBeenCalledWith([
      { id: 1, name: "actor", bio: "bio" },
    ]);
  });

  it("(GET) returns 500 on Supabase error", async () => {
    mockOrder.mockResolvedValueOnce({
      data: null,
      error: { message: "DB error" },
    });

    const res = await GET();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Error fetching actors." },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("(POST) returns 400 if name or bio is missing", async () => {
    const req = {
      json: jest.fn().mockResolvedValue({ name: "", bio: "" }),
    } as any;

    const response = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Name and bio are required." },
      { status: 400 }
    );
    expect(response.status).toBe(400);
  });

  it("(POST) returns 201 and new actor on success", async () => {
    const actorData = {
      name: "actor",
      bio: "bio",
      photo_url: "http://example.cl",
    };

    mockInsert.mockResolvedValueOnce({
      data: [{ id: 2, ...actorData }],
      error: null,
    });

    const req = {
      json: jest.fn().mockResolvedValue(actorData),
    } as any;

    const response = await POST(req);

    expect(mockInsert).toHaveBeenCalledWith([
      {
        name: "actor",
        bio: "bio",
        photo_url: "http://example.cl",
      },
    ]);
    expect(NextResponse.json).toHaveBeenCalledWith([{ id: 2, ...actorData }], {
      status: 201,
    });
    expect(response.status).toBe(201);
  });

  it("(POST) returns 500 if Supabase insert fails", async () => {
    const req = {
      json: jest.fn().mockResolvedValue({
        name: "Bad actor",
        bio: "Bad bio",
      }),
    } as any;

    mockInsert.mockResolvedValueOnce({
      data: null,
      error: { message: "Insert error" },
    });

    const response = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Error creating the actor." },
      { status: 500 }
    );
    expect(response.status).toBe(500);
  });
});
