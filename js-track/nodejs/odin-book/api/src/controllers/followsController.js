const prisma = require('../config/prismaClient');
const { attachFollowStatus } = require('../utils/followStatus');

const getIncomingFollows = async (req, res) => {
    const userId = req.user.id;
    const follows = await prisma.follow.findMany({
        where: {
            followeeId: userId,
            status: 'PENDING'
        },
        include: {
            follower: {
                select: {
                    id: true,
                    username: true,
                    pfpUrl: true
                }
            }
        }
    });

    const usersWithStatus = await attachFollowStatus(userId, follows.map(f => f.follower));

    res.json(usersWithStatus);
};

const getOutgoingFollows = async (req, res) => {
    const userId = req.user.id;
    const follows = await prisma.follow.findMany({
        where: {
            followerId: userId,
            status: 'PENDING'
        },
        include: {
            followee: {
                select: {
                    id: true,
                    username: true,
                    pfpUrl: true
                }
            }
        }
    });

    const usersWithStatus = await attachFollowStatus(userId, follows.map(f => f.followee));

    res.json(usersWithStatus);
};

const getAllFollowing = async (req, res) => {
    const username = req.query.username;
    const currUserId = req.user.id;
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const follows = await prisma.follow.findMany({
        where: { followerId: user.id, status: 'ACCEPTED' },
        include: {
            followee: {
                select: {
                    id: true,
                    username: true,
                    pfpUrl: true
                }
            },
        }
    });

    const usersWithStatus = await attachFollowStatus(currUserId, follows.map(f => f.followee));

    res.json(usersWithStatus);
};

const getAllFollowers = async (req, res) => {
    const username = req.query.username;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const follows = await prisma.follow.findMany({
        where: { followeeId: user.id, status: 'ACCEPTED' },
        include: {
            follower: {
                select: {
                    id: true,
                    username: true,
                    pfpUrl: true
                }
            }
        },
    });

    const usersWithStatus = await attachFollowStatus(req.user.id, follows.map(f => f.follower));

    res.json(usersWithStatus);
};

const sendFollowRequest = async (req, res) => {
    const followerId = req.user.id;
    const followeeId = req.params.userId;

    if (followerId === followeeId) {
        return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const existingUser = await prisma.user.findUnique({ where: { id: followeeId } });
    if (!existingUser) {
        return res.status(404).json({ message: "User to follow not found" });
    }

    const follow = await prisma.follow.upsert({
        where: {
            followerId_followeeId: {
                followerId,
                followeeId
            }
        },
        update: {
            status: 'PENDING'
        },
        create: {
            followerId,
            followeeId,
            status: 'PENDING'
        }
    });

    res.status(201).json(follow);
};

const cancelFollowRequest = async (req, res) => {
    const followerId = req.user.id;
    const followeeId = req.params.userId;

    const result = await prisma.follow.deleteMany({
        where: {
            followerId,
            followeeId,
            status: 'PENDING'
        }
    });

    if (result.count === 0) {
        return res.status(404).json({ message: "Follow request not found" });
    }

    res.json({ message: "Follow relationship removed successfully" });
};

const respondToFollowRequest = async (req, res) => {
    const followeeId = req.user.id;
    const followerId = req.params.userId;
    const { accept } = req.body;

    if (accept) {
        const updatedFollow = await prisma.follow.update({
            where: {
                followerId_followeeId: {
                    followerId,
                    followeeId
                }
            },
            data: { status: 'ACCEPTED' }
        });

        if (!updatedFollow) {
            return res.status(404).json({ message: "Follow request not found" });
        }

        return res.status(200).json({ message: "Follow request accepted" });
    }

    const result = await prisma.follow.deleteMany({
        where: {
            followerId,
            followeeId,
            status: 'PENDING'
        }
    });

    if (result.count === 0) {
        return res.status(404).json({ message: "Follow request not found" });
    }

    res.json({ message: "Follow request declined" });
};

const unFollowUser = async (req, res) => {
    const followerId = req.user.id;
    const followeeId = req.params.userId;

    const result = await prisma.follow.deleteMany({
        where: {
            followerId,
            followeeId,
            status: 'ACCEPTED'
        }
    });

    if (result.count === 0) {
        return res.status(404).json({ message: "Follow relationship not found" });
    }

    res.json({ message: "Unfollowed user successfully" });
};

const removeFollower = async (req, res) => {
    const followeeId = req.user.id;
    const followerId = req.params.userId;

    const result = await prisma.follow.deleteMany({
        where: {
            followerId,
            followeeId,
            status: 'ACCEPTED'
        }
    });

    if (result.count === 0) {
        return res.status(404).json({ message: "Follow relationship not found" });
    }

    res.json({ message: "Follower removed successfully" });
};

module.exports = {
    getIncomingFollows,
    getOutgoingFollows,
    getAllFollowing,
    getAllFollowers,
    sendFollowRequest,
    cancelFollowRequest,
    respondToFollowRequest,
    unFollowUser,
    removeFollower
};