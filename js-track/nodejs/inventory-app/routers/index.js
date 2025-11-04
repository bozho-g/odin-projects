const itemsRouter = require('./itemsRouter');
const categoriesRouter = require('./categoriesRouter');
const { findAllCategories } = require('../repositories/categoriesRepository');

const mountRoutes = (app) => {
    app.use(async (req, res, next) => {
        try {
            const categories = await findAllCategories();

            res.locals.categories = categories;
            req.categories = categories;
            next();
        } catch (error) {
            next(error);
        }
    });

    app.get('/', (req, res) => {
        res.render('home', { categories: res.locals.categories });
    });
    app.use('/categories', categoriesRouter);
    app.use('/items', itemsRouter);
    app.use(function (req, res) {
        const error = new Error('Sorry, page not found');
        error.statusCode = 404;
        throw error;
    });
};

module.exports = mountRoutes;
