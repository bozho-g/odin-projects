const prisma = require('../config/prismaClient');

async function attachFollowStatus(currUserId, profiles) {
    if (!profiles || profiles.length === 0) {
        return profiles;
    }

    const filteredProfiles = profiles.filter(p => p.id !== currUserId);

    if (filteredProfiles.length === 0) {
        return profiles;
    }

    const followStatus = await prisma.follow.findMany({
        where: {
            OR: [
                { followerId: currUserId, followeeId: { in: filteredProfiles.map(p => p.id) } },
                { followerId: { in: filteredProfiles.map(p => p.id) }, followeeId: currUserId }
            ]
        },
    });

    profiles.forEach(profile => {
        if (profile.id === currUserId) {
            profile.followStatus = 'self';
            return;
        }

        const followeeId = profile.id;

        const yourFollow = followStatus.find(f => f.followerId === currUserId && f.followeeId === followeeId);
        const theirFollow = followStatus.find(f => f.followerId === followeeId && f.followeeId === currUserId);

        const yourStatus = yourFollow?.status;
        const theirStatus = theirFollow?.status;

        if (!yourStatus && !theirStatus) {
            profile.followStatus = 'none';
        } else if (yourStatus === 'ACCEPTED' && theirStatus === 'ACCEPTED') {
            profile.followStatus = 'mutual_accepted';
        } else if (yourStatus === 'ACCEPTED' && theirStatus === 'PENDING') {
            profile.followStatus = 'incoming_pending_followee';
        } else if (yourStatus === 'ACCEPTED' && !theirStatus) {
            profile.followStatus = 'followee_accepted';
        } else if (yourStatus === 'PENDING' && theirStatus === 'ACCEPTED') {
            profile.followStatus = 'outgoing_pending_follower';
        } else if (yourStatus === 'PENDING' && theirStatus === 'PENDING') {
            profile.followStatus = 'mutual_pending';
        } else if (yourStatus === 'PENDING' && !theirStatus) {
            profile.followStatus = 'outgoing_pending';
        } else if (!yourStatus && theirStatus === 'ACCEPTED') {
            profile.followStatus = 'follower_accepted';
        } else if (!yourStatus && theirStatus === 'PENDING') {
            profile.followStatus = 'incoming_pending';
        } else {
            profile.followStatus = 'none';
        }
    });

    return profiles;
}

module.exports = { attachFollowStatus };