import { createContext, startTransition, useCallback, useContext, useEffect, useEffectEvent, useRef, useState } from "react";
import { api } from "../util/api";
import { toast } from "sonner";
import { useAuth } from "./authContext";
import { getSocket } from "../util/socket";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
    const { user } = useAuth();
    const [chats, setChats] = useState([]);
    const [currentChatState, setCurrentChatState] = useState(null);
    const [loadingChats, setLoadingChats] = useState(false);
    const lastChatIdRef = useRef(null);

    const renderAvatar = useCallback((chat, isBig) => {
        if (chat.avatar.type === "single") {
            return <img src={chat.avatar.avatar} alt={chat.avatar.alt} />;
        }
        return (
            <div className={`group-badge${isBig ? " big" : ""}`}>
                <img src={chat.avatar.others[0]?.pfpUrl} alt={chat.avatar.others[0]?.username || "a"} />
                {chat.avatar.others[1] && <img src={chat.avatar.others[1]?.pfpUrl} alt={chat.avatar.others[1]?.username || "b"} />}
            </div>
        );
    }, []);

    async function startChat(userId) {
        const chat = chats.find(c => c.participants.some(p => p.id === userId) && !c.isGroup);
        if (chat) {
            setCurrentChat(chat);
            return;
        }

        let newChat;
        try {
            newChat = await api.post("/chats/create-dm", { otherUserId: userId });
        } catch (error) {
            toast.error(error.message || "Failed to start chat", { duration: 4000 });
            return;
        }

        setCurrentChat(newChat);
    }

    const computeTitle = useCallback((chat) => {
        if (chat.isGroup) {
            if (chat.name) {
                return chat.name;
            }
            const others = chat.participants.filter(p => p.id !== user?.id);

            return others.slice(0, 3).map(p => p.displayName || p.username).join(", ");
        }
        const other = chat.participants.find(p => p.id !== user?.id);
        return other ? (other.displayName || other.username) : "Direct chat";
    }, [user?.id]);

    const computeAvatar = useCallback((chat) => {
        if (chat.isGroup) {
            const others = chat.participants.filter(p => p.id !== user?.id);
            const a = others[0];
            const b = others[1];

            return { type: "group", others: [a, b] };
        }

        const other = chat.participants.find(p => p.id !== user?.id);
        return { type: "single", avatar: other?.pfpUrl, alt: other?.username || "chat" };
    }, [user?.id]);

    const setCurrentChat = useCallback((chatOrId) => {
        const chat = typeof chatOrId === "string" ? chats.find(c => c.id === chatOrId) : chatOrId;

        if (!chat) {
            setCurrentChatState(null);
            return;
        }

        const title = chat.name ?? chat.title ?? computeTitle(chat);
        const avatar = chat.avatar ?? computeAvatar(chat);

        setCurrentChatState({ ...chat, title, avatar });
    }, [chats, computeAvatar, computeTitle]);

    const fetchChats = useEffectEvent(async (silent = false) => {
        if (!silent) setLoadingChats(true);
        try {
            const res = await api.get("/chats");
            const list = res.map(chat => {
                const title = chat.name ?? computeTitle(chat);
                const avatar = computeAvatar(chat);
                return { ...chat, title, avatar };
            });

            setChats(list);
            setLoadingChats(false);
        } catch (err) {
            if (!silent) {
                toast.error(err.message || "Failed to load chats", { duration: 4000 });
            }
            setLoadingChats(false);
        }
    }, [computeAvatar, computeTitle]);

    useEffect(() => {
        if (!user) {
            startTransition(() => {
                setChats([]);
                setCurrentChatState(null);
                setLoadingChats(false);
            });
            return;
        }

        fetchChats(false);
    }, [user]);

    useEffect(() => {
        if (!user) {
            const s = getSocket();
            if (s.connected) s.disconnect();
            return;
        }

        const s = getSocket();

        const handleConnect = () => {
            if (currentChatState?.id) {
                s.emit("chat:subscribe", currentChatState.id);
            }
        };

        const handleChatNew = ({ chat }) => {
            setChats((prev) => {
                const exists = prev.some((c) => c.id === chat.id);
                if (exists) return prev;
                const title = chat.name ?? computeTitle(chat);
                const avatar = computeAvatar(chat);
                return [{ ...chat, title, avatar }, ...prev];
            });
        };

        const handleMessageNew = ({ chatId }) => {
            if (currentChatState?.id === chatId) return;
            fetchChats(true);
        };

        const handleChatUpdated = ({ chatId, name }) => {
            setChats((prev) => prev.map((c) => {
                if (c.id === chatId) {
                    const updated = { ...c, name };
                    updated.title = computeTitle(updated);
                    return updated;
                }
                return c;
            }));

            if (currentChatState?.id === chatId) {
                setCurrentChatState((prev) => {
                    const updated = { ...prev, name };
                    updated.title = computeTitle(updated);
                    return updated;
                });
            }
        };

        const handleMemberAdded = ({ chatId, member }) => {
            setChats((prev) => prev.map((c) => {
                if (c.id !== chatId) return c;
                const exists = (c.participants || []).some((p) => p.id === member.id);
                if (exists) return c;
                const participants = [...(c.participants || []), member];
                const avatar = c.isGroup ? computeAvatar({ ...c, participants }) : c.avatar;
                const title = c.title;
                return { ...c, participants, avatar, title };
            }));

            if (currentChatState?.id === chatId) {
                setCurrentChatState((prev) => {
                    if (!prev) return prev;
                    const exists = (prev.participants || []).some((p) => p.id === member.id);
                    if (exists) return prev;
                    const participants = [...(prev.participants || []), member];
                    const avatar = prev.isGroup ? computeAvatar({ ...prev, participants }) : prev.avatar;
                    return { ...prev, participants, avatar };
                });
            }
        };

        const handleMemberRemoved = ({ chatId, userId }) => {
            if (Number(userId) === Number(user?.id)) {
                setChats((prev) => prev.filter((c) => c.id !== chatId));

                if (currentChatState?.id === chatId) {
                    setCurrentChatState(null);
                    toast.info("You were removed from this chat");
                }

                return;
            }

            setChats((prev) => prev.map((c) => {
                if (c.id !== chatId) return c;
                const participants = (c.participants || []).filter((p) => p.id !== userId);
                const avatar = c.isGroup ? computeAvatar({ ...c, participants }) : c.avatar;
                const title = c.title;
                return { ...c, participants, avatar, title };
            }));

            if (currentChatState?.id === chatId) {
                if (currentChatState.participants?.some((p) => p.id === userId)) {
                    setCurrentChatState((prev) => {
                        const participants = (prev?.participants || []).filter((p) => p.id !== userId);
                        const avatar = prev.isGroup ? computeAvatar({ ...prev, participants }) : prev.avatar;
                        return { ...prev, participants, avatar };
                    });
                }
            }
        };

        const handleChatDeleted = ({ chatId }) => {
            setChats((prev) => prev.filter((c) => c.id !== chatId));

            if (currentChatState?.id === chatId) {
                setCurrentChatState(null);
                toast.info("This chat was deleted");
            }
        };

        s.on("connect", handleConnect);
        s.on("chat:new", handleChatNew);
        s.on("message:new", handleMessageNew);
        s.on("chat:updated", handleChatUpdated);
        s.on("chat:member_added", handleMemberAdded);
        s.on("chat:member_removed", handleMemberRemoved);
        s.on("chat:deleted", handleChatDeleted);

        if (!s.connected) s.connect();

        return () => {
            s.off("connect", handleConnect);
            s.off("chat:new", handleChatNew);
            s.off("message:new", handleMessageNew);
            s.off("chat:updated", handleChatUpdated);
            s.off("chat:member_added", handleMemberAdded);
            s.off("chat:member_removed", handleMemberRemoved);
            s.off("chat:deleted", handleChatDeleted);
        };
    }, [user, currentChatState, computeAvatar, computeTitle]);

    useEffect(() => {
        const s = getSocket();
        const prevId = lastChatIdRef.current;
        if (prevId && s.connected) {
            s.emit("chat:unsubscribe", prevId);
        }
        if (currentChatState?.id && s.connected) {
            s.emit("chat:subscribe", currentChatState.id);
        }
        lastChatIdRef.current = currentChatState?.id ?? null;
    }, [currentChatState?.id]);

    return (
        <ChatContext.Provider value={{ chats, setChats, currentChat: currentChatState, setCurrentChat, loading: loadingChats, setLoading: setLoadingChats, startChat, renderAvatar }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    return useContext(ChatContext);
}
