/**
 * Service de Autenticação — regra de negócio da identidade.
 * Lida com hash de senhas (argon2), geração de tokens JWT e verificação.
 * Zero conhecimento de Express ou Web.
 */
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { ConflictError, NotFoundError, UnauthorizedError } from "../errors/HttpError";
import type { LoginInput, RegisterInput } from "../validation/auth.schemas";
import {
  type UsersRepository,
  defaultUsersRepository,
} from "../repositories/users.repository";

export async function register(
  input: RegisterInput,
  repository: UsersRepository = defaultUsersRepository,
) {
  const existing = await repository.findByEmail(input.email);
  if (existing) {
    throw new ConflictError("Já existe um usuário com este e-mail.");
  }

  // Senha pura JAMAIS toca o banco de dados.
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
  repository: UsersRepository = defaultUsersRepository,
) {
  const user = await repository.findByEmail(input.email);
  if (!user) {
    // Defesa contra enumeração de usuários (OWASP A07):
    // Não revela se o erro foi no e-mail ou na senha.
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

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN as any) || "15m" },
  );

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
  repository: UsersRepository = defaultUsersRepository,
) {
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
