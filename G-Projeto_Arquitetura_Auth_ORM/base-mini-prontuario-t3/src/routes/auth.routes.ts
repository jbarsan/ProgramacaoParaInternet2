/**
 * ------------------------------------------------------------
 * TODO AUTH-3 — As portas da identidade
 * ------------------------------------------------------------
 *   POST /api/auth/register  -> cria usuário
 *   POST /api/auth/login     -> confere credenciais e devolve { token, user }
 *   GET  /api/auth/me        -> devolve o usuário do token (protegida)
 * ------------------------------------------------------------
 */
import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { requireAuth } from "../middlewares/auth";
import { loginSchema, registerSchema } from "../validation/auth.schemas";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), authController.register);
authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.get("/me", requireAuth, authController.me);
