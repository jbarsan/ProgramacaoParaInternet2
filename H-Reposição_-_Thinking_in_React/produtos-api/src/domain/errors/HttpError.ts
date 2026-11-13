/**
 * Camada de Domínio - Hierarquia de Erros (HttpError)
 *
 * Define os erros de negócio e de protocolo com código de status HTTP
 * e detalhes estruturados, permitindo que o middleware central de erros
 * (`errorHandler.ts`) formate qualquer erro no contrato padronizado:
 * `{ error: { message, statusCode, details } }`.
 *
 * REGRA ARQUITETURAL: Zero imports externos.
 */

export class HttpError extends Error {
  /** Código de status HTTP (ex.: 400, 401, 404, 409, 422, 500) */
  public readonly statusCode: number;
  /** Detalhes adicionais sobre o erro (ex.: lista de campos inválidos do Zod) */
  public readonly details: unknown;

  constructor(message: string, statusCode = 400, details: unknown = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Erro 400 Bad Request - Requisição malformada ou parâmetros inválidos.
 */
export class BadRequestError extends HttpError {
  constructor(message: string, details: unknown = null) {
    super(message, 400, details);
  }
}

/**
 * Erro 401 Unauthorized - Falha de autenticação ou token JWT ausente/inválido.
 */
export class UnauthorizedError extends HttpError {
  constructor(message = 'Não autorizado. Faça login para continuar.', details: unknown = null) {
    super(message, 401, details);
  }
}

/**
 * Erro 404 Not Found - Recurso solicitado não existe no banco de dados.
 */
export class NotFoundError extends HttpError {
  constructor(message = 'Recurso não encontrado.', details: unknown = null) {
    super(message, 404, details);
  }
}

/**
 * Erro 409 Conflict - Conflito de estado atual do recurso (ex.: e-mail ou produto duplicado).
 */
export class ConflictError extends HttpError {
  constructor(message: string, details: unknown = null) {
    super(message, 409, details);
  }
}

/**
 * Erro 422 Unprocessable Entity - Falha de validação semântica ou de schema.
 */
export class UnprocessableEntityError extends HttpError {
  constructor(message: string, details: unknown = null) {
    super(message, 422, details);
  }
}

