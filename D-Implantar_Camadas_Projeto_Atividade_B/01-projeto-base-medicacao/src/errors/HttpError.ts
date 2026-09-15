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
    constructor(
        message = "Requisição inválida",
        details?: unknown
    ) {
        super(400, message, details);
        this.name = this.constructor.name;
    }
}

export class NotFoundError extends HttpError {
    constructor(
        message = "Recurso não encontrado"
    ) {
        super(404, message);
        this.name = this.constructor.name;
    }
}

export class ConflictError extends HttpError {
    constructor(
        message = "Conflito com o estado atual"
    ) {
        super(409, message);
        this.name = this.constructor.name;
    }
}

export class UnprocessableEntityError extends HttpError {
    constructor(
        message = "Não foi possível processar",
        details?: unknown
    ) {
        super(422, message, details);
        this.name = this.constructor.name;
    }
}

