import { useMemo } from "react";
import { useChat } from "../../contexts/chatContext";

function ChatsPanel() {
    const { chats, currentChat, setCurrentChat, renderAvatar, loading } = useChat();

    const items = useMemo(() => chats, [chats]);

    return (
        <div className="chats-panel">
            <h2 className="panel-title">Chats</h2>
            {loading && <span className="loader"></span>}
            {items.length === 0 && !loading && <p className="empty-state">No chats available.</p>}
            <ul className="chat-list">
                {items.map(chat => (
                    <li
                        key={chat.id}
                        className={`chat-list-item${currentChat?.id === chat.id ? " active" : ""}`}
                        onClick={() => setCurrentChat(chat)}
                    >
                        <div className="chat-avatar">
                            {renderAvatar(chat)}
                        </div>
                        <div className="chat-meta">
                            <div className="chat-title">{chat.title}</div>
                            <div className="chat-subtitle">
                                {chat.isGroup ? "Group" : "Direct"}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ChatsPanel;
