/**
 * Camada de Infraestrutura - Entidade ORM ProductEntity (TypeORM)
 *
 * Mapeia a tabela `products` no banco SQLite seguindo a convenção obrigatória:
 * - O banco de dados utiliza exclusivamente nomes de colunas em `snake_case`
 *   (`is_stocked`, `photo_url`, `created_at`, `updated_at`).
 * - A tradução para `camelCase` (`stocked`, `photoUrl`, `createdAt`, `updatedAt`)
 *   acontece no repositório (`TypeOrmProductRepository`), impedindo que o formato
 *   interno do banco vaze para a API.
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'products' })
export class ProductEntity {
  /** Chave primária autoincrementada */
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  id!: number;

  /** Nome do produto (ex.: "Maçã", "Pitaia") */
  @Column({ name: 'name', type: 'varchar', length: 120, unique: true })
  name!: string;

  /** Categoria do produto (ex.: "Frutas", "Vegetais") */
  @Column({ name: 'category', type: 'varchar', length: 80 })
  category!: string;

  /** Preço exibido na tabela (ex.: "$1", "$2", "$4") */
  @Column({ name: 'price', type: 'varchar', length: 30 })
  price!: string;

  /** Flag de estoque em snake_case no banco (`is_stocked`), traduzida para `stocked` no domínio */
  @Column({ name: 'is_stocked', type: 'boolean', default: true })
  is_stocked!: boolean;

  /** Caminho da foto do produto em snake_case no banco (`photo_url`), traduzido para `photoUrl` */
  @Column({ name: 'photo_url', type: 'varchar', length: 255, nullable: true })
  photo_url!: string | null;

  /** Data de criação em snake_case (`created_at`) */
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  created_at!: Date;

  /** Data de atualização em snake_case (`updated_at`) */
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updated_at!: Date;
}

