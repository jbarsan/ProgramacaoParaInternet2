/**
 * Service de Autenticação — a camada que DECIDE sobre identidade.
 *
 * Utiliza argon2 para hash seguro e jsonwebtoken para emissão de tokens.
 * Zero imports de express ou middlewares.
 */
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { ConflictError, NotFoundError, UnauthorizedError } from "../errors/HttpError";
import type { LoginInput, RegisterInput } from "../validation/auth.schemas";
import {
  type UsersRepository,
  PrismaUsersRepository,
} from "../repositories/users.repository";

const defaultRepository: UsersRepository = new PrismaUsersRepository();

export type UserDto = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type TokenPayload = {
  id: number;
  name: string;
  role: string;
};

export async function register(
  input: RegisterInput,
  repository: UsersRepository = defaultRepository,
): Promise<UserDto> {
  const existing = await repository.findByEmail(input.email);
  if (existing) {
    throw new ConflictError("Já existe um usuário com este e-mail.");
  }

  const passwordHash = await argon2.hash(input.password);
  const user = await repository.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: input.role,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function login(
  input: LoginInput,
  repository: UsersRepository = defaultRepository,
): Promise<{ token: string; user: UserDto }> {
  const user = await repository.findByEmail(input.email);
  if (!user) {
    // Mensagem genérica para prevenir enumeração de usuários (ATAQUE 5)
    throw new UnauthorizedError("Credenciais inválidas.");
  }

  const validPassword = await argon2.verify(user.passwordHash, input.password);
  if (!validPassword) {
    throw new UnauthorizedError("Credenciais inválidas.");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não configurado.");
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"];
  const payload: TokenPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const token = jwt.sign(payload, secret, { expiresIn });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getMe(
  userId: number,
  repository: UsersRepository = defaultRepository,
): Promise<UserDto> {
  const user = await repository.findById(userId);
  if (!user) {
    throw new NotFoundError("Usuário não encontrado.");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
