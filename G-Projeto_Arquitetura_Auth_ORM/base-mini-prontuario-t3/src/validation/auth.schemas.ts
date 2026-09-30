/**
 * ------------------------------------------------------------
 * TODO AUTH-4 — Schemas de registro e login
 * ------------------------------------------------------------
 * Crie e exporte:
 *   registerSchema: { name, email (z.email()), password (min 8),
 *                     role: z.enum(["admin","profissional","recepcao"]) }
 *   loginSchema:    { email, password }
 *
 * Pergunta de projeto (responda no README): por que o schema de
 * REGISTRO valida o tamanho mínimo da senha, mas o de LOGIN não
 * deve rejeitar senha curta com 400? (Dica: o que um atacante
 * aprende com cada resposta diferente?)
 * ------------------------------------------------------------ */
import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({ error: "O campo 'name' é obrigatório." })
    .trim()
    .min(1, "O campo 'name' não pode ser vazio."),
  email: z
    .string({ error: "O campo 'email' é obrigatório." })
    .email("E-mail inválido.")
    .trim(),
  password: z
    .string({ error: "O campo 'password' é obrigatório." })
    .min(8, "A senha deve ter no mínimo 8 caracteres."),
  role: z.enum(["admin", "profissional", "recepcao"], {
    error: "Papel inválido.",
  }),
});

export const loginSchema = z.object({
  email: z
    .string({ error: "O campo 'email' é obrigatório." })
    .email("E-mail inválido.")
    .trim(),
  password: z
    .string({ error: "O campo 'password' é obrigatório." })
    .min(1, "O campo 'password' não pode ser vazio."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
