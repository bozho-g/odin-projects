const categoriesRepo = require("../repositories/categoriesRepository");
const { isAdmin } = require('./authController');
const { getItems, filterItems } = require("./itemsController");

async function getCategories(req, res) {
    const categories = req.categories || res.locals.categories || [];
    res.render('categories/index', { categories });
}

async function getCategoryById(req, res) {
    const category = getLocalCategoryById(req, res, req.params.id);

    const items = await getItems(req.params.id === 'all' ? null : category.id);

    res.render('categories/category', { category, items, allItems: null, filters: {} });
}

async function filterCategory(req, res) {
    const categoryId = req.params.id;

    const allItems = await getItems(categoryId === 'all' ? null : categoryId);
    const filteredItems = await filterItems({ category_id: categoryId, ...req.query });
    const category = getLocalCategoryById(req, res, categoryId);

    res.render('categories/category', { category, items: filteredItems, allItems, filters: req.query });
}

function getLocalCategoryById(req, res, categoryId) {
    const categories = req.categories || res.locals.categories || [];
    const category = categoryId === 'all' ? categories : categories.find(cat => cat.id === parseInt(categoryId, 10));
    res.locals.activeCategoryId = categoryId;

    if (!category) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        throw error;
    }

    return category;
}

async function newCategoryGet(req, res) {
    res.render('categories/new');
}

async function newCategoryPost(req, res) {
    console.log(req.body);

    const { name, password } = req.body;
    await isAdmin(password);

    await categoriesRepo.createCategory(name);
    res.redirect('/categories');
}

async function editCategoryGet(req, res) {
    res.render('categories/edit', { category: getLocalCategoryById(req, res, req.params.id) });
}

async function editCategoryPost(req, res) {
    const { name, password } = req.body;
    await isAdmin(password);

    const categoryId = req.params.id;
    await categoriesRepo.updateCategory(categoryId, name);

    res.redirect(`/categories/${categoryId}`);
}

async function deleteCategoryGet(req, res) {
    res.render('categories/delete', { category: getLocalCategoryById(req, res, req.params.id) });
}

async function deleteCategoryPost(req, res) {
    const { password } = req.body;
    await isAdmin(password);

    const categoryId = req.params.id;

    await categoriesRepo.deleteCategory(categoryId);

    res.redirect('/categories');
}

module.exports = {
    getCategories,
    getCategoryById,
    filterCategory,
    newCategoryGet,
    newCategoryPost,
    editCategoryGet,
    editCategoryPost,
    deleteCategoryGet,
    deleteCategoryPost
};