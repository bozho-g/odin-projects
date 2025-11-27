const { requireAuthor, requireAuth, optionalAuth } = require('../util/authUtil');
const router = require('express').Router();
const prisma = require('../util/prismaClient');
const { validationResult, body } = require('express-validator');
const asyncHandler = require('../util/asyncHandler');
const HttpError = require('../util/httpError');

const select = {
    id: true,
    title: true,
    content: true,
    createdAt: true,
    published: true,
    author: {
        select: { username: true }
    },
    comments: {
        select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
                select: { username: true }
            },
        }
    }
};

router.get('/', requireAuth, requireAuthor, asyncHandler(async (req, res) => {
    const posts = await prisma.post.findMany({
        select,
        orderBy: { createdAt: "desc" }
    });

    res.json(posts);
}));

router.get('/published', asyncHandler(async (req, res) => {
    const posts = await prisma.post.findMany({
        where: { published: true },
        select,
        orderBy: { createdAt: "desc" }
    });

    res.json(posts);
}));

router.get('/published/:id', asyncHandler(async (req, res) => {
    const postId = parseInt(req.params.id);

    const post = await prisma.post.findFirst({
        where: {
            id: postId,
            published: true
        },
        select: {
            ...select,
            published: false
        }
    });

    if (!post) {
        throw HttpError.notFound('Post not found.');
    }

    res.json(
        post
    );
}));

router.get('/:id', requireAuth, requireAuthor, asyncHandler(async (req, res) => {
    const postId = parseInt(req.params.id);

    const post = await prisma.post.findFirst({
        where: {
            id: postId
        },
        select
    });

    if (!post) {
        throw HttpError.notFound('Post not found.');
    }

    res.json(
        post
    );
}));

router.post('/', requireAuth, requireAuthor,
    body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters long').escape(),
    body('content').trim().isLength({ min: 20 }).withMessage('Content must be at least 20 characters long').escape(),
    body('published').isBoolean().withMessage('Published must be a boolean value'),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, content, published } = req.body;
        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                published: published || false,
                authorId: req.user.id
            },
            include: {
                author: { select: { username: true } },
                comments: {
                    select: {
                        content: true,
                        createdAt: true,
                        author: { select: { username: true } }
                    }
                }
            }
        });

        res.status(201).json(newPost);
    }));

router.put('/:id', requireAuth, requireAuthor,
    body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters long').escape(),
    body('content').trim().isLength({ min: 20 }).withMessage('Content must be at least 20 characters long').escape(),
    body('published').isBoolean().withMessage('Published must be a boolean value'),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const postId = req.params.id;
        const { title, content, published } = req.body;
        const updatedPost = await prisma.post.update({
            where: { id: parseInt(postId) },
            data: {
                title,
                content,
                published
            },
            include: {
                author: { select: { username: true } },
                comments: {
                    select: {
                        content: true,
                        createdAt: true,
                        author: { select: { username: true } }
                    }
                }
            }
        });

        res.json(updatedPost);
    }));

router.delete('/:id', requireAuth, requireAuthor, asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const deletedPost = await prisma.post.deleteMany({
        where: { id: parseInt(postId) }
    });
    res.json(deletedPost);
}));

router.post('/:id/toggle', requireAuth, requireAuthor, asyncHandler(async (req, res) => {
    const postId = parseInt(req.params.id);

    const post = await prisma.post.findUnique({
        where: { id: postId },
        select
    });

    if (!post) {
        throw HttpError.notFound('Post not found');
    }

    const updated = await prisma.post.update({
        where: { id: postId },
        data: { published: !post.published },
        select
    });

    res.json(updated);
}));

router.post('/toggle-all', requireAuth, requireAuthor, asyncHandler(async (req, res) => {
    const toggle = req.body.publish;

    if (typeof toggle !== 'boolean') {
        throw HttpError.badRequest('publish flag must be boolean');
    }

    await prisma.post.updateMany({
        data: { published: toggle },
        where: { published: !toggle }
    });

    const posts = await prisma.post.findMany({
        select
    });

    res.json(posts);
}));

router.post('/:id/comments', requireAuth, asyncHandler(async (req, res) => {
    const postId = parseInt(req.params.id);
    const { content } = req.body;

    if (!content) {
        throw HttpError.badRequest('Cannot add empty comment.');
    }

    await prisma.comment.create({
        data: {
            content,
            postId: postId,
            authorId: req.user.id
        }
    });

    res.status(201).json({ message: 'Comment added successfully.' });
}));

router.delete('/:postId/comments/:commentId', requireAuth, asyncHandler(async (req, res) => {
    const { postId, commentId } = req.params;
    const comment = await prisma.comment.findUnique({
        where: { id: parseInt(commentId) },
        select: { id: true, authorId: true, postId: true }
    });

    if (!comment || comment.postId !== parseInt(postId)) {
        throw HttpError.notFound('Comment not found.');
    }

    const isAuthor = req.user.role === 'AUTHOR' || comment.authorId === req.user.id;
    if (!isAuthor) {
        throw HttpError.forbidden('You cannot delete this comment.');
    }

    await prisma.comment.delete({
        where: {
            id: comment.id
        }
    });

    res.status(204).end();
}));

module.exports = router;