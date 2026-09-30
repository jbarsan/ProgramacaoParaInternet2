/**
 * ------------------------------------------------------------
 * TODO AUTH-3 — As portas da identidade
 * ------------------------------------------------------------
 * Monte aqui, seguindo o padrão dos outros routers:
 *
 *   POST /api/auth/register  -> cria usuário (senha vira HASH
 *                               argon2 no service; texto puro
 *                               JAMAIS toca o banco)
 *   POST /api/auth/login     -> confere credenciais e devolve
 *                               { token, user } (JWT assinado)
 *   GET  /api/auth/me        -> devolve o usuário do token
 *                               (protegida por requireAuth)
 *
 * O frontend já consome os três — ele acende sozinho quando
 * esta trilha nascer. Crie também o controller e o service de
 * auth (TODO AUTH-2 fica na migration do Prisma: tabela users).
 * ------------------------------------------------------------ */
import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { requireAuth } from "../middlewares/auth";
import { loginSchema, registerSchema } from "../validation/auth.schemas";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), authController.register);
authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.get("/me", requireAuth, authController.me);
