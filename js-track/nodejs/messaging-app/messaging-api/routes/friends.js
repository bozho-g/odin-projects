const router = require('express').Router();
const prisma = require('../util/prismaClient');
const requireAuth = require('../middleware/authGuard');
const { emitFriendRequestNew, emitFriendRequestUpdated } = require('../util/socket');

router.get('/', requireAuth, async (req, res) => {
  const me = Number(req.user.id);

  const rows = await prisma.$queryRaw`
      SELECT u.id, u.username, u.display_name, u.pfp_url, u.last_seen,
             (u.last_seen >= NOW() - INTERVAL '2 minutes') AS online
      FROM users u
      JOIN friend_requests fr
        ON (
          (fr.from_user_id = u.id AND fr.to_user_id = ${me})
          OR
          (fr.to_user_id = u.id AND fr.from_user_id = ${me})
        )
      WHERE fr.status = 'accepted'
      ORDER BY u.username
    `;

  const out = rows.map((u) => ({
    id: Number(u.id),
    username: u.username,
    displayName: u.display_name,
    pfpUrl: u.pfp_url,
    online: Boolean(u.online),
    lastSeen: u.last_seen,
  }));

  return res.json(out);
});

router.get('/incoming', requireAuth, async (req, res) => {
  const me = Number(req.user.id);

  const rows = await prisma.$queryRaw`
    SELECT fr.id, fr.from_user_id, u.username, u.display_name, u.pfp_url
    FROM friend_requests fr
    JOIN users u ON u.id = fr.from_user_id
    WHERE fr.to_user_id = ${me} AND fr.status = 'pending'
    ORDER BY fr.created_at DESC
  `;

  const out = rows.map((r) => ({
    id: Number(r.from_user_id),
    requestId: Number(r.id),
    username: r.username,
    displayName: r.display_name,
    pfpUrl: r.pfp_url,
  }));

  return res.json(out);
});

router.get('/search', requireAuth, async (req, res) => {
  const me = Number(req.user.id);
  const query = (req.query.q || "").toString().trim();

  if (query.length < 1) {
    return res.json([]);
  }

  const users = await prisma.users.findMany({
    where: {
      AND: [
        {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { display_name: { contains: query, mode: 'insensitive' } },
          ],
        },
        { id: { not: me } },
      ],
    },
    take: 20
  });

  const out = users.map((u) => ({
    id: Number(u.id),
    username: u.username,
    displayName: u.display_name,
    pfpUrl: u.pfp_url,
  }));

  return res.json(out);
});

router.post('/send', requireAuth, async (req, res) => {
  const userId = Number(req.user.id);
  const toUserId = Number(req.body.toUserId ?? 0);

  if (toUserId <= 0 || toUserId === userId || isNaN(toUserId) || !Number.isInteger(toUserId)) {
    return res.status(400).json({ message: "Invalid user" });
  }

  const friendship = await prisma.friend_requests.findFirst({
    where: {
      OR: [
        { from_user_id: userId, to_user_id: toUserId },
        { from_user_id: toUserId, to_user_id: userId },
      ],
      status: { in: ['pending', 'accepted'] },
    },
  });

  if (friendship) {
    return res.status(400).json({ message: "Friend request already exists or you are already friends" });
  }

  const request = await prisma.friend_requests.create({
    data: {
      from_user_id: userId,
      to_user_id: toUserId,
      status: 'pending',
    },
  });

  const fromUser = await prisma.users.findUnique({ where: { id: userId } });

  emitFriendRequestNew(toUserId, {
    id: Number(request.id),
    fromUserId: userId,
    username: fromUser.username,
    displayName: fromUser.display_name,
    pfpUrl: fromUser.pfp_url,
  });

  return res.json({ id: Number(request.id), status: request.status });
});

router.post('/accept', requireAuth, async (req, res) => {
  const me = Number(req.user.id);
  const requestId = Number(req.body.requestId ?? 0);

  if (!requestId || !Number.isInteger(requestId) || requestId <= 0) {
    return res.status(400).json({ message: 'Invalid requestId' });
  }

  const request = await prisma.friend_requests.findUnique({
    where: { id: requestId },
  });

  if (!request || request.to_user_id !== me || request.status !== 'pending') {
    return res.status(404).json({ message: 'Request not found or already handled' });
  }

  await prisma.friend_requests.update({
    where: { id: requestId },
    data: { status: 'accepted' },
  });

  emitFriendRequestUpdated([me, request.from_user_id], {
    requestId,
    status: 'accepted',
  });

  return res.json({ message: 'Friend request accepted' });
});

router.post('/decline', requireAuth, async (req, res) => {
  const me = Number(req.user.id);
  const requestId = Number(req.body.requestId ?? 0);

  if (!requestId || !Number.isInteger(requestId) || requestId <= 0) {
    return res.status(400).json({ message: 'Invalid requestId' });
  }

  const request = await prisma.friend_requests.findUnique({
    where: { id: requestId },
  });

  if (!request || request.to_user_id !== me || request.status !== 'pending') {
    return res.status(404).json({ message: 'Request not found or already handled' });
  }

  await prisma.friend_requests.update({
    where: { id: requestId },
    data: { status: 'declined' },
  });

  emitFriendRequestUpdated([me, request.from_user_id], {
    requestId,
    status: 'declined',
  });

  return res.json({ message: 'Friend request declined' });
});

router.post('/remove', requireAuth, async (req, res) => {
  const me = Number(req.user.id);
  const userId = Number(req.body.userId ?? 0);

  if (userId <= 0 || userId === me || isNaN(userId) || !Number.isInteger(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  const friendship = await prisma.friend_requests.findFirst({
    where: {
      OR: [
        { from_user_id: me, to_user_id: userId },
        { from_user_id: userId, to_user_id: me },
      ],
      status: 'accepted',
    },
  });

  if (!friendship) {
    return res.status(404).json({ message: "Friendship not found" });
  }

  await prisma.friend_requests.delete({
    where: { id: friendship.id },
  });

  emitFriendRequestUpdated([me, userId], {
    requestId: friendship.id,
    status: 'removed',
  });

  return res.json({ removed: true, userId });
});

module.exports = router;
