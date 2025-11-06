const { query } = require('../db/pool');

const getAllPosts = async () => {
    const posts = await query('SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC');
    return posts.rows;
};

const createPost = async (userId, title, content) => {
    await query('INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3)', [userId, title, content]);
};

module.exports = {
    getAllPosts,
    createPost,
};