import { z } from "zod";

export const EventSchema = z.object({
  name: z.string().min(3, "Nombre debe tener al menos 3 caracteres"),
  description: z
    .string()
    .min(10, "Descripción debe tener al menos 10 caracteres"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
  image_url: z.string().url("URL de imagen inválida").optional(),
  sale_start_time: z.string().datetime("Formato datetime inválido"),
  status: z.enum(["upcoming", "active", "completed"]).default("upcoming"),
});

export const UUIDSchema = z.string().uuid("ID inválido");

export const ActorRelationSchema = z.object({
  actor_ids: z.array(UUIDSchema).min(1, "Debe proporcionar al menos un actor"),
});
