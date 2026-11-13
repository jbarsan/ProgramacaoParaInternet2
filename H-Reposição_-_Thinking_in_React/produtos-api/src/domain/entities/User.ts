/**
 * Camada de Domínio - Entidade User (Usuário)
 *
 * Representa um usuário do sistema utilizado no fluxo de autenticação
 * com Argon2 (hash de senha) e JWT (token de acesso).
 *
 * REGRA ARQUITETURAL: Zero imports externos nesta camada.
 * O hash de senha (passwordHash) jamais deve vazar na serialização pública.
 */

export interface UserProps {
  /** Identificador único do usuário */
  id: number;
  /** Nome completo do usuário */
  name: string;
  /** Endereço de e-mail único do usuário */
  email: string;
  /** Hash criptográfico da senha gerado via Argon2 */
  passwordHash: string;
  /** Data de criação da conta em formato ISO 8601 */
  createdAt: string;
  /** Data da última atualização da conta em formato ISO 8601 */
  updatedAt: string;
}

/**
 * Representação pública de um usuário (sem expor passwordHash).
 */
export interface PublicUser {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dados necessários para criação de um novo usuário no repositório.
 */
export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

/**
 * Entidade de Domínio User.
 */
export class User {
  public readonly id: number;
  public readonly name: string;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name.trim();
    this.email = props.email.trim().toLowerCase();
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Converte a entidade para um objeto seguro para respostas HTTP (camelCase),
   * omitindo o campo sensível passwordHash.
   */
  public toPublic(): PublicUser {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

