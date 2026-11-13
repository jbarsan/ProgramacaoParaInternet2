/**
 * Camada de Infraestrutura - Adaptador TypeOrmUserRepository
 *
 * Implementa a porta `IUserRepository` definida no domínio, realizando a tradução
 * entre `snake_case` (`password_hash`, `created_at`, `updated_at`) no banco SQLite
 * e `camelCase` (`passwordHash`, `createdAt`, `updatedAt`) na entidade `User`.
 */

import { Repository } from 'typeorm';
import { CreateUserInput, User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { AppDataSource } from '../database/dataSource';
import { UserEntity } from '../database/entities/UserEntity';

export class TypeOrmUserRepository implements IUserRepository {
  private get ormRepo(): Repository<UserEntity> {
    return AppDataSource.getRepository(UserEntity);
  }

  /**
   * Traduz a entidade ORM (`snake_case`) para a entidade de domínio (`camelCase`).
   */
  private toDomain(entity: UserEntity): User {
    return new User({
      id: entity.id,
      name: entity.name,
      email: entity.email,
      passwordHash: entity.password_hash,
      createdAt:
        entity.created_at instanceof Date
          ? entity.created_at.toISOString()
          : String(entity.created_at),
      updatedAt:
        entity.updated_at instanceof Date
          ? entity.updated_at.toISOString()
          : String(entity.updated_at),
    });
  }

  /**
   * Busca um usuário pelo ID primário usando consulta parametrizada.
   */
  public async findById(id: number): Promise<User | null> {
    const entity = await this.ormRepo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * Busca um usuário pelo e-mail (normalizado em minúsculas) usando parâmetro seguro.
   */
  public async findByEmail(email: string): Promise<User | null> {
    const entity = await this.ormRepo
      .createQueryBuilder('u')
      .where('LOWER(u.email) = LOWER(:email)', { email: email.trim() })
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  /**
   * Persiste um novo usuário mapeando `passwordHash` para `password_hash`.
   */
  public async create(data: CreateUserInput): Promise<User> {
    const entity = this.ormRepo.create({
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password_hash: data.passwordHash,
    });

    const saved = await this.ormRepo.save(entity);
    return this.toDomain(saved);
  }
}

