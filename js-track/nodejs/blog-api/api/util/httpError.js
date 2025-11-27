class HttpError extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status || 500;
        if (details) this.details = details;
    }

    static badRequest(message = 'Bad Request', details) {
        return new HttpError(400, message, details);
    }

    static unauthorized(message = 'Unauthorized', details) {
        return new HttpError(401, message, details);
    }

    static forbidden(message = 'Forbidden', details) {
        return new HttpError(403, message, details);
    }

    static notFound(message = 'Not Found', details) {
        return new HttpError(404, message, details);
    }

    static internal(message = 'Internal Server Error', details) {
        return new HttpError(500, message, details);
    }
}

module.exports = HttpError;
