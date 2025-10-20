import CustomError from './customError.js';

export class BadRequestError extends CustomError {
    constructor(message = 'Bad Request') {
        super(message, 400)
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
    constructor(message = 'Validation Error') {
        super(message, 422)
    }
}