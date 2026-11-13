/**
 * Camada de Domínio - Porta (Interface) IUserRepository
 *
 * Define o contrato de persistência de usuários para autenticação.
 *
 * REGRA ARQUITETURAL: Zero imports externos.
 */

import { CreateUserInput, User } from '../entities/User';

export interface IUserRepository {
  /** Busca um usuário pelo ID numérico */
  findById(id: number): Promise<User | null>;

  /** Busca um usuário pelo endereço de e-mail */
  findByEmail(email: string): Promise<User | null>;

  /** Cria e persiste um novo usuário no banco de dados */
  create(data: CreateUserInput): Promise<User>;
}

