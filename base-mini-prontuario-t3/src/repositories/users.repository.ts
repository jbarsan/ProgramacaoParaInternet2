/**
 * Repository de User (Port & Prisma Adapter).
 *
 * Contrato (interface) para usuários + implementação com Prisma.
 */
import { prisma } from "./prisma";

export type UserRole = "admin" | "profissional" | "recepcao";

export type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
};

export type CreateUserData = {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
};

export interface UsersRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}

export class PrismaUsersRepository implements UsersRepository {
  async findByEmail(email: string): Promise<User | null> {
    const u = await prisma.user.findUnique({ where: { email } });
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      passwordHash: u.passwordHash,
      role: u.role as UserRole,
      createdAt: u.createdAt,
    };
  }

  async findById(id: number): Promise<User | null> {
    const u = await prisma.user.findUnique({ where: { id } });
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      passwordHash: u.passwordHash,
      role: u.role as UserRole,
      createdAt: u.createdAt,
    };
  }

  async create(data: CreateUserData): Promise<User> {
    const u = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
      },
    });
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      passwordHash: u.passwordHash,
      role: u.role as UserRole,
      createdAt: u.createdAt,
    };
  }
}
