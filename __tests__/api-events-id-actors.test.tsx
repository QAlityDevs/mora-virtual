import { GET, POST, DELETE, PUT } from "@/app/api/events/[id]/actors/route";
import { createClient } from "@/lib/supabase/server";
import * as eventSchemas from "@/schemas/events";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: data,
      status: options?.status || 200,
    })),
  },
}));

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("/api/events/[id]/actors", () => {
  let mockSupabase: any;
  let mockRequest: Request;
  let mockParams: { params: { id: string } };
  let uuidSchemaSpy: jest.SpyInstance;
  let actorRelationSchemaSpy: jest.SpyInstance;

  const setupMocks = {
    validAuth: () => {
      uuidSchemaSpy.mockReturnValue({ success: true });
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-id" } },
        error: null,
      });
    },
    invalidAuth: () => {
      uuidSchemaSpy.mockReturnValue({ success: true });
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });
    },
    authError: () => {
      uuidSchemaSpy.mockReturnValue({ success: true });
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Auth error"),
      });
    },
    invalidId: () => {
      uuidSchemaSpy.mockReturnValue({ success: false });
    },
    validActorData: (actorIds: string[]) => {
      actorRelationSchemaSpy.mockReturnValue({
        success: true,
        data: { actor_ids: actorIds },
      });
      mockRequest.json = jest.fn().mockResolvedValue({ actor_ids: actorIds });
    },
    invalidActorData: () => {
      mockRequest.json = jest.fn().mockResolvedValue({ invalid: "data" });
      actorRelationSchemaSpy.mockReturnValue({
        success: false,
        error: {
          format: () => ({ field: "error message" }),
        },
      });
    },
    dbError: (operation: string, message: string = `${operation} failed`) => {
      const mockFn = jest.fn(() => ({
        error: { message },
      }));

      if (operation === "insert") {
        mockSupabase.from = jest.fn(() => ({ insert: mockFn }));
      } else if (operation === "delete") {
        mockSupabase.from = jest.fn(() => ({
          delete: jest.fn(() => ({ eq: mockFn })),
        }));
      } else if (operation === "select") {
        const mockEq = jest.fn(() => ({
          data: null,
          error: { message },
        }));
        mockSupabase.from = jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({ eq: mockEq })),
          })),
        }));
      }
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    uuidSchemaSpy = jest.spyOn(eventSchemas.UUIDSchema, "safeParse");
    actorRelationSchemaSpy = jest.spyOn(
      eventSchemas.ActorRelationSchema,
      "safeParse"
    );

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({ error: null })),
        })),
        insert: jest.fn(() => ({ error: null })),
      })),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    mockRequest = {
      json: jest.fn(),
    } as any;

    mockParams = {
      params: { id: "test-event-id" },
    };
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it("(GET) should return 401 when user is not authenticated", async () => {
    setupMocks.invalidAuth();
    const result = await GET(mockRequest, mockParams);
    expect(result.status).toBe(401);
    expect(result.json).toEqual({ error: "No autorizado" });
  });

  it("(GET) should return 401 when auth error occurs", async () => {
    setupMocks.authError();
    const result = await GET(mockRequest, mockParams);
    expect(result.status).toBe(401);
    expect(result.json).toEqual({ error: "No autorizado" });
  });

  it("(GET) should return 400 when id is invalid", async () => {
    setupMocks.invalidId();
    const result = await GET(mockRequest, mockParams);
    expect(result.status).toBe(400);
    expect(result.json).toEqual({ error: "ID inválido" });
  });

  it("(GET) should return 404 when not found", async () => {
    setupMocks.validAuth();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { message: "Event not found" },
    });
    mockSupabase.from = jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({ single: mockSingle })),
      })),
    }));

    const result = await GET(mockRequest, mockParams);
    expect(result.status).toBe(404);
    expect(result.json).toEqual({
      error: "Evento no encontrado o error en consulta.",
    });
  });

  it("(GET) should return 500 on critical error", async () => {
    setupMocks.validAuth();
    mockSupabase.from = jest.fn().mockImplementation(() => {
      throw new Error("Critical error");
    });

    const result = await GET(mockRequest, mockParams);
    expect(result.status).toBe(500);
    expect(result.json).toEqual({ error: "Error interno del servidor" });
  });

  it("(POST) should return 401 when user is not authenticated", async () => {
    setupMocks.invalidAuth();
    const result = await POST(mockRequest, mockParams);
    expect(result.status).toBe(401);
    expect(result.json).toEqual({ error: "No autorizado" });
  });

  it("(POST) should return 400 when id is invalid", async () => {
    setupMocks.invalidId();
    const result = await POST(mockRequest, mockParams);
    expect(result.status).toBe(400);
    expect(result.json).toEqual({ error: "ID inválido" });
  });

  it("(POST) should return 400 when body is invalid", async () => {
    setupMocks.validAuth();
    setupMocks.invalidActorData();
    const result = await POST(mockRequest, mockParams);
    expect(result.status).toBe(400);
    expect(result.json).toEqual({ error: { field: "error message" } });
  });

  it("(POST) should return 500 when insert fails", async () => {
    setupMocks.validAuth();
    setupMocks.validActorData(["actor1", "actor2"]);
    setupMocks.dbError("insert");
    const result = await POST(mockRequest, mockParams);
    expect(result.status).toBe(500);
    expect(result.json).toEqual({ error: "insert failed" });
  });

  it("(POST) should create actor relations", async () => {
    setupMocks.validAuth();
    setupMocks.validActorData(["actor1", "actor2"]);
    const result = await POST(mockRequest, mockParams);
    expect(result.status).toBe(200);
    expect(result.json).toEqual({
      message: "Actores asociados correctamente al evento",
    });
    expect(mockSupabase.from).toHaveBeenCalledWith("event_actors");
  });

  it("(DELETE) should return 401 when user is not auth", async () => {
    setupMocks.invalidAuth();
    const result = await DELETE(mockRequest, mockParams);
    expect(result.status).toBe(401);
    expect(result.json).toEqual({ error: "No autorizado" });
  });

  it("(DELETE) should return 400 when event id is invalid", async () => {
    setupMocks.invalidId();
    const result = await DELETE(mockRequest, mockParams);
    expect(result.status).toBe(400);
    expect(result.json).toEqual({ error: "ID inválido" });
  });

  it("(DELETE) should return 400 when actor id is invalid", async () => {
    uuidSchemaSpy
      .mockReturnValueOnce({ success: true })
      .mockReturnValueOnce({ success: false });
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-id" } },
      error: null,
    });
    mockRequest.json = jest.fn().mockResolvedValue({ actor_id: "invalid-id" });

    const result = await DELETE(mockRequest, mockParams);
    expect(result.status).toBe(400);
    expect(result.json).toEqual({ error: "actor_id inválido" });
  });

  it("(DELETE) should return 500 when select fails", async () => {
    setupMocks.validAuth();
    mockRequest.json = jest.fn().mockResolvedValue({ actor_id: "actor1" });
    setupMocks.dbError("select");
    const result = await DELETE(mockRequest, mockParams);
    expect(result.status).toBe(500);
    expect(result.json).toEqual({ error: "select failed" });
  });

  it("(DELETE) should return 404 when relation is not found", async () => {
    setupMocks.validAuth();
    mockRequest.json = jest.fn().mockResolvedValue({ actor_id: "actor1" });
    const mockEq = jest.fn(() => ({ data: [], error: null }));
    mockSupabase.from = jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({ eq: mockEq })),
      })),
    }));

    const result = await DELETE(mockRequest, mockParams);
    expect(result.status).toBe(404);
    expect(result.json).toEqual({
      warning: "No se encontró relación entre actor y evento",
    });
  });

  it("(DELETE) should return 500 when delete fails", async () => {
    setupMocks.validAuth();
    mockRequest.json = jest.fn().mockResolvedValue({ actor_id: "actor1" });
    const mockSelectEq = jest.fn(() => ({
      data: [{ id: "relation-id" }],
      error: null,
    }));
    const mockDeleteEq = jest.fn(() => ({
      error: { message: "Delete failed" },
    }));

    mockSupabase.from = jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({ eq: mockSelectEq })),
      })),
      delete: jest.fn(() => ({ eq: mockDeleteEq })),
    }));

    const result = await DELETE(mockRequest, mockParams);
    expect(result.status).toBe(500);
    expect(result.json).toEqual({ error: "Delete failed" });
  });

  it("(DELETE) should delete actor relation", async () => {
    setupMocks.validAuth();
    mockRequest.json = jest.fn().mockResolvedValue({ actor_id: "actor1" });
    const mockSelectEq = jest.fn(() => ({
      data: [{ id: "relation-id" }],
      error: null,
    }));
    const mockDeleteEq = jest.fn(() => ({ error: null }));

    mockSupabase.from = jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({ eq: mockSelectEq })),
      })),
      delete: jest.fn(() => ({ eq: mockDeleteEq })),
    }));

    const result = await DELETE(mockRequest, mockParams);
    expect(result.status).toBe(200);
    expect(result.json).toEqual({
      message: "Actor desasociado del evento",
    });
  });

  it("(PUT) should return 401 when user not auth", async () => {
    setupMocks.invalidAuth();
    const result = await PUT(mockRequest, mockParams);
    expect(result.status).toBe(401);
    expect(result.json).toEqual({ error: "No autorizado" });
  });

  it("(PUT) should return 401 on auth error", async () => {
    setupMocks.authError();
    const result = await PUT(mockRequest, mockParams);
    expect(result.status).toBe(401);
    expect(result.json).toEqual({ error: "No autorizado" });
  });

  it("(PUT) should return 400 when event id is invalid", async () => {
    setupMocks.invalidId();
    const result = await PUT(mockRequest, mockParams);
    expect(result.status).toBe(400);
    expect(result.json).toEqual({ error: "ID de evento inválido" });
  });

  it("(PUT) should return 500 when delete fails", async () => {
    setupMocks.validAuth();
    setupMocks.validActorData(["actor1", "actor2"]);
    mockSupabase.from = jest.fn(() => ({
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({ error: { message: "Delete failed" } })),
      })),
    }));

    const result = await PUT(mockRequest, mockParams);
    expect(result.status).toBe(500);
    expect(result.json).toEqual({
      error: "Error eliminando relaciones antiguas: Delete failed",
    });
  });

  it("(PUT) should return 500 when insert fails", async () => {
    setupMocks.validAuth();
    setupMocks.validActorData(["actor1", "actor2"]);
    const mockDelete = jest.fn(() => ({
      eq: jest.fn(() => ({ error: null })),
    }));
    const mockInsert = jest.fn(() => ({
      error: { message: "Insert failed" },
    }));
    mockSupabase.from = jest.fn(() => ({
      delete: mockDelete,
      insert: mockInsert,
    }));

    const result = await PUT(mockRequest, mockParams);
    expect(result.status).toBe(500);
    expect(result.json).toEqual({
      error: "Error creando nuevas relaciones: Insert failed",
    });
  });

  it("(PUT) should remove all actors when actor ids is empty", async () => {
    setupMocks.validAuth();
    setupMocks.validActorData([]);
    const result = await PUT(mockRequest, mockParams);
    expect(result.status).toBe(200);
    expect(result.json).toEqual({
      message: "Todos los actores desasociados del evento",
    });
  });

  it("(PUT) should update actors", async () => {
    setupMocks.validAuth();
    setupMocks.validActorData(["actor1", "actor2"]);
    const result = await PUT(mockRequest, mockParams);
    expect(result.status).toBe(200);
    expect(result.json).toEqual({
      message: "Actores actualizados exitosamente",
    });
    expect(mockSupabase.from).toHaveBeenCalledWith("event_actors");
  });

  it("(PUT) should remove duplicate actor ids before insert", async () => {
    setupMocks.validAuth();
    setupMocks.validActorData(["actor1", "actor2", "actor1", "actor3"]);
    const mockInsert = jest.fn(() => ({ error: null }));
    mockSupabase.from = jest.fn(() => ({
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null })),
      })),
      insert: mockInsert,
    }));

    await PUT(mockRequest, mockParams);
    expect(mockInsert).toHaveBeenCalledWith([
      { event_id: "test-event-id", actor_id: "actor1" },
      { event_id: "test-event-id", actor_id: "actor2" },
      { event_id: "test-event-id", actor_id: "actor3" },
    ]);
  });
});
