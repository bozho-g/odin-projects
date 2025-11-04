const { Router } = require('express');
const categoriesController = require('../controllers/categoriesController');
const asyncHandler = require('express-async-handler');
const { validateCategory } = require('../middlewares/validationMiddleware');

const categoriesRouter = Router();

categoriesRouter.get('/', asyncHandler(categoriesController.getCategories));
categoriesRouter.get('/new', asyncHandler(categoriesController.newCategoryGet));
categoriesRouter.post('/new', validateCategory, asyncHandler(categoriesController.newCategoryPost));

categoriesRouter.get('/:id/edit', asyncHandler(categoriesController.editCategoryGet));
categoriesRouter.post('/:id/edit', validateCategory, asyncHandler(categoriesController.editCategoryPost));

categoriesRouter.get('/:id/delete', asyncHandler(categoriesController.deleteCategoryGet));
categoriesRouter.post('/:id/delete', asyncHandler(categoriesController.deleteCategoryPost));

categoriesRouter.get('/:id', asyncHandler(async (req, res) => {
    if (req.query && Object.keys(req.query).length > 0) {
        await categoriesController.filterCategory(req, res);
    } else {
        await categoriesController.getCategoryById(req, res);
    }
}));

module.exports = categoriesRouter;
