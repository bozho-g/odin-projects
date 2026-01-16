const prisma = require('../config/prismaClient');

async function attachLikeInfo(items, userId, type = 'post') {
    if (!Array.isArray(items) || items.length === 0 || !userId) {
        return items;
    }

    const likedIds = userId ?
        type === 'post'
            ? (await prisma.like.findMany({
                where: { userId, postId: { in: items.map(item => item.id) } },
                select: { postId: true },
            })).map(like => like.postId)
            :
            (await prisma.commentLike.findMany({
                where: { userId, commentId: { in: items.map(item => item.id) } },
                select: { commentId: true },
            })).map(like => like.commentId)
        : [];


    return items.map(item => {
        item.likedByMe = likedIds.includes(item.id);
        return item;
    });
}


module.exports = { attachLikeInfo };