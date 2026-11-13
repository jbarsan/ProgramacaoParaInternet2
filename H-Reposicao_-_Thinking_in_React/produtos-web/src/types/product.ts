/**
 * Tipos e Contratos TypeScript do Frontend (`produtos-web`)
 *
 * Reflete exatamente o contrato `camelCase` da API REST e o modelo de dados
 * apresentado na documentação "Thinking in React":
 * https://pt-br.react.dev/learn/thinking-in-react
 */

export interface Product {
  /** Identificador numérico único do produto no banco de dados */
  id: number;
  /** Categoria do produto (ex.: "Frutas", "Vegetais") */
  category: string;
  /** Preço exibido na tabela (ex.: "$1", "$2", "$4") */
  price: string;
  /** Indica se o produto está disponível em estoque (true) ou esgotado (false) */
  stocked: boolean;
  /** Nome do produto (ex.: "Maçã", "Pitaia", "Espinafre") */
  name: string;
  /** Caminho relativo da foto enviada via Multer (ex.: "/uploads/uuid.png") ou null */
  photoUrl: string | null;
  /** Data de criação em formato ISO */
  createdAt?: string;
  /** Data de atualização em formato ISO */
  updatedAt?: string;
}

export interface CreateProductPayload {
  name: string;
  category: string;
  price: string;
  stocked: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Formato de erro padronizado retornado pelo `errorHandler.ts` do backend:
 * `{ error: { message, statusCode, details } }`
 */
export interface ApiErrorShape {
  error: {
    message: string;
    statusCode: number;
    details?: Array<{ field: string; message: string }> | Record<string, unknown> | null;
  };
}

