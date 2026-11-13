/**
 * Camada Web - AuthController
 *
 * Traduz as requisições HTTP de autenticação (`/register`, `/login`, `/me`)
 * para chamadas ao `AuthService`.
 *
 * REGRA ARQUITETURAL:
 * - Importa apenas o `AuthService` (e `UnauthorizedError` do domínio).
 * - Nunca formata erros manualmente; delega tudo ao `errorHandler.ts`.
 */

import { Request, Response } from 'express';
import { UnauthorizedError } from '../../domain/errors/HttpError';
import { AuthService } from '../../services/AuthService';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/register
   * Registra um novo usuário com senha Argon2 e retorna usuário + token JWT.
   * Status HTTP: 201 Created
   */
  public register = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;
    const result = await this.authService.register({ name, email, password });
    res.status(201).json(result);
  };

  /**
   * POST /api/auth/login
   * Autentica um usuário existente e retorna usuário + token JWT.
   * Status HTTP: 200 OK
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const result = await this.authService.login({ email, password });
    res.status(200).json(result);
  };

  /**
   * GET /api/auth/me
   * Retorna os dados públicos do usuário autenticado a partir do token JWT.
   * Status HTTP: 200 OK
   */
  public me = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Usuário não autenticado.');
    }

    const profile = await this.authService.getProfile(req.user.sub);
    res.status(200).json({ user: profile });
  };
}

