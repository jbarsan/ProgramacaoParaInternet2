/**
 * ============================================================
 * Repositório de User — Camada Repository (Port & Adapter)
 * ------------------------------------------------------------
 * Porta: UsersRepository
 * Adaptador Prisma: PrismaUsersRepository
 * ============================================================
 */
import { prisma } from "./prisma";

export type UserRole = "admin" | "profissional" | "recepcao";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

export type UserWithPassword = User & {
  passwordHash: string;
};

export interface UsersRepository {
  findByEmail(email: string): Promise<UserWithPassword | null>;
  findById(id: number): Promise<User | null>;
  create(data: { name: string; email: string; passwordHash: string; role: string }): Promise<User>;
}

export class PrismaUsersRepository implements UsersRepository {
  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    };
  }

  async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      createdAt: user.createdAt,
    };
  }

  async create(data: { name: string; email: string; passwordHash: string; role: string }): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
      },
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      createdAt: user.createdAt,
    };
  }
}

export const defaultUsersRepository: UsersRepository = new PrismaUsersRepository();
