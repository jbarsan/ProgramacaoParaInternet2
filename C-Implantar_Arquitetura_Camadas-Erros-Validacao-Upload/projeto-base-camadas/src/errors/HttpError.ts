/**
 * ============================================================
 * TODO 8 (Encontro 2) -- Hierarquia de HttpError
 * ============================================================
 * Esta pasta esta vazia de proposito -- ela e do Encontro 1,
 * mas o conteudo e do Encontro 2. Nao implemente antes da aula.
 *
 * Quando chegar a hora, crie aqui:
 *   class HttpError extends Error { statusCode, message, details? }
 *   class BadRequestError extends HttpError          -> 400
 *   class NotFoundError extends HttpError            -> 404
 *   class ConflictError extends HttpError            -> 409
 *   class UnprocessableEntityError extends HttpError -> 422
 *   class PayloadTooLargeError extends HttpError     -> 413
 *
 * Depois disso, volte aos Services (TODO 3 e TODO 6) e troque
 * os retornos especiais de erro por `throw new AlgumHttpError()`.
 * ============================================================
 */

export class HttpError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public details?: unknown
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class BadRequestError extends HttpError {
    constructor(message = "Requisição inválida", details?: unknown) {
        super(400, message, details);
    }
}

export class NotFoundError extends HttpError {
    constructor(message = "Recurso não encontrado") {
        super(404, message);
    }
}

export class ConflictError extends HttpError {
    constructor(message = "Conflito com o estado atual") {
        super(409, message);
    }
}

export class UnprocessableEntityError extends HttpError {
    constructor(message = "Não foi possível processar", details?: unknown) {
        super(422, message, details);
    }
}

export class PayloadTooLargeError extends HttpError {
    constructor(message = "Arquivo excede o tamanho permitido") {
        super(413, message);
    }
}

