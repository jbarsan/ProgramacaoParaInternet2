/**
 * Camada de Infraestrutura - Adaptador JwtTokenProvider
 *
 * Implementa a porta `ITokenProvider` utilizando `jsonwebtoken` (JWT)
 * para autenticação stateless da API REST.
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { UnauthorizedError } from '../../domain/errors/HttpError';
import { ITokenProvider, TokenPayload } from '../../domain/providers/ITokenProvider';

export class JwtTokenProvider implements ITokenProvider {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'produtos_web_super_secret_jwt_key_2026';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '8h';
  }

  /**
   * Emite um token JWT assinado contendo ID (`sub`), e-mail e nome do usuário.
   */
  public sign(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.expiresIn as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, this.secret, options);
  }

  /**
   * Verifica a assinatura e a validade temporal do token JWT.
   * Lança `UnauthorizedError` (HTTP 401) caso o token seja inválido ou expirado.
   */
  public verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as unknown as TokenPayload;
      return {
        sub: Number(decoded.sub),
        email: String(decoded.email),
        name: String(decoded.name),
      };
    } catch {
      throw new UnauthorizedError('Token JWT inválido ou expirado.');
    }
  }
}

