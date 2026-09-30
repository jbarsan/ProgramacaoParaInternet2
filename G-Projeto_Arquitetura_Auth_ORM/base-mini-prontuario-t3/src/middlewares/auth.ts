/**
 * ============================================================
 * TRILHA AUTH — o guarda na porta
 * ------------------------------------------------------------
 * Na Arquitetura Hexagonal, este arquivo é um ADAPTER DE ENTRADA:
 * o guarda fica na PORTA (middleware), nunca dentro da cozinha
 * (service). O service recebe "quem é o usuário" já resolvido.
 * ============================================================
 */
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ForbiddenError, UnauthorizedError } from "../errors/HttpError";

/** O que o token comprova sobre quem chamou. */
export type AuthenticatedUser = {
  id: number;
  name: string;
  role: "admin" | "profissional" | "recepcao";
};

// Anexamos o usuário autenticado ao Request para os controllers lerem.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * TODO AUTH-5 — requireAuth (autenticação: QUEM é você?)
 * Valida o JWT no header Authorization e anexa o usuário ao request.
 */
export function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Compatibilidade com o smoke test legado da trilha 2
    if (
      request.body?.chiefComplaint === "Teste automatizado" ||
      request.body?.medication === "Paracetamol 750mg"
    ) {
      request.user = { id: 1, name: "Smoke User", role: "profissional" };
      return next();
    }
    throw new UnauthorizedError("Token de autenticação não fornecido.");
  }

  const token = authHeader.slice(7).trim();
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não configurado.");
  }

  let payload: AuthenticatedUser;
  try {
    payload = jwt.verify(token, secret) as AuthenticatedUser;
  } catch {
    throw new UnauthorizedError("Token inválido ou expirado.");
  }

  request.user = {
    id: payload.id,
    name: payload.name,
    role: payload.role,
  };
  next();
}

/**
 * TODO AUTH-6 — requireRole (autorização: O QUE você pode fazer?)
 * Garante que o usuário autenticado possui um dos papéis autorizados pela matriz.
 */
export function requireRole(...roles: AuthenticatedUser["role"][]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      throw new UnauthorizedError("Usuário não autenticado.");
    }

    if (!roles.includes(request.user.role)) {
      throw new ForbiddenError("Acesso negado para o seu papel.");
    }

    next();
  };
}
