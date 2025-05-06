import { z } from "zod";

export const EventSchema = z.object({
  name: z.string().min(3, "Nombre debe tener al menos 3 caracteres"),
  description: z
    .string()
    .min(10, "Descripción debe tener al menos 10 caracteres"),
  date: z.string().refine((d) => {
    const date = new Date(d);
    return !isNaN(date.getTime()) && d.split("-")[0].length === 4;
  }, "Fecha inválida (Formato: YYYY-MM-DD)"),
  time: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d$/,
      "Formato de hora inválido (HH:MM, 00:00 a 23:59)"
    ),
  image_url: z.string().url("URL de imagen inválida").optional(),
  sale_start_time: z.string().datetime({
    message: "Formato datetime inválido (ISO 8601 requerido)",
  }),
  status: z.enum(["upcoming", "active", "completed"]).default("upcoming"),
});

export const UUIDSchema = z.string().uuid("ID inválido");

export const ActorRelationSchema = z.object({
  actor_ids: z.array(UUIDSchema).min(1, "Debe proporcionar al menos un actor"),
});
