const postsRepo = require("../repositories/postsRepository");
const { validationResult } = require('express-validator');

const getPosts = async (req, res) => {
    const posts = await postsRepo.getAllPosts();

    res.render('posts/index', { posts, user: req.user, generateGibberish });
};

const getCreatePost = (req, res) => {
    res.render('posts/create', { title: '', content: '', errors: [] });
};

const postCreatePost = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('posts/create', {
            errors: errors.array(),
            title: req.body.title || '',
            content: req.body.content || ''
        });
    }

    const { title, content } = req.body;

    await postsRepo.createPost(req.user.id, title, content);
    res.redirect('/');
};

function generateGibberish(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

module.exports = {
    getPosts,
    getCreatePost,
    postCreatePost
};