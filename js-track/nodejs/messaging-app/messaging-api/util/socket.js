const { Server } = require('socket.io');
const prisma = require('./prismaClient');

let io;

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }

    return io;
}

function initSocket(server, { corsOrigins, sessionMiddleware, passport }) {
    io = new Server(server, {
        cors: {
            origin: corsOrigins,
            credentials: true,
        }
    });

    io.use((socket, next) => sessionMiddleware(socket.request, {}, next));
    io.use((socket, next) => passport.initialize()(socket.request, {}, next));
    io.use((socket, next) => passport.session()(socket.request, {}, next));

    io.use((socket, next) => {
        if (!socket.request.user) {
            return next(new Error("unauthorized"));
        }

        return next();
    });

    io.on("connection", async (socket) => {
        const user = socket.request.user;
        const userId = Number(user.id);

        socket.join(`user:${userId}`);

        try {
            const rows = await prisma.chat_participants.findMany({
                where: { user_id: userId },
                select: { chat_id: true },
            });
            rows.forEach((r) => socket.join(`chat:${r.chat_id.toString()}`));
        } catch { }

        try {
            await prisma.users.update({
                where: { id: userId },
                data: { last_seen: new Date() },
            });

            const friendRows = await prisma.$queryRaw`
                SELECT CASE 
                    WHEN fr.from_user_id = ${userId} THEN fr.to_user_id 
                    ELSE fr.from_user_id 
                END AS friend_id
                FROM friend_requests fr
                WHERE (fr.from_user_id = ${userId} OR fr.to_user_id = ${userId})
                  AND fr.status = 'accepted'
            `;

            friendRows.forEach((row) => {
                getIO().to(`user:${row.friend_id}`).emit("presence:update", {
                    userId,
                    online: true,
                    lastSeen: new Date(),
                });
            });
        } catch { }

        socket.on("disconnect", async () => {
            try {
                await prisma.users.update({
                    where: { id: userId },
                    data: { last_seen: new Date() },
                });

                const friendRows = await prisma.$queryRaw`
                    SELECT CASE 
                        WHEN fr.from_user_id = ${userId} THEN fr.to_user_id 
                        ELSE fr.from_user_id 
                    END AS friend_id
                    FROM friend_requests fr
                    WHERE (fr.from_user_id = ${userId} OR fr.to_user_id = ${userId})
                      AND fr.status = 'accepted'
                `;

                setTimeout(() => {
                    friendRows.forEach((row) => {
                        getIO().to(`user:${row.friend_id}`).emit("presence:update", {
                            userId,
                            online: false,
                            lastSeen: new Date(),
                        });
                    });
                }, 3000);
            } catch { }
        });

        socket.on("presence:ping", async () => {
            try {
                await prisma.users.update({
                    where: { id: userId },
                    data: { last_seen: new Date() },
                });
            } catch { }
        });

        socket.on("chat:subscribe", (chatId) => socket.join(`chat:${chatId}`));
        socket.on("chat:unsubscribe", (chatId) => socket.leave(`chat:${chatId}`));
    });

    return io;
}

function emitMessageNew(chatId, message) {
    getIO().to(`chat:${chatId}`).emit("message:new", { chatId, message });
}

function emitChatNew(participantIds, chat) {
    for (const uid of participantIds) {
        getIO().to(`user:${uid}`).emit("chat:new", { chat });
        getIO().in(`user:${uid}`).socketsJoin(`chat:${chat.id}`);
    }
}

function emitFriendRequestNew(toUserId, payload) {
    getIO().to(`user:${toUserId}`).emit("friend_request:new", payload);
}

function emitFriendRequestUpdated(userIds, payload) {
    userIds.forEach((uid) => getIO().to(`user:${uid}`).emit("friend_request:updated", payload));
}

function emitChatUpdated(chatId, payload) {
    getIO().to(`chat:${chatId}`).emit("chat:updated", { chatId, ...payload });
}

function emitChatDeleted(participantIds, chatId) {
    participantIds.forEach((uid) => {
        getIO().to(`user:${uid}`).emit("chat:deleted", { chatId });
    });
}

function emitChatMemberAdded(chatId, newMember, chat) {
    getIO().to(`chat:${chatId}`).emit("chat:member_added", { chatId, member: newMember });

    getIO().to(`user:${newMember.id}`).emit("chat:new", { chat });
    getIO().in(`user:${newMember.id}`).socketsJoin(`chat:${chatId}`);
}

function emitChatMemberRemoved(chatId, userId) {
    getIO().to(`chat:${chatId}`).emit("chat:member_removed", { chatId, userId });

    getIO().to(`user:${userId}`).emit("chat:deleted", { chatId });
    getIO().in(`user:${userId}`).socketsLeave(`chat:${chatId}`);
}

function emitChatMemberLeft(chatId, userId) {
    getIO().to(`chat:${chatId}`).emit("chat:member_left", { chatId, userId });

    getIO().in(`user:${userId}`).socketsLeave(`chat:${chatId}`);
}

function emitMessageEdited(chatId, messageId, text, editedAt) {
    getIO().to(`chat:${chatId}`).emit("message:edited", { chatId, messageId, text, editedAt });
}

function emitMessageDeleted(chatId, messageId) {
    getIO().to(`chat:${chatId}`).emit("message:deleted", { chatId, messageId });
}

module.exports = {
    initSocket,
    getIO,
    emitMessageNew,
    emitMessageEdited,
    emitMessageDeleted,
    emitChatNew,
    emitChatUpdated,
    emitChatDeleted,
    emitChatMemberAdded,
    emitChatMemberRemoved,
    emitChatMemberLeft,
    emitFriendRequestNew,
    emitFriendRequestUpdated,
};