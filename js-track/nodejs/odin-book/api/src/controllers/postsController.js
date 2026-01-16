const prisma = require('../config/prismaClient');
const { attachLikeInfo } = require('../utils/attachLikeInfo');
const cloudinaryController = require('./cloudinaryController');

const authorSelect = {
    id: true,
    username: true,
    pfpUrl: true,
};

const getAllPosts = async (req, res) => {
    const userId = req.user?.id;

    const posts = await prisma.post.findMany({
        include: {
            author: {
                select: authorSelect
            },
            _count: {
                select: {
                    likes: true,
                    comments: true
                }
            },
        },
        orderBy: { createdAt: 'desc' }
    });

    const enrichedPosts = await attachLikeInfo(posts, userId);

    res.json(enrichedPosts);
};

const getPostById = async (req, res) => {
    const postId = req.params.postId;
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
            author: {
                select: authorSelect
            },
            _count: { select: { likes: true, comments: true } },
            likes: true,
        },
    });

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    const enrichedPost = await attachLikeInfo([post], req.user?.id);

    res.json(enrichedPost[0]);
};

const getUserPosts = async (req, res) => {
    const userId = req.params.userId;
    const posts = await prisma.post.findMany({
        where: { authorId: userId },
        include: {
            author: { select: authorSelect },
            _count: {
                select: {
                    likes: true,
                    comments: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const enrichedPosts = await attachLikeInfo(posts, req.user?.id);

    res.json(enrichedPosts);
};

const getUserPostsByUsername = async (req, res) => {
    const username = req.params.username;

    const posts = await prisma.post.findMany({
        where: { author: { username } },
        include: {
            author: { select: authorSelect },
            _count: {
                select: {
                    likes: true,
                    comments: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const enrichedPosts = await attachLikeInfo(posts, req.user?.id);

    res.json(enrichedPosts);
};

const getFollowedPosts = async (req, res) => {
    const userId = req.user.id;
    const followedUsers = await prisma.follow.findMany({
        where: { followerId: userId, status: 'ACCEPTED' },
        select: { followeeId: true },
    });

    const followedIds = followedUsers.map(follow => follow.followeeId);
    followedIds.push(userId);

    const posts = await prisma.post.findMany({
        where: { authorId: { in: followedIds } },
        include: {
            author: {
                select: authorSelect
            },
            _count: {
                select: {
                    likes: true,
                    comments: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const enrichedPosts = await attachLikeInfo(posts, userId);

    res.json(enrichedPosts);
};

const createPost = async (req, res) => {
    const { content, imageUrl, imagePublicId } = req.body;
    const authorId = req.user.id;

    if (!content && !imageUrl) {
        return res.status(400).json({ message: 'Post content or image is required' });
    }

    if (content && content.length > 500) {
        return res.status(400).json({ message: 'Post content cannot exceed 500 characters' });
    }

    const newPost = await prisma.post.create({
        data: {
            content,
            authorId,
            imageUrl,
            imagePublicId,
        },
    });

    res.status(201).json(newPost);
};

const deletePost = async (req, res) => {
    const postId = req.params.postId;
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }

    await prisma.post.delete({ where: { id: postId } });
    await cloudinaryController.deletePicture(post.imagePublicId);
    res.json({ message: 'Post deleted successfully' });
};

const editPost = async (req, res) => {
    const postId = req.params.postId;
    const { content, imageUrl, imagePublicId } = req.body;
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized to edit this post' });
    }

    if (!content && !imageUrl) {
        return res.status(400).json({ message: 'Post content or image is required' });
    }

    if (content && content.length > 500) {
        return res.status(400).json({ message: 'Post content cannot exceed 500 characters' });
    }

    if (imagePublicId !== post.imagePublicId && post.imagePublicId) {
        await cloudinaryController.deletePicture(post.imagePublicId);
    }

    const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { content, imageUrl, imagePublicId },
    });

    res.json(updatedPost);
};

const toggleLike = async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.postId;

    const existingLike = await prisma.like.findUnique({
        where: {
            userId_postId: {
                userId,
                postId
            }
        }
    });

    if (existingLike) {
        await prisma.like.delete({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        return res.json({ liked: false, likeCount: await prisma.like.count({ where: { postId } }) });
    }

    try {
        await prisma.like.create({
            data: {
                userId,
                postId
            }
        });

        const likeCount = await prisma.like.count({
            where: { postId }
        });

        return res.json({ liked: true, likeCount });
    } catch (err) {
        if (err?.code === "P2002") {
            const likeCount = await prisma.like.count({ where: { postId } });
            return res.json({ liked: true, likeCount });
        }
        throw err;
    }
};

module.exports = {
    getAllPosts,
    getUserPosts,
    getUserPostsByUsername,
    getFollowedPosts,
    getPostById,
    createPost,
    deletePost,
    editPost,
    toggleLike,
};