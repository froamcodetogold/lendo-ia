import { z } from "zod";
import { XpLabel } from "@prisma/client";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome.").max(80),
  bio: z.string().trim().max(280).optional().or(z.literal("")),
  image: z.string().trim().url("URL de imagem inválida.").optional().or(z.literal("")),
  xpLabel: z.nativeEnum(XpLabel),
});
