const prisma = require('../config/prismaClient');
const { attachLikeInfo } = require('../utils/attachLikeInfo');

const getComments = async (req, res) => {
    const postId = req.params.postId;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    const comments = await prisma.comment.findMany({
        where: { postId },
        include: {
            _count: { select: { likes: true } },
            author: { select: { id: true, username: true, pfpUrl: true } }, likes: true
        },
        orderBy: { createdAt: 'asc' },
    });

    const enrichedComments = await attachLikeInfo(comments, req.user?.id, 'comment');

    res.json(enrichedComments);
};

const addComment = async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.postId;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    if (content && content.length > 500) {
        return res.status(400).json({ message: 'Comment content cannot exceed 500 characters' });
    }

    const newComment = await prisma.comment.create({
        data: {
            content,
            authorId: userId,
            postId,
        }
    });

    const enrichedComment = await attachLikeInfo([newComment], userId, 'comment');

    res.status(201).json(enrichedComment[0]);
};

const deleteComment = async (req, res) => {
    const commentId = req.params.commentId;
    const userId = req.user.id;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.authorId !== userId) {
        return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ message: 'Comment deleted successfully' });
};

const updateComment = async (req, res) => {
    const commentId = req.params.commentId;
    const userId = req.user.id;
    const { content } = req.body;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.authorId !== userId) {
        return res.status(403).json({ message: 'Unauthorized to edit this comment' });
    }

    if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    if (content && content.length > 500) {
        return res.status(400).json({ message: 'Comment content cannot exceed 500 characters' });
    }

    const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: { content },
    });

    const enrichedComment = await attachLikeInfo([updatedComment], userId, 'comment');

    res.json(enrichedComment[0]);
};

const toggleLike = async (req, res) => {
    const userId = req.user.id;
    const commentId = req.params.commentId;

    const existingLike = await prisma.commentLike.findUnique({
        where: {
            userId_commentId: {
                userId,
                commentId
            }
        }
    });

    if (existingLike) {
        await prisma.commentLike.delete({
            where: {
                userId_commentId: {
                    userId,
                    commentId
                }
            }
        });

        return res.json({ liked: false, likeCount: await prisma.commentLike.count({ where: { commentId } }) });
    }

    try {
        await prisma.commentLike.create({
            data: {
                userId,
                commentId
            }
        });

        const likeCount = await prisma.commentLike.count({
            where: { commentId }
        });

        return res.json({ liked: true, likeCount });
    } catch (err) {
        if (err?.code === "P2002") {
            const likeCount = await prisma.commentLike.count({ where: { commentId } });
            return res.json({ liked: true, likeCount });
        }
        throw err;
    }
};

module.exports = {
    getComments,
    addComment,
    deleteComment,
    updateComment,
    toggleLike,
};