const itemsRepo = require('../repositories/itemsRepository');
const { isAdmin } = require('./authController');

async function getItems(id) {
    if (id) {
        return itemsRepo.findItemsByCategoryId(id);
    }

    return itemsRepo.findAllItems();
}

async function filterItems(query) {
    return await itemsRepo.filterItems(query);
}

async function getItem(req, res) {
    const item = await itemsRepo.findItemById(req.params.id);
    if (!item) {
        return res.status(404).render('errorPage', { errors: 'Item not found' });
    }

    res.render('items/item', { item });
}

async function newItemGet(req, res) {
    res.locals.activeCategoryId = 'new';

    res.render('items/new');
}

async function newItemPost(req, res) {
    const { categoryId, make, model, year, mileage, condition, color, power_hp, engine_size, engine_type, gearbox, title, price, imageUrl, description, password } = req.body;
    await isAdmin(password);

    await itemsRepo.createItem({ categoryId, make, model, year, mileage, condition, color, power_hp, engine_size, engine_type, gearbox, title, price, imageUrl, description });

    res.redirect('/categories/' + categoryId);
}

async function editItemGet(req, res) {
    res.render('items/edit', { item: await itemsRepo.findItemById(req.params.id) });
}

async function editItemPost(req, res) {
    const { categoryId, make, model, year, mileage, condition, color, power_hp, engine_size, engine_type, gearbox, title, price, imageUrl, description, password } = req.body;
    await isAdmin(password);

    await itemsRepo.updateItem(req.params.id, { categoryId, make, model, year, mileage, condition, color, power_hp, engine_size, engine_type, gearbox, title, price, imageUrl, description });

    res.redirect('/items/' + req.params.id);
}

async function deleteItemGet(req, res) {
    res.render('items/delete', { item: await itemsRepo.findItemById(req.params.id) });
}

async function deleteItemPost(req, res) {
    const { password } = req.body;
    await isAdmin(password);

    const categoryId = (await itemsRepo.findItemById(req.params.id)).category_id;

    await itemsRepo.deleteItem(req.params.id);

    res.redirect('/categories/' + categoryId);
}

module.exports = {
    getItems,
    filterItems,
    getItem,
    newItemGet,
    newItemPost,
    editItemGet,
    editItemPost,
    deleteItemGet,
    deleteItemPost
};