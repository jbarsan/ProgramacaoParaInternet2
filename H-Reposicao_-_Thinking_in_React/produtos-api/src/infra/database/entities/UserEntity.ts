/**
 * Camada de Infraestrutura - Entidade ORM UserEntity (TypeORM)
 *
 * Mapeia a tabela `users` no banco SQLite para suporte à autenticação Argon2 + JWT.
 * Todas as colunas seguem a convenção `snake_case` no banco de dados
 * (`password_hash`, `created_at`, `updated_at`).
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  /** Identificador único autoincrementado do usuário */
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  id!: number;

  /** Nome completo do usuário */
  @Column({ name: 'name', type: 'varchar', length: 120 })
  name!: string;

  /** E-mail único utilizado no login */
  @Column({ name: 'email', type: 'varchar', length: 160, unique: true })
  email!: string;

  /** Hash da senha gerado pelo Argon2 (armazenado como `password_hash` no banco) */
  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  password_hash!: string;

  /** Data de criação em snake_case (`created_at`) */
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  created_at!: Date;

  /** Data de atualização em snake_case (`updated_at`) */
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updated_at!: Date;
}

