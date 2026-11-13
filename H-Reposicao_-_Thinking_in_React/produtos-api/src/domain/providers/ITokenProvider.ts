/**
 * Camada de Domínio - Porta (Interface) ITokenProvider
 *
 * Abstrai a emissão e verificação de tokens de autenticação (implementado em `infra` com JWT).
 *
 * REGRA ARQUITETURAL: Zero imports externos.
 */

export interface TokenPayload {
  /** ID do usuário autenticado (subject) */
  sub: number;
  /** E-mail do usuário autenticado */
  email: string;
  /** Nome do usuário autenticado */
  name: string;
}

export interface ITokenProvider {
  /** Assina e retorna um token JWT contendo os dados do usuário */
  sign(payload: TokenPayload): string;

  /** Valida um token JWT e retorna seu payload decodificado */
  verify(token: string): TokenPayload;
}

