/**
 * Camada de Aplicação / Serviços - AuthService
 *
 * Responsável pelo cadastro de usuários, autenticação (login) com verificação
 * de hash Argon2 e emissão de tokens JWT, além da consulta de perfil.
 *
 * REGRA ARQUITETURAL:
 * - ZERO imports de Express, rotas, controllers, middlewares ou libs externas.
 * - Depende apenas das portas (`IUserRepository`, `IHashProvider`, `ITokenProvider`)
 *   declaradas em `src/domain/`.
 */

import { PublicUser } from '../domain/entities/User';
import { ConflictError, NotFoundError, UnauthorizedError } from '../domain/errors/HttpError';
import { IHashProvider } from '../domain/providers/IHashProvider';
import { ITokenProvider } from '../domain/providers/ITokenProvider';
import { IUserRepository } from '../domain/repositories/IUserRepository';

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  user: PublicUser;
  token: string;
}

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashProvider: IHashProvider,
    private readonly tokenProvider: ITokenProvider,
  ) {}

  /**
   * Registra um novo usuário com senha criptografada em Argon2 e retorna o token JWT.
   */
  public async register(input: RegisterUserDTO): Promise<AuthResponseDTO> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError('Este endereço de e-mail já está em uso.');
    }

    const passwordHash = await this.hashProvider.hash(input.password);

    const createdUser = await this.userRepository.create({
      name: input.name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const publicUser = createdUser.toPublic();
    const token = this.tokenProvider.sign({
      sub: publicUser.id,
      email: publicUser.email,
      name: publicUser.name,
    });

    return {
      user: publicUser,
      token,
    };
  }

  /**
   * Autentica um usuário verificando e-mail e senha (via Argon2) e emite um token JWT.
   */
  public async login(input: LoginUserDTO): Promise<AuthResponseDTO> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas (e-mail ou senha incorretos).');
    }

    const isPasswordValid = await this.hashProvider.verify(user.passwordHash, input.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciais inválidas (e-mail ou senha incorretos).');
    }

    const publicUser = user.toPublic();
    const token = this.tokenProvider.sign({
      sub: publicUser.id,
      email: publicUser.email,
      name: publicUser.name,
    });

    return {
      user: publicUser,
      token,
    };
  }

  /**
   * Retorna os dados públicos do usuário autenticado pelo seu ID.
   */
  public async getProfile(userId: number): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }
    return user.toPublic();
  }
}

