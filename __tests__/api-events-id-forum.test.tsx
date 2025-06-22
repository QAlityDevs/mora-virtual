import { GET, POST } from "@/app/api/events/[id]/forum/route";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { UUIDSchema } from "@/schemas/events";

import type { NextRequest } from "next/server";

jest.mock("@/lib/supabase/server");
jest.mock("next/server", () => ({
  NextResponse: { json: jest.fn() },
}));

const mockParams = (id: string) => ({ params: { id } });

const mockRequest = (body: any) =>
  ({
    json: jest.fn().mockResolvedValue(body),
    cookies: {},
    nextUrl: {},
    page: {},
    ua: "",
    [Symbol.for("NextRequestInternals")]: {},
  } as unknown as NextRequest);

describe("/api/events/[id]/forum", () => {
  let safeParseSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    safeParseSpy = jest.spyOn(UUIDSchema, "safeParse");
  });

  afterEach(() => {
    safeParseSpy.mockRestore();
  });

  it("(GET) returns 400 if UUID is invalid", async () => {
    (UUIDSchema.safeParse as jest.Mock).mockReturnValue({ success: false });

    await GET({} as any, mockParams("bad-uuid"));

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Invalid event ID" },
      { status: 400 }
    );
  });

  it("(GET) returns forum posts if successful", async () => {
    (UUIDSchema.safeParse as jest.Mock).mockReturnValue({ success: true });
    const posts = [{ id: 1, content: "Hola" }];
    (createClient as jest.Mock).mockResolvedValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              data: posts,
              error: null,
            }),
          }),
        }),
      }),
    });

    await GET({} as any, mockParams("uuid"));

    expect(NextResponse.json).toHaveBeenCalledWith(posts);
  });

  it("(GET) returns 500 if supabase fails", async () => {
    (UUIDSchema.safeParse as jest.Mock).mockReturnValue({ success: true });
    (createClient as jest.Mock).mockResolvedValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              data: null,
              error: { message: "fail" },
            }),
          }),
        }),
      }),
    });

    await GET({} as any, mockParams("good-uuid"));

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Failed to fetch forum posts" },
      { status: 500 }
    );
  });

  it("(POST) returns 400 if missing fields", async () => {
    await POST(mockRequest({}), mockParams("id"));
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Missing required fields" },
      { status: 400 }
    );
  });

  it("(POST) returns 201 if post is created", async () => {
    const post = { id: 1, content: "Hola" };
    (createClient as jest.Mock).mockResolvedValue({
      from: () => ({
        insert: () => ({
          select: () => ({
            data: [post],
            error: null,
          }),
        }),
      }),
    });

    await POST(
      mockRequest({ content: "Hola", userId: "user" }),
      mockParams("event")
    );

    expect(NextResponse.json).toHaveBeenCalledWith(post, { status: 201 });
  });

  it("(POST) returns 500 if supabase insert fails", async () => {
    (createClient as jest.Mock).mockResolvedValue({
      from: () => ({
        insert: () => ({
          select: () => ({
            data: null,
            error: { message: "fail" },
          }),
        }),
      }),
    });

    await POST(
      mockRequest({ content: "Hola", userId: "user" }),
      mockParams("event")
    );

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Failed to create post" },
      { status: 500 }
    );
  });
});
