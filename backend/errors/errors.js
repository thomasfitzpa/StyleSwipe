import CustomError from './customError.js';

export class BadRequestError extends CustomError {
    constructor(message = 'Bad Request') {
        super(message, 400)
    }
}

export class UnauthorizedError extends CustomError {
    constructor(message = 'Unauthorized') {
        super(message, 401)
    }
}

export class ForbiddenError extends CustomError {
    constructor(message = 'Forbidden') {
        super(message, 403)
    }
}

export class NotFoundError extends CustomError {
    constructor(message = 'Not Found') {
        super(message, 404)
    }
}

export class ConflictError extends CustomError {
    constructor(message = 'Conflict') {
        super(message, 409)
    }
}

export class ValidationError extends CustomError {
    constructor(errors, message = 'Validation Error') {
        super(message, 422)
        this.errors = errors
    }
}