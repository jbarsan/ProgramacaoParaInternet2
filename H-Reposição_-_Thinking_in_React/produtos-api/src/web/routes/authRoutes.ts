/**
 * Camada Web - Rotas de Autenticação (`authRoutes.ts`)
 *
 * REGRA ARQUITETURAL (AGENTS.md):
 * - Rotas apenas roteiam → importam apenas controllers, middlewares e schemas de validação.
 * - Validação de corpo: Zod via `validate(schema)` na rota — nunca dentro do controller.
 */

import { RequestHandler, Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { loginSchema, registerSchema } from '../validation/authSchemas';
import { validate } from '../validation/validate';

export function createAuthRoutes(
  authController: AuthController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  // Cadastro de novo usuário (POST /api/auth/register -> 201 Created)
  router.post('/register', validate(registerSchema), authController.register);

  // Login com emissão de token JWT (POST /api/auth/login -> 200 OK)
  router.post('/login', validate(loginSchema), authController.login);

  // Dados do usuário logado (GET /api/auth/me -> 200 OK)
  router.get('/me', authMiddleware, authController.me);

  return router;
}

