const userRoutes = require('../routes/users');
const postRoutes = require('../routes/posts');
const commentRoutes = require('../routes/comments');
const followsRoutes = require('../routes/follows');
const cloudinaryRoutes = require('../routes/cloudinary');

const configureRoutes = (app) => {
    app.use('/users', userRoutes);
    app.use('/posts', postRoutes);
    app.use('/comments', commentRoutes);
    app.use('/follows', followsRoutes);
    app.use('/cloudinary', cloudinaryRoutes);

    app.use((req, res) => {
        res.status(404).json({ message: 'Not Found' });
    });
};

module.exports = { configureRoutes };