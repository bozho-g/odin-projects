import { useCallback } from "react";
import { api } from "../util/api";
import { useChat } from "../contexts/chatContext";

export function useGroupActions() {
    const { setChats, setCurrentChat, currentChat } = useChat();

    const updateChatState = useCallback((chatId, updater) => {
        let updatedChat = null;

        setChats((prev) => {
            const next = prev.map((c) => {
                if (c.id !== chatId) return c;
                const patched = updater(c);
                updatedChat = patched;
                return patched;
            });
            return next;
        });

        if (currentChat?.id === chatId && updatedChat) {
            setCurrentChat(updatedChat);
        }
    }, [setChats, setCurrentChat, currentChat?.id]);

    const renameGroup = useCallback(async (chatId, name) => {
        const res = await api.patch("/chats/rename", { chatId, name });
        updateChatState(chatId, (c) => {
            const updated = { ...c, name: res.name };
            updated.title = res.name;
            return updated;
        });
        return res;
    }, [updateChatState]);

    const addMembers = useCallback(async (chatId, users) => {
        const addedIds = [];
        for (const u of users) {
            const res = await api.post("/chats/add-member", { chatId, userId: u.id });
            addedIds.push(u.id);
            const member = res.member || { ...u, role: "member" };
            updateChatState(chatId, (c) => {
                const exists = (c.participants || []).some((p) => p.id === member.id);
                if (exists) return c;
                return { ...c, participants: [...(c.participants || []), member] };
            });
        }
        return addedIds;
    }, [updateChatState]);

    const removeMember = useCallback(async (chatId, userId) => {
        await api.post("/chats/remove-member", { chatId, userId });
        updateChatState(chatId, (c) => ({
            ...c,
            participants: (c.participants || []).filter(p => p.id !== userId),
        }));
    }, [updateChatState]);

    const leaveGroup = useCallback(async (chatId) => {
        await api.post("/chats/leave", { chatId });
        setChats((prev) => prev.filter((c) => c.id !== chatId));
        setCurrentChat(null);
    }, [setChats, setCurrentChat]);

    const deleteGroup = useCallback(async (chatId) => {
        await api.delete("/chats", { chatId });
        setChats((prev) => prev.filter((c) => c.id !== chatId));
        setCurrentChat(null);
    }, [setChats, setCurrentChat]);

    return {
        renameGroup,
        addMembers,
        removeMember,
        leaveGroup,
        deleteGroup,
    };
}

export default useGroupActions;
