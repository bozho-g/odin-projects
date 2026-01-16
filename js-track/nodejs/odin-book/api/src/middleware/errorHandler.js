module.exports = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    let payload;

    if (err.message) {
        err.message.includes('prisma') ? payload = { message: 'Database error' } : payload = { message: err.message };
    } else {
        payload = { message: 'Internal Server Error' };
    }

    if (err.details) payload.details = err.details;
    if (process.env.NODE_ENV === 'development' && err.stack) {
        console.error(err);
    }

    res.status(status).json(payload);
};