/**
 * Camada Web - Schemas de Validação de Autenticação (Zod 4)
 *
 * Contratos de entrada para cadastro (`/api/auth/register`) e login (`/api/auth/login`).
 * Aplicados na fronteira da API pelo middleware `validate(schema)` nas rotas.
 */

import { z } from 'zod';

/**
 * Schema para cadastro de novo usuário (POST /api/auth/register)
 */
export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ error: 'O nome é obrigatório.' })
      .trim()
      .min(2, 'O nome deve ter pelo menos 2 caracteres.')
      .max(120, 'O nome deve ter no máximo 120 caracteres.'),
    email: z
      .string({ error: 'O e-mail é obrigatório.' })
      .trim()
      .email('Informe um endereço de e-mail válido.'),
    password: z
      .string({ error: 'A senha é obrigatória.' })
      .min(6, 'A senha deve possuir no mínimo 6 caracteres.')
      .max(100, 'A senha deve possuir no máximo 100 caracteres.'),
  }),
});

/**
 * Schema para login de usuário (POST /api/auth/login)
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ error: 'O e-mail é obrigatório.' })
      .trim()
      .email('Informe um endereço de e-mail válido.'),
    password: z
      .string({ error: 'A senha é obrigatória.' })
      .min(1, 'A senha é obrigatória.'),
  }),
});
