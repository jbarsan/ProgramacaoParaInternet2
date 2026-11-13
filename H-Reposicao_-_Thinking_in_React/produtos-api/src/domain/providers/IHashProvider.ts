/**
 * Camada de Domínio - Porta (Interface) IHashProvider
 *
 * Abstrai o algoritmo de criptografia/hash de senhas (implementado em `infra` com Argon2).
 *
 * REGRA ARQUITETURAL: Zero imports externos.
 */

export interface IHashProvider {
  /** Gera um hash criptográfico seguro a partir de uma senha em texto plano */
  hash(plainText: string): Promise<string>;

  /** Verifica se uma senha em texto plano corresponde ao hash armazenado */
  verify(hash: string, plainText: string): Promise<boolean>;
}

