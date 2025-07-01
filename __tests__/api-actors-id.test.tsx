import { NextResponse } from "next/server";
import { GET, PUT, DELETE } from "@/app/api/actors/[id]/route";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, opts) => ({
      json: data,
      status: opts?.status || 200,
    })),
  },
}));

const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockUpdate = jest.fn();

let selectReturnValue: any = {};
let deleteReturnValue: any = {};

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: () => ({
      select: () => ({
        eq: (...eqArgs: any[]) => {
          mockEq(...eqArgs);
          return {
            ...(selectReturnValue || {}),
            single: mockSingle,
          };
        },
      }),
      update: (...updateArgs: any[]) => {
        mockUpdate(...updateArgs);
        return {
          eq: (...eqArgs: any[]) => {
            mockEq(...eqArgs);
            return {
              select: () => ({
                single: mockSingle,
              }),
            };
          },
        };
      },
      delete: () => ({
        eq: (...eqArgs: any[]) => {
          mockEq(...eqArgs);
          return {
            single: () => deleteReturnValue,
          };
        },
      }),
    }),
  })),
}));

describe("api/actors/[id]", () => {
  const mockContext = { params: { id: "1" } };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSelect.mockReturnThis();
    mockEq.mockReturnThis();
    selectReturnValue = {};
    deleteReturnValue = {};
  });

  it("(GET) returns actor when found", async () => {
    mockSingle.mockResolvedValue({
      data: { id: 1, name: "Actor", bio: "Bio" },
      error: null,
    });

    const response = await GET({} as Request, mockContext);

    expect(mockEq).toHaveBeenCalledWith("id", "1");
    expect(response.json).toEqual({ id: 1, name: "Actor", bio: "Bio" });
    expect(response.status).toBe(200);
  });

  it("(GET) returns 404 when actor not found", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "Not found" },
    });

    const response = await GET({} as Request, mockContext);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Actor not found." },
      { status: 404 }
    );
    expect(response.status).toBe(404);
  });

  const mockRequest = (body: any) =>
    ({
      json: () => Promise.resolve(body),
    } as Request);

  it("(PUT) returns 400 if name or bio is missing", async () => {
    const req = mockRequest({ name: "", bio: "" });
    const response = await PUT(req, mockContext);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Name and bio are required." },
      { status: 400 }
    );
    expect(response.status).toBe(400);
  });

  it("(PUT) updates actor successfully", async () => {
    const updateData = {
      name: "Updated",
      bio: "New bio",
      photo_url: "new.jpg",
    };
    mockSingle.mockResolvedValue({
      data: { id: 1, ...updateData },
      error: null,
    });

    const req = mockRequest(updateData);
    const response = await PUT(req, mockContext);

    expect(mockUpdate).toHaveBeenCalledWith({
      name: "Updated",
      bio: "New bio",
      photo_url: "new.jpg",
    });
    expect(mockEq).toHaveBeenCalledWith("id", "1");
    expect(response.json).toEqual({ id: 1, ...updateData });
    expect(response.status).toBe(200);
  });

  it("(PUT) returns 500 on update error", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    });

    const req = mockRequest({ name: "Error", bio: "Bio" });
    const response = await PUT(req, mockContext);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Error updating the actor." },
      { status: 500 }
    );
    expect(response.status).toBe(500);
  });

  it("(DELETE) deletes actor successfully", async () => {
    selectReturnValue = { count: 1 };
    deleteReturnValue = { error: null };

    const response = await DELETE({} as Request, mockContext);

    expect(response.json).toEqual({ message: "Actor deleted successfully." });
    expect(response.status).toBe(200);
  });

  it("(DELETE) returns 404 if actor not found", async () => {
    selectReturnValue = { count: 0 };

    const response = await DELETE({} as Request, mockContext);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Actor not found" },
      { status: 404 }
    );
    expect(response.status).toBe(404);
  });

  it("(DELETE) returns 500 on deletion error", async () => {
    selectReturnValue = { count: 1 };
    deleteReturnValue = { error: { message: "Delete failed" } };

    const response = await DELETE({} as Request, mockContext);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Error deleting the actor." },
      { status: 500 }
    );
    expect(response.status).toBe(500);
  });
});
