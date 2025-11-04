const query = require('../db/pool');
async function findAllCategories() {
    const categories = await query('SELECT * FROM categories');
    return categories.rows;
}

async function createCategory(name) {
    const result = await query('INSERT INTO categories (name) VALUES ($1)', [name]);
    return result.rows[0];
}

async function updateCategory(id, name) {
    const result = await query('UPDATE categories SET name = $1 WHERE id = $2', [name, id]);
    return result.rows[0];
}

async function deleteCategory(id) {
    const result = await query('DELETE FROM categories WHERE id = $1', [id]);
    return result.rows[0];
}

module.exports = {
    findAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};