import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "../../contexts/chatContext";
import { useAuth } from "../../contexts/authContext";
import { api } from "../../util/api";
import { toast } from "sonner";
import { uploadWithSignedUrl } from "../../util/supabase";
import { getSocket } from "../../util/socket";
import GroupActions from "../groups/GroupActions";
import RenameGroupModal from "../misc/RenameGroupModal";

export default function MessagesPanel() {
    const { currentChat, renderAvatar } = useChat();
    const { user } = useAuth();
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const [showActionsFor, setShowActionsFor] = useState(null);
    const [menuOpen, setMenuOpen] = useState(null);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const fileInputRef = useRef(null);
    const textInputRef = useRef(null);
    const listRef = useRef(null);
    const currentChatIdRef = useRef(null);
    const prevMessageCountRef = useRef(0);

    const fetchMessages = useCallback(async (silent = false) => {
        const chatId = currentChat?.id;
        if (!chatId) {
            if (!silent) setLoadingMessages(false);
            return;
        }

        if (user?.id && Array.isArray(currentChat?.participants)) {
            const stillInChat = currentChat.participants.some((p) => Number(p.id) === Number(user.id));
            if (!stillInChat) {
                if (!silent) setLoadingMessages(false);
                return;
            }
        }

        if (!silent) setLoadingMessages(true);
        try {
            const res = await api.get(`/chats/messages/?chatId=${chatId}`);

            if (currentChatIdRef.current !== chatId) {
                return;
            }

            setMessages((prev) => {
                const pendingMessages = prev.filter(m => m.pending && typeof m.id === 'string' && m.id.startsWith('temp-'));
                const confirmedMessages = res.filter(serverMsg =>
                    !pendingMessages.some(pending => pending.id === serverMsg.id)
                );
                return [...confirmedMessages, ...pendingMessages];
            });
        } catch (err) {
            if (!silent) {
                toast.error(err.message || "Failed to load messages", { duration: 4000 });
            }
        } finally {
            if (!silent) setLoadingMessages(false);
        }
    }, [currentChat, user?.id]);

    useEffect(() => {
        currentChatIdRef.current = currentChat?.id ?? null;

        if (!currentChat) {
            setMessages([]);
            setLoadingMessages(false);
            return;
        }

        startTransition(() => { fetchMessages(false); });
    }, [currentChat, fetchMessages]);

    useEffect(() => {
        const s = getSocket();
        const myId = user?.id;

        const handleMessageNew = ({ chatId, message }) => {
            if (!currentChatIdRef.current || Number(chatId) !== Number(currentChatIdRef.current)) return;
            if (!message) return;

            setMessages((prev) => {
                if (prev.some((m) => m.id === message.id)) {
                    return prev;
                }

                if (myId && Number(message.senderId) === Number(myId)) {
                    const pendingIndex = prev.findIndex((m) =>
                        m.pending &&
                        typeof m.id === 'string' &&
                        m.id.startsWith('temp-') &&
                        (m.text || '') === (message.text || '') &&
                        (m.attachmentUrl || null) === (message.attachmentUrl || null)
                    );

                    if (pendingIndex !== -1) {
                        const copy = [...prev];
                        copy[pendingIndex] = { ...message, pending: false };
                        return copy;
                    }
                }

                return [...prev, message];
            });
        };

        const handleMessageEdited = ({ chatId, messageId, text, editedAt }) => {
            if (!currentChatIdRef.current || Number(chatId) !== Number(currentChatIdRef.current)) return;
            setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, text, editedAt } : m)));
        };

        const handleMessageDeleted = ({ chatId, messageId }) => {
            if (!currentChatIdRef.current || Number(chatId) !== Number(currentChatIdRef.current)) return;
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
        };

        s.on("message:new", handleMessageNew);
        s.on("message:edited", handleMessageEdited);
        s.on("message:deleted", handleMessageDeleted);

        if (!s.connected) s.connect();

        return () => {
            s.off("message:new", handleMessageNew);
            s.off("message:edited", handleMessageEdited);
            s.off("message:deleted", handleMessageDeleted);
        };
    }, [user?.id]);

    const groupedMessages = useMemo(() => {
        const groupThreshold = 5 * 60 * 1000;
        return messages.map((m, i) => {
            const prev = messages[i - 1];
            if (!prev) return { ...m, grouped: false };

            const sameSender = prev.senderId === m.senderId;
            const prevTime = new Date(prev.createdAt).getTime();
            const currTime = new Date(m.createdAt).getTime();
            const withinThreshold = (currTime - prevTime) < groupThreshold;

            const grouped = sameSender && withinThreshold;
            return { ...m, grouped };
        });
    }, [messages]);

    const formatMessageTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();

        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMessageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diffMs = startOfToday - startOfMessageDay;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

        if (diffDays === 0) {
            return timeStr;
        } else if (diffDays < 7) {
            const dayName = date.toLocaleDateString([], { weekday: 'short' });
            return `${dayName} ${timeStr}`;
        } else {
            const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
            return `${dateStr} ${timeStr}`;
        }
    };

    const scrollToBottom = () => {
        if (listRef.current) {
            requestAnimationFrame(() => {
                if (listRef.current) {
                    listRef.current.scrollTop = listRef.current.scrollHeight;
                }
            });
        }
    };

    useEffect(() => {
        if (!currentChat?.id) {
            prevMessageCountRef.current = 0;
            return;
        }

        if (messages.length > prevMessageCountRef.current) {
            scrollToBottom();
        }

        prevMessageCountRef.current = messages.length;
    }, [messages.length, currentChat?.id]);

    const handleSend = async (e) => {
        e.preventDefault();
        const text = draft.trim();
        if ((!text && !selectedFile) || !currentChat) return;
        const tempId = `temp-${Date.now()}`;
        const fileToSend = selectedFile;
        const previewUrl = filePreview;
        const optimistic = {
            id: tempId,
            text,
            senderId: user?.id,
            senderName: user?.displayName || user?.username || "You",
            senderPfp: user?.pfpUrl,
            createdAt: new Date().toISOString(),
            pending: true,
            attachmentUrl: previewUrl || null,
            attachmentType: fileToSend?.type || null,
        };
        setMessages((prev) => [...prev, optimistic]);
        setDraft("");
        setSelectedFile(null);
        setFilePreview("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        scrollToBottom();

        try {
            let attachmentUrl = "";
            let attachmentType = "";
            if (fileToSend) {
                const signed = await api.post("/chats/attachment-signed-url", {
                    chatId: currentChat.id,
                    filename: fileToSend.name,
                    mime: fileToSend.type,
                    size: fileToSend.size,
                });
                attachmentUrl = await uploadWithSignedUrl(fileToSend, signed);
                attachmentType = fileToSend.type;
            }

            const saved = await api.post("/chats/messages", {
                chatId: currentChat.id,
                text,
                attachmentUrl,
                attachmentType,
            });
            if (saved && !saved.senderPfp) {
                saved.senderPfp = user?.pfpUrl;
            }
            if (saved && previewUrl && !saved.attachmentUrl) {
                saved.attachmentUrl = previewUrl;
            }
            setMessages((prev) => {
                const already = prev.some((m) => m.id === saved.id);
                if (already) {
                    return prev.filter((m) => m.id !== tempId);
                }
                return prev.map((m) => m.id === tempId ? { ...saved, pending: false } : m);
            });
        } catch (err) {
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            toast.error(err.message || "Failed to send message", { duration: 3000 });
        }
    };

    const handleEdit = async (messageId) => {
        if (!editText.trim()) {
            return;
        }

        try {
            await api.patch("/chats/message", { messageId, text: editText });
            setMessages((prev) =>
                prev.map((m) => (m.id === messageId ? { ...m, text: editText, editedAt: new Date().toISOString() } : m))
            );
            setEditingId(null);
            setEditText("");
            toast.success("Message edited");
        } catch (err) {
            toast.error(err.message || "Failed to edit message", { duration: 3000 });
        }
    };

    const handleDelete = async (messageId) => {
        if (!confirm("Delete this message?")) {
            return;
        }

        try {
            await api.delete("/chats/message", { messageId });
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
            toast.success("Message deleted");
        } catch (err) {
            toast.error(err.message || "Failed to delete message", { duration: 3000 });
        }
    };

    const startEdit = (message) => {
        setEditingId(message.id);
        setEditText(message.text);
        setShowActionsFor(null);
        setMenuOpen(null);
    };

    const toggleMenu = (messageId, e) => {
        e.stopPropagation();
        setMenuOpen(menuOpen === messageId ? null : messageId);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            setSelectedFile(null);
            setFilePreview("");
            return;
        }
        if (!file.type.startsWith("image/")) {
            toast.error("Only images allowed");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            toast.error("Max size is 8MB");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        setSelectedFile(file);
        setFilePreview(URL.createObjectURL(file));
        setTimeout(() => textInputRef.current?.focus(), 0);
    };

    useEffect(() => {
        return () => {
            if (filePreview) URL.revokeObjectURL(filePreview);
        };
    }, [filePreview]);

    useEffect(() => {
        const handleClickOutside = () => setMenuOpen(null);
        if (menuOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [menuOpen]);

    return (
        <>
            {isRenameModalOpen && <RenameGroupModal onClose={() => setIsRenameModalOpen(false)} />}
            {loadingMessages && <span className="loader"></span>}
            {!loadingMessages && !currentChat && (
                <div className="empty-chat">
                    <div>
                        <h2>Your messages.</h2>
                        <p>Send a message to start a chat.</p>
                    </div>
                </div>
            )}
            {!loadingMessages && currentChat && (
                <div className="messages-panel">
                    <div className="messages-header">
                        {renderAvatar(currentChat)}
                        <h2>{currentChat.title}</h2>
                        {currentChat.isGroup && <svg onClick={() => setIsRenameModalOpen(true)} className="group-rename" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracurrentColorerCarrier" strokeLinejoin="round"></g><g id="SVGRepo_icurrentColoronCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M8.56078 20.2501L20.5608 8.25011L15.7501 3.43945L3.75012 15.4395V20.2501H8.56078ZM15.7501 5.56077L18.4395 8.25011L16.5001 10.1895L13.8108 7.50013L15.7501 5.56077ZM12.7501 8.56079L15.4395 11.2501L7.93946 18.7501H5.25012L5.25012 16.0608L12.7501 8.56079Z" fill="currentColor"></path> </g></svg>}
                    </div>
                    <div className="messages-list" ref={listRef}>
                        <div className="chat-header">
                            {renderAvatar(currentChat, true)}
                            <h4>This is the beginning of {currentChat.isGroup ? `the ${currentChat.title} group.` : `your chat with ${currentChat.title}.`}</h4>
                        </div>
                        {groupedMessages.map((message) => (
                            <div
                                key={message.id}
                                className={`message-row${message.grouped ? " compact" : ""}`}
                                onMouseEnter={() => message.senderId === user?.id && setShowActionsFor(message.id)}
                                onMouseLeave={() => menuOpen !== message.id && setShowActionsFor(null)}
                            >
                                {!message.grouped && (
                                    <img src={message.senderPfp} alt={message.senderName || "user"} className="message-avatar" />
                                )}
                                <div className="message-body">
                                    {!message.grouped && (
                                        <div className="message-meta">
                                            <span className="message-sender">{message.senderName || "Unknown"}</span>
                                            <span className="message-time">{formatMessageTime(message.createdAt)}</span>
                                        </div>
                                    )}
                                    {message.attachmentUrl && (
                                        <div className="message-attachment">
                                            <img
                                                src={message.attachmentUrl}
                                                alt="Attachment"
                                                onLoad={scrollToBottom}
                                            />
                                        </div>
                                    )}
                                    {editingId === message.id ? (
                                        <div className="message-edit">
                                            <input
                                                type="text"
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleEdit(message.id);
                                                    if (e.key === "Escape") { setEditingId(null); setEditText(""); }
                                                }}
                                                autoFocus
                                            />
                                            <div className="message-edit-actions">
                                                <button type="button" onClick={() => handleEdit(message.id)} className="btn-sm">Save</button>
                                                <button type="button" onClick={() => { setEditingId(null); setEditText(""); }} className="btn-sm">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        message.text && (
                                            <p className="message-text">
                                                {message.text}
                                                {message.editedAt && <span className="edited-label">(edited)</span>}
                                            </p>
                                        )
                                    )}
                                </div>
                                {showActionsFor === message.id && message.senderId === user?.id && editingId !== message.id && (
                                    <div className="message-actions">
                                        <button type="button" onClick={(e) => toggleMenu(message.id, e)} className="icon-btn" aria-label="More actions">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <circle cx="12" cy="5" r="2" />
                                                <circle cx="12" cy="12" r="2" />
                                                <circle cx="12" cy="19" r="2" />
                                            </svg>
                                        </button>
                                        {menuOpen === message.id && (
                                            <div className="message-actions-menu">
                                                <button type="button" onClick={() => startEdit(message)}>Edit</button>
                                                <button type="button" onClick={() => handleDelete(message.id)} className="danger">Delete</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <form className="message-input" onSubmit={handleSend}>
                        {selectedFile && (
                            <div className="attachment-chip">
                                <span>{selectedFile.name}</span>
                                <button type="button" onClick={() => { setSelectedFile(null); setFilePreview(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}>✕</button>
                            </div>
                        )}
                        <div className="input-shell">
                            <label className="icon-btn" aria-label="Upload image">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleFileChange}
                                />
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 16 4.5-4.5a2 2 0 0 1 3 0L15 16" /><circle cx="15.5" cy="10.5" r="1.5" /></svg>
                            </label>
                            <input
                                ref={textInputRef}
                                type="text"
                                placeholder="Type your message..."
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                            />
                            {(draft.trim() || selectedFile) && (
                                <button type="submit" className="send-btn" aria-label="Send">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4l16 8-16 8 4-8-4-8z" /></svg>
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}
            {!loadingMessages && currentChat && currentChat.isGroup && <GroupActions />}
        </>
    );
}
