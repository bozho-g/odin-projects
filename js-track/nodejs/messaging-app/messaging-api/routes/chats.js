const router = require('express').Router();
const prisma = require('../util/prismaClient');
const requireAuth = require('../middleware/authGuard');
const {
    emitChatNew,
    emitChatUpdated,
    emitChatDeleted,
    emitChatMemberLeft,
    emitChatMemberAdded,
    emitChatMemberRemoved,
    emitMessageNew,
    emitMessageEdited,
    emitMessageDeleted,
} = require('../util/socket');
const crypto = require('crypto');

function extractPathFromUrl(url, bucket) {
    if (!url || typeof url !== 'string') return null;

    if (!/^https?:\/\//i.test(url)) {
        return url.replace(/^\/+/, '');
    }

    let pathname = null;
    try {
        pathname = new URL(url).pathname;
    } catch {
        return null;
    }

    if (!pathname) return null;

    const publicPrefix = `/storage/v1/object/public/${bucket}/`;
    const privatePrefix = `/storage/v1/object/${bucket}/`;

    if (pathname.startsWith(publicPrefix)) {
        return pathname.slice(publicPrefix.length);
    }
    if (pathname.startsWith(privatePrefix)) {
        return pathname.slice(privatePrefix.length);
    }

    const needle = `/${bucket}/`;
    const pos = pathname.indexOf(needle);
    if (pos !== -1) {
        return pathname.slice(pos + needle.length);
    }

    return null;
}

async function handleSendMessage(req, res) {
    const chatId = Number(req.body.chatId ?? 0);
    const meId = Number(req.user.id);
    const text = req.body.text || '';
    const attachmentUrl = req.body.attachmentUrl || null;
    const attachmentType = req.body.attachmentType || null;

    if (!Number.isInteger(chatId) || chatId <= 0 || (!text && !attachmentUrl)) {
        return res.status(400).json({ message: "Invalid input" });
    }

    if (text && text.length > 2000) {
        return res.status(400).json({ message: "Text too long" });
    }

    if (attachmentUrl && attachmentType && !String(attachmentType).toLowerCase().startsWith("image/")) {
        return res.status(400).json({ message: "Only image attachments allowed" });
    }

    if (attachmentUrl && !attachmentType) {
        return res.status(400).json({ message: "attachmentType required when attachmentUrl provided" });
    }

    const participant = await prisma.chat_participants.findUnique({
        where: { chat_id_user_id: { chat_id: chatId, user_id: meId } },
        select: { role: true },
    });

    if (!participant) {
        return res.status(403).json({ message: "Not a participant" });
    }

    const newMessage = await prisma.messages.create({
        data: {
            chat_id: chatId,
            sender_id: meId,
            text: text,
            attachment_url: attachmentUrl,
            attachment_type: attachmentType,
        },
        include: {
            users: {
                select: {
                    username: true,
                    display_name: true,
                    pfp_url: true,
                },
            },
        },
    });

    const messagePayload = {
        id: Number(newMessage.id),
        text: newMessage.text,
        senderId: Number(newMessage.sender_id),
        senderUsername: newMessage.users?.username,
        senderName: newMessage.users?.display_name,
        senderPfp: newMessage.users?.pfp_url,
        senderRole: participant.role ?? null,
        attachmentUrl: newMessage.attachment_url,
        attachmentType: newMessage.attachment_type,
        createdAt: newMessage.created_at,
        editedAt: newMessage.edited_at,
    };

    emitMessageNew(chatId, messagePayload);

    return res.status(201).json({
        id: Number(newMessage.id),
        text: newMessage.text,
        senderId: Number(newMessage.sender_id),
        senderName: newMessage.users?.display_name,
        attachmentUrl: newMessage.attachment_url,
        attachmentType: newMessage.attachment_type,
        createdAt: newMessage.created_at,
        editedAt: newMessage.edited_at,
    });
}

async function handleEditMessage(req, res) {
    const meId = Number(req.user.id);
    const messageId = Number(req.body.messageId ?? 0);
    const newText = req.body.text || '';

    if (messageId <= 0 || !newText || newText.length > 2000) {
        return res.status(400).json({ message: "Invalid input" });
    }

    const message = await prisma.messages.findUnique({
        where: { id: messageId },
        select: { id: true, sender_id: true, chat_id: true },
    });

    if (!message) {
        return res.status(404).json({ message: "Message not found" });
    }

    if (Number(message.sender_id) !== meId) {
        return res.status(403).json({ message: "Can only edit your own messages" });
    }

    const updated = await prisma.messages.update({
        where: { id: messageId },
        data: { text: newText, edited_at: new Date() },
    });

    emitMessageEdited(Number(message.chat_id), Number(updated.id), updated.text, updated.edited_at);

    return res.json({
        id: Number(updated.id),
        text: updated.text,
        senderId: Number(updated.sender_id),
        attachmentUrl: updated.attachment_url,
        attachmentType: updated.attachment_type,
        createdAt: updated.created_at,
        editedAt: updated.edited_at,
    });
}

async function handleDeleteMessage(req, res) {
    const meId = Number(req.user.id);
    const messageId = Number(req.body.messageId ?? 0);

    if (messageId <= 0) {
        return res.status(400).json({ message: "Invalid input" });
    }

    const message = await prisma.messages.findUnique({
        where: { id: messageId },
        select: { id: true, chat_id: true, sender_id: true, attachment_url: true },
    });

    if (!message) {
        return res.status(404).json({ message: "Message not found" });
    }

    if (Number(message.sender_id) !== meId) {
        return res.status(403).json({ message: "Can only delete your own messages" });
    }

    const chatId = Number(message.chat_id);
    const attachmentUrl = message.attachment_url;

    await prisma.messages.delete({
        where: { id: messageId },
    });

    const bucket = process.env.SUPABASE_ATTACH_BUCKET || 'attachments';
    const supaUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (attachmentUrl && supaUrl && serviceKey) {
        const attachmentPath = extractPathFromUrl(attachmentUrl, bucket);

        if (attachmentPath) {
            const encodedPath = attachmentPath
                .split('/')
                .map((seg) => encodeURIComponent(seg))
                .join('/');

            const deleteUrl = `${supaUrl}/storage/v1/object/${bucket}/${encodedPath}`;
            try {
                const resp = await fetch(deleteUrl, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${serviceKey}`,
                    },
                });

                if (!resp.ok) {
                    const text = await resp.text().catch(() => '');
                    console.error(`Supabase delete failed for ${deleteUrl}, status ${resp.status}, response: ${text}`);
                }
            } catch (err) {
                console.error('Supabase delete request failed:', err);
            }
        }
    }

    emitMessageDeleted(chatId, messageId);

    return res.json({
        messageId,
        deleted: true,
    });
}

router.get('/', requireAuth, async (req, res) => {
    const userId = req.user.id;

    const chats = await prisma.chats.findMany({
        where: {
            chat_participants: {
                some: { user_id: Number(userId) }
            }
        },
        orderBy: { created_at: 'desc' },
        include: {
            chat_participants: {
                include: { users: true }
            }
        }
    });

    const out = chats.map((c) => ({
        id: Number(c.id),
        name: c.name,
        isGroup: Boolean(c.is_group),
        createdAt: c.created_at,
        participants: (c.chat_participants).map((cp) => {
            const u = cp.users;
            return {
                id: Number(u.id),
                username: u.username,
                displayName: u.display_name,
                pfpUrl: u.pfp_url,
                lastSeen: u.last_seen,
                online: Boolean(u.last_seen && (new Date(u.last_seen) >= new Date(Date.now() - 2 * 60 * 1000))),
                role: cp.role || null,
            };
        })
    }));

    res.json(out);
});

router.post('/create-dm', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const otherUserId = req.body.otherUserId;

    if (otherUserId <= 0 || otherUserId === userId || isNaN(otherUserId) || !Number.isInteger(otherUserId)) {
        return res.status(400).json({ message: "Invalid otherUserId" });
    }

    const otherUser = await prisma.users.findUnique({
        where: { id: Number(otherUserId) }
    });

    if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const existingChat = await prisma.chats.findFirst({
        where: {
            is_group: false,
            chat_participants: {
                every: {
                    user_id: { in: [Number(userId), Number(otherUserId)] }
                }
            }
        },
        include: {
            chat_participants: {
                include: { users: true }
            }
        }
    });

    if (existingChat) {
        const out = {
            id: Number(existingChat.id),
            name: existingChat.name,
            isGroup: Boolean(existingChat.is_group),
            createdAt: existingChat.created_at,
            participants: (existingChat.chat_participants).map((cp) => {
                const u = cp.users;
                return {
                    id: Number(u.id),
                    username: u.username,
                    displayName: u.display_name,
                    pfpUrl: u.pfp_url,
                    lastSeen: u.last_seen,
                    online: Boolean(u.last_seen && (new Date(u.last_seen) >= new Date(Date.now() - 2 * 60 * 1000))),
                    role: cp.role || null,
                };
            })
        };

        return res.json(out);
    }

    const newChat = await prisma.chats.create({
        data: {
            is_group: false,
            chat_participants: {
                create: [
                    { user_id: Number(userId), role: 'member' },
                    { user_id: Number(otherUserId), role: 'member' }
                ]
            },
            created_by: Number(userId)
        }
    });

    const chatWithParticipants = await prisma.chats.findFirst({
        where: { id: Number(newChat.id) },
        include: {
            chat_participants: {
                include: { users: true }
            }
        }
    });

    const out = {
        id: Number(chatWithParticipants.id),
        name: chatWithParticipants.name,
        isGroup: Boolean(chatWithParticipants.is_group),
        createdAt: chatWithParticipants.created_at,
        created: true,
        participants: (chatWithParticipants.chat_participants).map((cp) => {
            const u = cp.users;
            return {
                id: Number(u.id),
                username: u.username,
                displayName: u.display_name,
                pfpUrl: u.pfp_url,
                lastSeen: u.last_seen,
                online: Boolean(u.last_seen && (new Date(u.last_seen) >= new Date(Date.now() - 2 * 60 * 1000))),
                role: cp.role || null,
            };
        })
    };

    emitChatNew([Number(userId), Number(otherUserId)], out);

    res.status(201).json(out);
});

router.post('/create-group', requireAuth, async (req, res) => {
    const userId = req.user.id;
    let { name, members } = req.body;

    let membersIds = members.map(m => m[0]);

    if (!name || typeof name !== 'string' || name.length < 1 || name.length > 64) {
        name = members.map(m => m[1]).join(", ");
    }

    if (!membersIds.includes(Number(userId))) {
        membersIds.push(Number(userId));
    }

    if (!Array.isArray(members) || membersIds.length < 3) {
        return res.status(400).json({ message: "At least 3 members required to create a group chat" });
    }

    const foundMembers = await prisma.users.findMany({
        where: { id: { in: membersIds } }
    });

    if (foundMembers.length !== membersIds.length) {
        return res.status(400).json({ message: "Some members not found" });
    }

    const newChat = await prisma.chats.create({
        data: {
            name: name,
            is_group: true,
            chat_participants: {
                create: membersIds.map(id => ({
                    user_id: id, role: id === Number(userId) ? 'admin' : 'member'
                }))
            },
            created_by: Number(userId)
        }
    });

    const chatWithParticipants = await prisma.chats.findFirst({
        where: { id: Number(newChat.id) },
        include: {
            chat_participants: {
                include: { users: true }
            }
        }
    });
    const out = {
        id: Number(chatWithParticipants.id),
        name: chatWithParticipants.name,
        isGroup: Boolean(chatWithParticipants.is_group),
        createdAt: chatWithParticipants.created_at,
        participants: (chatWithParticipants.chat_participants).map((cp) => {
            const u = cp.users;
            return {
                id: Number(u.id),
                username: u.username,
                displayName: u.display_name,
                pfpUrl: u.pfp_url,
                role: cp.role || null,
            };
        })
    };

    emitChatNew(membersIds, out);

    res.status(201).json(out);
});

router.patch('/rename', requireAuth, async (req, res) => {
    const { chatId, name } = req.body;

    if (!name || typeof name !== 'string' || name.length < 1 || name.length > 64 || !chatId || isNaN(chatId) || !Number.isInteger(chatId) || chatId <= 0) {
        return res.status(400).json({ message: "Invalid input" });
    }

    const chat = await prisma.chats.findUnique({
        where: { id: Number(chatId) }
    });

    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.is_group) {
        return res.status(400).json({ message: "Rename only allowed for groups" });
    }

    const updated = await prisma.chats.update({
        where: { id: Number(chatId) },
        data: { name: name }
    });

    emitChatUpdated(Number(chatId), { name: name });

    res.json({ id: Number(updated.id), name: updated.name, isGroup: Boolean(updated.is_group) });
});

router.post('/attachment-signed-url', requireAuth, async (req, res) => {
    const me = Number(req.user.id);
    const chatId = Number(req.body?.chatId ?? 0);
    const filename = req.body?.filename || '';
    const mime = req.body?.mime || '';
    const size = Number(req.body?.size ?? 0);

    if (!Number.isInteger(chatId) || chatId <= 0 || !filename || typeof filename !== 'string' || typeof mime !== 'string' || !mime.startsWith('image/')) {
        return res.status(400).json({ message: 'Invalid file info' });
    }

    if (!Number.isFinite(size) || size <= 0 || size > 8 * 1024 * 1024) {
        return res.status(400).json({ message: 'File too large (max 8MB)' });
    }

    const participant = await prisma.chat_participants.findUnique({
        where: { chat_id_user_id: { chat_id: chatId, user_id: me } },
        select: { chat_id: true },
    });

    if (!participant) {
        return res.status(403).json({ message: 'Not a participant' });
    }

    const supaUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
    const bucket = process.env.SUPABASE_ATTACH_BUCKET || 'attachments';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supaUrl || !key) {
        return res.status(500).json({ message: 'Server configuration error' });
    }

    const allowedExts = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);
    const extRaw = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const ext = allowedExts.has(extRaw) ? extRaw : 'jpg';

    const path = `chat/${chatId}/${me}/${crypto.randomBytes(8).toString('hex')}.${ext}`;
    const signUrl = `${supaUrl}/storage/v1/object/upload/sign/${bucket}/${path}`;

    const resp = await fetch(signUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn: 3600 }),
    });

    const text = await resp.text();
    let data = {};
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = {};
    }

    if (!resp.ok) {
        const msg = data.error || data.message || 'Failed to create signed URL';
        return res.status(500).json({ message: msg });
    }

    return res.json({
        bucket,
        path,
        token: data.token ?? null,
        signedUrl: data.signedUrl ?? null,
    });
});

router.delete('/', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { chatId } = req.body;

    if (!chatId || isNaN(chatId) || !Number.isInteger(chatId) || chatId <= 0) {
        return res.status(400).json({ message: "Invalid chatId" });
    }

    const chat = await prisma.chats.findUnique({
        where: { id: Number(chatId) }
    });

    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.is_group) {
        return res.status(400).json({ message: "Delete only allowed for groups" });
    }

    const role = await prisma.chat_participants.findUnique({
        where: { chat_id_user_id: { chat_id: Number(chatId), user_id: Number(userId) } }
    });

    if (!role || role.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can delete the group" });
    }

    const participantIds = await prisma.chat_participants.findMany({
        where: { chat_id: Number(chatId) },
        select: { user_id: true },
    });

    await prisma.chats.deleteMany({
        where: { id: Number(chatId) }
    });

    emitChatDeleted(participantIds.map(p => Number(p.user_id)), Number(chatId));

    res.json({ chatId: Number(chatId), deleted: true });
});

router.post('/leave', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { chatId } = req.body;

    if (!chatId || isNaN(chatId) || !Number.isInteger(chatId) || chatId <= 0) {
        return res.status(400).json({ message: "Invalid chatId" });
    }

    const chat = await prisma.chats.findUnique({
        where: { id: Number(chatId) }
    });

    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.is_group) {
        return res.status(400).json({ message: "Leave only allowed for groups" });
    }

    const role = await prisma.chat_participants.findUnique({
        where: { chat_id_user_id: { chat_id: Number(chatId), user_id: Number(userId) } }
    });

    if (!role) {
        return res.status(403).json({ message: "Not a participant" });
    }

    if (role.role === 'admin') {
        const otherAdmins = await prisma.chat_participants.findMany({
            where: {
                chat_id: Number(chatId),
                user_id: { not: Number(userId) },
                role: 'admin'
            }
        });

        const otherUsers = await prisma.chat_participants.findMany({
            where: {
                chat_id: Number(chatId),
                user_id: { not: Number(userId) },
            }
        });

        if (otherAdmins.length === 0 && otherUsers.length > 0) {
            return res.status(400).json({ message: "Cannot leave as admin" });
        }
    }

    await prisma.chat_participants.deleteMany({
        where: {
            chat_id: Number(chatId),
            user_id: Number(userId)
        }
    });

    emitChatMemberRemoved(Number(chatId), Number(userId));

    res.json({ chatId: Number(chatId), left: true });
});

router.post('/add-member', requireAuth, async (req, res) => {
    const meId = req.user.id;
    const { chatId, userId } = req.body;

    if (chatId <= 0 || userId <= 0) {
        return res.status(400).json({ message: "Invalid input" });
    }

    const chat = await prisma.chats.findUnique({
        where: { id: Number(chatId) },
        include: {
            chat_participants: {
                include: { users: true }
            }
        }
    });

    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.is_group) {
        return res.status(400).json({ message: "Add member only allowed for groups" });
    }

    const meRole = await prisma.chat_participants.findUnique({
        where: { chat_id_user_id: { chat_id: Number(chatId), user_id: Number(meId) } }
    });

    if (!meRole) {
        return res.status(403).json({ message: "Not a participant" });
    }

    const userToAdd = await prisma.users.findUnique({
        where: { id: Number(userId) }
    });

    if (!userToAdd) {
        return res.status(404).json({ message: "User not found" });
    }

    const existingParticipant = await prisma.chat_participants.findUnique({
        where: { chat_id_user_id: { chat_id: Number(chatId), user_id: Number(userId) } }
    });

    if (existingParticipant) {
        return res.status(400).json({ message: "User already a participant" });
    }

    await prisma.chat_participants.create({
        data: {
            chat_id: Number(chatId),
            user_id: Number(userId),
            role: 'member'
        }
    });

    const newMember = {
        id: Number(userId),
        username: userToAdd.username,
        displayName: userToAdd.display_name,
        pfpUrl: userToAdd.pfp_url,
        role: 'member',
    };

    emitChatMemberAdded(Number(chatId), newMember, {
        id: Number(chat.id),
        name: chat.name,
        isGroup: Boolean(chat.is_group),
        createdAt: chat.created_at,
        participants: [...chat.chat_participants.map((cp) => ({
            id: Number(cp.user_id),
            username: cp.users.username,
            displayName: cp.users.display_name,
            pfpUrl: cp.users.pfp_url,
            role: cp.role,
        })), newMember],
    });

    res.json({ chatId: Number(chatId), userId: Number(userId), role: 'member' });
});

router.post('/remove-member', requireAuth, async (req, res) => {
    const meId = req.user.id;
    const { chatId, userId } = req.body;

    if (chatId <= 0 || userId <= 0) {
        return res.status(400).json({ message: "Invalid input" });
    }

    const chat = await prisma.chats.findUnique({
        where: { id: Number(chatId) }
    });

    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }
    if (!chat.is_group) {
        return res.status(400).json({ message: "Remove member only allowed for groups" });
    }

    const meRole = await prisma.chat_participants.findUnique({
        where: { chat_id_user_id: { chat_id: Number(chatId), user_id: Number(meId) } }
    });

    if (!meRole || meRole.role !== 'admin') {
        return res.status(403).json({ message: "Admin only" });
    }
    const participant = await prisma.chat_participants.findUnique({
        where: { chat_id_user_id: { chat_id: Number(chatId), user_id: Number(userId) } }
    });

    if (!participant) {
        return res.status(404).json({ message: "User not a participant" });
    }

    if (participant.role === 'admin') {
        return res.status(400).json({ message: "Cannot remove an admin" });
    }

    await prisma.chat_participants.deleteMany({
        where: {
            chat_id: Number(chatId),
            user_id: Number(userId)
        }
    });

    emitChatMemberRemoved(Number(chatId), Number(userId));

    res.json({ chatId: Number(chatId), userId: Number(userId), removed: true });
});

router.get('/messages/', requireAuth, async (req, res) => {
    const chatId = Number(req.query.chatId ?? 0);
    const meId = Number(req.user.id);

    if (!Number.isInteger(chatId) || chatId <= 0) {
        return res.status(400).json({ message: "chatId required" });
    }

    const chatExists = await prisma.chats.findUnique({
        where: { id: chatId },
    });

    if (!chatExists) {
        return res.status(404).json({ message: "Chat not found" });
    }

    const participant = await prisma.chat_participants.findUnique({
        where: { chat_id_user_id: { chat_id: chatId, user_id: meId } },
    });

    if (!participant) {
        return res.status(403).json({ message: "Not a participant" });
    }

    const messagesDesc = await prisma.messages.findMany({
        where: { chat_id: chatId },
        orderBy: { id: "desc" },
        take: 500,
        select: {
            id: true,
            text: true,
            sender_id: true,
            attachment_url: true,
            attachment_type: true,
            created_at: true,
            edited_at: true,
            users: {
                select: {
                    username: true,
                    display_name: true,
                    pfp_url: true,
                },
            },
        },
    });

    const senderIds = [...new Set(messagesDesc.map(m => m.sender_id))];

    const roles = await prisma.chat_participants.findMany({
        where: { chat_id: chatId, user_id: { in: senderIds } },
        select: { user_id: true, role: true },
    });

    const roleMap = new Map(roles.map(r => [r.user_id, r.role]));

    const rows = messagesDesc.reverse();

    return res.json(
        rows.map((m) => ({
            id: m.id,
            text: m.text,
            senderId: m.sender_id,
            senderUsername: m.users.username,
            senderName: m.users.display_name,
            senderPfp: m.users.pfp_url,
            senderRole: roleMap.get(m.sender_id) ?? null,
            attachmentUrl: m.attachment_url,
            attachmentType: m.attachment_type,
            createdAt: m.created_at,
            editedAt: m.edited_at,
        }))
    );
});

router.post('/messages', requireAuth, handleSendMessage);
router.post('/messages/send', requireAuth, handleSendMessage);

router.patch('/message', requireAuth, handleEditMessage);
router.patch('/messages/edit', requireAuth, handleEditMessage);

router.delete('/message', requireAuth, handleDeleteMessage);
router.delete('/messages/delete', requireAuth, handleDeleteMessage);

module.exports = router;
