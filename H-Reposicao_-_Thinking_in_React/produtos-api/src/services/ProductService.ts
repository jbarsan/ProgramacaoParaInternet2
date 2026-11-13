/**
 * Camada de Aplicação / Serviços - ProductService
 *
 * Contém a lógica de negócio e orquestração dos casos de uso relacionados
 * aos produtos da tabela filtrável ("Thinking in React").
 *
 * REGRA ARQUITETURAL:
 * - ZERO imports de Express, rotas, controllers, middlewares ou bibliotecas de infraestrutura.
 * - Depende exclusivamente das abstrações (interfaces e entidades) da camada `src/domain/`.
 */

import {
  CreateProductInput,
  ProductFilter,
  ProductProps,
  UpdateProductInput,
} from '../domain/entities/Product';
import { ConflictError, NotFoundError } from '../domain/errors/HttpError';
import { IProductRepository } from '../domain/repositories/IProductRepository';

export class ProductService {
  /**
   * Recebe a implementação do repositório por Injeção de Dependência (Inversão de Controle).
   */
  constructor(private readonly productRepository: IProductRepository) {}

  /**
   * Lista todos os produtos cadastrados, permitindo filtrar por texto de busca,
   * disponibilidade em estoque (`inStockOnly`) e categoria.
   */
  public async listProducts(filter?: ProductFilter): Promise<ProductProps[]> {
    const products = await this.productRepository.findAll(filter);
    return products.map((product) => product.toJSON());
  }

  /**
   * Busca um produto específico pelo ID ou lança NotFoundError (HTTP 404).
   */
  public async getProductById(id: number): Promise<ProductProps> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(`Produto com ID ${id} não foi encontrado.`);
    }
    return product.toJSON();
  }

  /**
   * Cria um novo produto verificando antes se já existe outro produto com o mesmo nome.
   */
  public async createProduct(input: CreateProductInput): Promise<ProductProps> {
    const existing = await this.productRepository.findByName(input.name.trim());
    if (existing) {
      throw new ConflictError(`Já existe um produto cadastrado com o nome "${input.name}".`);
    }

    const normalizedPrice = this.normalizePrice(input.price);
    const created = await this.productRepository.create({
      ...input,
      name: input.name.trim(),
      category: input.category.trim(),
      price: normalizedPrice,
    });

    return created.toJSON();
  }

  /**
   * Atualiza um produto existente pelo ID, garantindo unicidade de nome e existência prévia.
   */
  public async updateProduct(id: number, input: UpdateProductInput): Promise<ProductProps> {
    const current = await this.productRepository.findById(id);
    if (!current) {
      throw new NotFoundError(`Produto com ID ${id} não foi encontrado.`);
    }

    if (input.name && input.name.trim().toLowerCase() !== current.name.toLowerCase()) {
      const duplicate = await this.productRepository.findByName(input.name.trim());
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(`Já existe outro produto com o nome "${input.name}".`);
      }
    }

    const updatedData: UpdateProductInput = {
      ...input,
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.category !== undefined ? { category: input.category.trim() } : {}),
      ...(input.price !== undefined ? { price: this.normalizePrice(input.price) } : {}),
    };

    const updated = await this.productRepository.update(id, updatedData);
    if (!updated) {
      throw new NotFoundError(`Produto com ID ${id} não foi encontrado.`);
    }

    return updated.toJSON();
  }

  /**
   * Associa ou atualiza a URL da foto de um produto após o upload via Multer.
   */
  public async updateProductPhoto(id: number, photoUrl: string): Promise<ProductProps> {
    const current = await this.productRepository.findById(id);
    if (!current) {
      throw new NotFoundError(`Produto com ID ${id} não foi encontrado para anexar a foto.`);
    }

    const updated = await this.productRepository.update(id, { photoUrl });
    if (!updated) {
      throw new NotFoundError(`Produto com ID ${id} não foi encontrado.`);
    }

    return updated.toJSON();
  }

  /**
   * Remove um produto existente pelo ID ou lança NotFoundError (HTTP 404).
   */
  public async deleteProduct(id: number): Promise<void> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Produto com ID ${id} não foi encontrado.`);
    }

    await this.productRepository.delete(id);
  }

  /**
   * Regra de domínio auxiliar: garante que o preço siga o formato "$X" do exemplo
   * "Thinking in React" caso o usuário envie apenas o número.
   */
  private normalizePrice(rawPrice: string): string {
    const trimmed = rawPrice.trim();
    if (trimmed.startsWith('$') || trimmed.startsWith('R$')) {
      return trimmed;
    }
    return `$${trimmed}`;
  }
}

