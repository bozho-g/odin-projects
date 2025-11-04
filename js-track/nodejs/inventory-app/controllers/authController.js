const bcrypt = require('bcrypt');
const query = require('../db/pool');

async function checkAdminPassword(password) {
    const result = await query('SELECT password_hash FROM admin_config LIMIT 1');

    if (result.rows.length === 0) {
        return false;
    }

    return await bcrypt.compare(password, result.rows[0].password_hash);
}

async function isAdmin(password) {
    const result = await checkAdminPassword(password);
    if (!result) {
        const error = new Error('Forbidden: Invalid admin password');
        error.statusCode = 403;
        throw error;
    }
    return true;
}

module.exports = {
    checkAdminPassword,
    isAdmin
};