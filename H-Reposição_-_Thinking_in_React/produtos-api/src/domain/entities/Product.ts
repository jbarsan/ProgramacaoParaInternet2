/**
 * Camada de Domínio - Entidade Product (Produto)
 *
 * Representa o modelo de negócio de um Produto baseado no exemplo oficial
 * "Thinking in React" (https://pt-br.react.dev/learn/thinking-in-react),
 * acrescido de identificadores, URL de foto e metadados de auditoria.
 *
 * REGRA ARQUITETURAL: Zero imports externos nesta camada.
 * Convenção de nomenclatura: A API e o Domínio falam camelCase;
 * o banco de dados fala snake_case (traduzido na camada infra).
 */

export interface ProductProps {
  /** Identificador único do produto no sistema */
  id: number;
  /** Nome do produto (ex.: "Maçã", "Fruta do dragão", "Espinafre") */
  name: string;
  /** Categoria do produto (ex.: "Frutas", "Vegetais") */
  category: string;
  /** Preço formatado conforme o exemplo Thinking in React (ex.: "$1", "$2", "$4") */
  price: string;
  /** Indica se o produto está disponível em estoque (true) ou esgotado (false) */
  stocked: boolean;
  /** Caminho/URL público da foto do produto enviada via Multer (ou null se não possuir) */
  photoUrl: string | null;
  /** Data de criação do registro em formato ISO 8601 */
  createdAt: string;
  /** Data da última atualização do registro em formato ISO 8601 */
  updatedAt: string;
}

/**
 * Dados necessários para criar um novo produto no domínio.
 */
export interface CreateProductInput {
  name: string;
  category: string;
  price: string;
  stocked: boolean;
  photoUrl?: string | null;
}

/**
 * Dados permitidos para atualizar um produto existente no domínio.
 */
export interface UpdateProductInput {
  name?: string;
  category?: string;
  price?: string;
  stocked?: boolean;
  photoUrl?: string | null;
}

/**
 * Filtros opcionais para consulta de produtos.
 */
export interface ProductFilter {
  /** Texto para busca parcial pelo nome do produto */
  search?: string;
  /** Se verdadeiro, retorna apenas produtos disponíveis em estoque */
  inStockOnly?: boolean;
  /** Filtra por uma categoria específica */
  category?: string;
}

/**
 * Classe de Entidade de Domínio Product.
 * Encapsula os dados e invariantes de negócio de um produto.
 */
export class Product {
  public readonly id: number;
  public readonly name: string;
  public readonly category: string;
  public readonly price: string;
  public readonly stocked: boolean;
  public readonly photoUrl: string | null;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  constructor(props: ProductProps) {
    this.id = props.id;
    this.name = props.name.trim();
    this.category = props.category.trim();
    this.price = props.price.trim();
    this.stocked = Boolean(props.stocked);
    this.photoUrl = props.photoUrl ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Serializa a entidade para o formato público (camelCase) esperado pela API REST.
   */
  public toJSON(): ProductProps {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      price: this.price,
      stocked: this.stocked,
      photoUrl: this.photoUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

