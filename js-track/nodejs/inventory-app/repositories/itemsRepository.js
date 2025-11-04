const query = require('../db/pool');
async function findAllItems() {
    const items = await query('SELECT * FROM items');
    return items.rows;
}

async function findItemsByCategoryId(categoryId) {
    const items = await query('SELECT * FROM items WHERE category_id = $1', [categoryId]);
    return items.rows;
}

async function filterItems(queryParams) {
    const allowedFilters = {
        category_id: '=',
        make: '=',
        model: 'IN',
        engine_type: 'IN',
        gearbox: 'IN',
        year: 'BETWEEN',
        price: 'BETWEEN',
        power_hp: 'BETWEEN'
    };

    const allowedSortFields = ['price', 'year', 'power_hp', 'mileage'];
    const allowedSortDirections = ['ASC', 'DESC'];

    const filters = {
        category_id: queryParams.category_id !== 'all' ? queryParams.category_id : null,
        make: queryParams.make || null,
        model: queryParams.model ? queryParams.model : null,
        engine_type: queryParams.engine_type ? queryParams.engine_type : null,
        gearbox: queryParams.gearbox ? queryParams.gearbox : null,
        year: {
            min: queryParams.minYear ? parseInt(queryParams.minYear) : null,
            max: queryParams.maxYear ? parseInt(queryParams.maxYear) : null
        },
        price: {
            min: queryParams.minPrice ? parseFloat(queryParams.minPrice) : null,
            max: queryParams.maxPrice ? parseFloat(queryParams.maxPrice) : null
        },
        power_hp: {
            min: queryParams.minPower ? parseInt(queryParams.minPower) : null,
            max: queryParams.maxPower ? parseInt(queryParams.maxPower) : null
        }
    };

    let baseQuery = 'SELECT * FROM items WHERE 1=1';
    const values = [];
    let index = 1;
    for (const [field, value] of Object.entries(filters)) {
        if (!allowedFilters[field] || value === null || value === '') {
            continue;
        }

        const operator = allowedFilters[field];

        if (operator === '=') {
            baseQuery += ` AND ${field} = $${index++}`;
            values.push(value);
        }
        else if (operator === 'IN') {
            const arr = Array.isArray(value) ? value : [value];
            if (arr.length === 0) {
                continue;
            }

            const placeholders = arr.map(() => `$${index++}`).join(', ');
            baseQuery += ` AND ${field} IN (${placeholders})`;
            values.push(...arr);
        } else if (operator === 'BETWEEN') {
            if (value.min != null && value.min !== '') {
                baseQuery += ` AND ${field} >= $${index++}`;
                values.push(value.min);
            }
            if (value.max != null && value.max !== '') {
                baseQuery += ` AND ${field} <= $${index++}`;
                values.push(value.max);
            }
        }
    }

    if (queryParams.sort) {
        const [field, direction] = queryParams.sort.split('-');
        if (allowedSortFields.includes(field)) {
            const dir = allowedSortDirections.includes(direction?.toUpperCase())
                ? direction.toUpperCase()
                : 'ASC';
            baseQuery += ` ORDER BY ${field} ${dir}`;
        }
    }

    // console.log('Final Query:', baseQuery, 'Values:', values);

    const items = await query(baseQuery, values);
    return items.rows;
}

async function findItemById(id) {
    const item = await query('SELECT * FROM items WHERE id = $1', [id]);
    return item.rows[0];
}

async function createItem(itemData) {
    const { categoryId, make, model, year, mileage, condition, color, power_hp, engine_size, engine_type, gearbox, title, price, imageUrl, description } = itemData;
    const result = await query(
        'INSERT INTO items (category_id, make, model, year, mileage, condition, color, power_hp, engine_size, engine_type, gearbox, title, price, images, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *',
        [categoryId, make, model, year, mileage, condition, color, power_hp, engine_size, engine_type, gearbox, title, price, [imageUrl], description]
    );
    return result.rows[0];
}

async function deleteItem(id) {
    await query('DELETE FROM items WHERE id = $1', [id]);
}

async function updateItem(id, itemData) {
    const { categoryId, make, model, year, mileage, condition, color, power_hp, engine_size, engine_type, gearbox, title, price, imageUrl, description } = itemData;
    const result = await query(
        'UPDATE items SET category_id = $1, make = $2, model = $3, year = $4, mileage = $5, condition = $6, color = $7, power_hp = $8, engine_size = $9, engine_type = $10, gearbox = $11, title = $12, price = $13, images = $14, description = $15 WHERE id = $16 RETURNING *',
        [categoryId, make, model, year, mileage, condition, color, power_hp, engine_size, engine_type, gearbox, title, price, [imageUrl], description, id]
    );
    return result.rows[0];
}

module.exports = {
    findAllItems,
    findItemsByCategoryId,
    filterItems,
    createItem,
    findItemById,
    deleteItem,
    updateItem
};