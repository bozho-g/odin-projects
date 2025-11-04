const { Router } = require('express');
const itemsController = require('../controllers/itemsController');
const itemsRouter = Router();
const { validateItem } = require('../middlewares/validationMiddleware');
const asyncHandler = require('express-async-handler');

itemsRouter.get('/new', asyncHandler(itemsController.newItemGet));
itemsRouter.post('/new', validateItem, asyncHandler(itemsController.newItemPost));

itemsRouter.get('/:id', asyncHandler(itemsController.getItem));

itemsRouter.get('/:id/edit', asyncHandler(itemsController.editItemGet));
itemsRouter.post('/:id/edit', validateItem, asyncHandler(itemsController.editItemPost));

itemsRouter.get('/:id/delete', asyncHandler(itemsController.deleteItemGet));
itemsRouter.post('/:id/delete', asyncHandler(itemsController.deleteItemPost));

module.exports = itemsRouter;