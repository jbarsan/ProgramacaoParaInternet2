/**
 * Camada de Infraestrutura - Adaptador TypeOrmProductRepository
 *
 * Implementa a porta `IProductRepository` definida na camada de domínio (`src/domain/`).
 *
 * Responsabilidades:
 * 1. Executar operações de banco via TypeORM + SQLite usando sempre parâmetros seguros
 *    (nunca concatenação de strings em SQL).
 * 2. Traduzir o formato interno do banco (`snake_case`: `is_stocked`, `photo_url`,
 *    `created_at`, `updated_at`) para a entidade de domínio (`camelCase`: `stocked`,
 *    `photoUrl`, `createdAt`, `updatedAt`).
 */

import { Repository } from 'typeorm';
import {
  CreateProductInput,
  Product,
  ProductFilter,
  UpdateProductInput,
} from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { AppDataSource } from '../database/dataSource';
import { ProductEntity } from '../database/entities/ProductEntity';

export class TypeOrmProductRepository implements IProductRepository {
  private get ormRepo(): Repository<ProductEntity> {
    return AppDataSource.getRepository(ProductEntity);
  }

  /**
   * Converte o registro `snake_case` do banco (`ProductEntity`) para a entidade `camelCase` de domínio (`Product`).
   */
  private toDomain(entity: ProductEntity): Product {
    return new Product({
      id: entity.id,
      name: entity.name,
      category: entity.category,
      price: entity.price,
      stocked: Boolean(entity.is_stocked),
      photoUrl: entity.photo_url ?? null,
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
   * Lista os produtos ordenados por categoria e ID, aplicando filtros com SQL parametrizado.
   */
  public async findAll(filter?: ProductFilter): Promise<Product[]> {
    const qb = this.ormRepo.createQueryBuilder('p');

    if (filter?.search && filter.search.trim() !== '') {
      qb.andWhere('LOWER(p.name) LIKE LOWER(:search)', {
        search: `%${filter.search.trim()}%`,
      });
    }

    if (filter?.inStockOnly === true) {
      qb.andWhere('p.is_stocked = :stocked', { stocked: 1 });
    }

    if (filter?.category && filter.category.trim() !== '') {
      qb.andWhere('LOWER(p.category) = LOWER(:category)', {
        category: filter.category.trim(),
      });
    }

    qb.orderBy('p.category', 'ASC').addOrderBy('p.id', 'ASC');

    const rows = await qb.getMany();
    return rows.map((row) => this.toDomain(row));
  }

  /**
   * Busca um produto pelo ID utilizando consulta parametrizada.
   */
  public async findById(id: number): Promise<Product | null> {
    const entity = await this.ormRepo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * Busca um produto pelo nome (case-insensitive) utilizando parâmetro seguro.
   */
  public async findByName(name: string): Promise<Product | null> {
    const entity = await this.ormRepo
      .createQueryBuilder('p')
      .where('LOWER(p.name) = LOWER(:name)', { name: name.trim() })
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  /**
   * Cria e salva um novo produto traduzindo de `camelCase` (domínio) para `snake_case` (banco).
   */
  public async create(data: CreateProductInput): Promise<Product> {
    const entity = this.ormRepo.create({
      name: data.name,
      category: data.category,
      price: data.price,
      is_stocked: data.stocked,
      photo_url: data.photoUrl ?? null,
    });

    const saved = await this.ormRepo.save(entity);
    return this.toDomain(saved);
  }

  /**
   * Atualiza os campos informados de um produto existente no banco.
   */
  public async update(id: number, data: UpdateProductInput): Promise<Product | null> {
    const entity = await this.ormRepo.findOne({ where: { id } });
    if (!entity) {
      return null;
    }

    if (data.name !== undefined) entity.name = data.name;
    if (data.category !== undefined) entity.category = data.category;
    if (data.price !== undefined) entity.price = data.price;
    if (data.stocked !== undefined) entity.is_stocked = data.stocked;
    if (data.photoUrl !== undefined) entity.photo_url = data.photoUrl;

    const saved = await this.ormRepo.save(entity);
    return this.toDomain(saved);
  }

  /**
   * Remove um produto do banco pelo ID.
   */
  public async delete(id: number): Promise<boolean> {
    const result = await this.ormRepo.delete({ id });
    return Boolean(result.affected && result.affected > 0);
  }
}

