/**
 * Camada de Domínio - Porta (Interface) IProductRepository
 *
 * Define o contrato de persistência de produtos para inversão de dependência
 * (Arquitetura Hexagonal / Ports & Adapters).
 * A camada `services` depende apenas desta interface; a camada `infra` a implementa.
 *
 * REGRA ARQUITETURAL: Zero imports externos.
 */

import {
  CreateProductInput,
  Product,
  ProductFilter,
  UpdateProductInput,
} from '../entities/Product';

export interface IProductRepository {
  /** Lista todos os produtos aplicando filtros opcionais de busca e estoque */
  findAll(filter?: ProductFilter): Promise<Product[]>;

  /** Busca um produto específico pelo seu ID numérico */
  findById(id: number): Promise<Product | null>;

  /** Busca um produto pelo seu nome exato (case-insensitive) */
  findByName(name: string): Promise<Product | null>;

  /** Persiste um novo produto no banco de dados e retorna a entidade criada */
  create(data: CreateProductInput): Promise<Product>;

  /** Atualiza os dados de um produto existente e retorna a entidade atualizada */
  update(id: number, data: UpdateProductInput): Promise<Product | null>;

  /** Remove um produto do banco de dados pelo ID */
  delete(id: number): Promise<boolean>;
}

