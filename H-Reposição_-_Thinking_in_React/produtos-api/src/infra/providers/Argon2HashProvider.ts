/**
 * Camada de Infraestrutura - Adaptador Argon2HashProvider
 *
 * Implementa a interface `IHashProvider` do domínio utilizando a biblioteca `argon2`
 * (vencedora da Password Hashing Competition) para armazenamento seguro de senhas.
 */

import argon2 from 'argon2';
import { IHashProvider } from '../../domain/providers/IHashProvider';

export class Argon2HashProvider implements IHashProvider {
  /**
   * Gera um hash seguro Argon2id a partir da senha em texto plano.
   */
  public async hash(plainText: string): Promise<string> {
    return argon2.hash(plainText, {
      type: argon2.argon2id,
    });
  }

  /**
   * Compara de forma segura a senha em texto plano com o hash Argon2 armazenado.
   */
  public async verify(hash: string, plainText: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plainText);
    } catch {
      return false;
    }
  }
}

