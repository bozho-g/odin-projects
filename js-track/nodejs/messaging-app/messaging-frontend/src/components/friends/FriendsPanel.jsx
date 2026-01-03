import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../util/api";
import AddFriendModal from "./AddFriendModal";
import { toast } from 'sonner';
import { useChat } from "../../contexts/chatContext";
import { getSocket } from "../../util/socket";
import { useAuth } from "../../contexts/authContext";

export default function FriendsPanel() {
    const { user } = useAuth();
    const { startChat } = useChat();
    const [friends, setFriends] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("online");
    const [search, setSearch] = useState("");
    const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);

    function showFriendModal() {
        setIsFriendModalOpen(true);
    }

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [friendsRes, incomingRes] = await Promise.all([
                api.get("/friends"),
                api.get("/friends/incoming"),
            ]);
            setFriends(friendsRes || []);
            setIncomingRequests(incomingRes || []);
            setError("");
        } catch (err) {
            if (!silent) {
                setError(err.message || "Failed to load friends");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(false);
    }, [fetchData]);

    useEffect(() => {
        if (!user) return;

        const socket = getSocket();

        const handleFriendRequestNew = (payload) => {
            setIncomingRequests((prev) => {
                const exists = prev.some((r) => r.id === payload.id);
                if (exists) return prev;
                return [{
                    id: payload.id,
                    requestId: payload.id,
                    fromUserId: payload.fromUserId,
                    username: payload.username,
                    displayName: payload.displayName,
                    pfpUrl: payload.pfpUrl,
                }, ...prev];
            });
            toast.info(`${payload.displayName || payload.username} sent you a friend request`);
        };

        const handleFriendRequestUpdated = (payload) => {
            if (payload.status === 'accepted' || payload.status === 'declined' || payload.status === 'removed') {
                fetchData(true);
            }
        };

        const handlePresenceUpdate = ({ userId, online, lastSeen }) => {
            setFriends((prev) => {
                return prev.map((f) => {
                    if (f.id === userId) {
                        return { ...f, online, lastSeen };
                    }
                    return f;
                });
            });
        };

        socket.on('friend_request:new', handleFriendRequestNew);
        socket.on('friend_request:updated', handleFriendRequestUpdated);
        socket.on('presence:update', handlePresenceUpdate);

        return () => {
            socket.off('friend_request:new', handleFriendRequestNew);
            socket.off('friend_request:updated', handleFriendRequestUpdated);
            socket.off('presence:update', handlePresenceUpdate);
        };
    }, [user, fetchData]);

    const filtered = useMemo(() => {
        const needle = search.trim().toLowerCase();
        const base =
            filter === "incoming"
                ? incomingRequests
                : filter === "online"
                    ? friends.filter((f) => f.online)
                    : friends;

        if (!needle) {
            return base;
        }

        return base.filter((f) => {
            const name = (f.displayName || "").toLowerCase();
            const handle = (f.username || "").toLowerCase();
            return name.includes(needle) || handle.includes(needle);
        });
    }, [friends, incomingRequests, filter, search]);

    async function handleAccept(requestId) {
        try {
            await api.post(`/friends/accept`, { requestId });
            await fetchData();
        } catch {
            toast.error('Failed to accept friend request.', { duration: 4000 });
        }
    }

    async function handleDecline(requestId) {
        try {
            await api.post(`/friends/decline`, { requestId });
            await fetchData();
        } catch {
            toast.error('Failed to decline friend request.', { duration: 4000 });
        }
    }

    async function handleRemoveFriend(friendId) {
        try {
            await api.post(`/friends/remove`, { userId: friendId });
            await fetchData();
        } catch {
            toast.error('Failed to remove friend.', { duration: 4000 });
        }
    }

    return (
        <div className="friends-panel">
            <h2 className="panel-title">Friends</h2>
            <div className="friends-top">
                <div className="segmented">
                    <button className={filter === 'online' ? 'active' : ''} onClick={() => setFilter('online')}>Online</button>
                    <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                    <button className={filter === 'incoming' ? 'active' : ''} onClick={() => setFilter('incoming')}>
                        Incoming
                        {incomingRequests.length > 0 && <span className="badge-dot" aria-label="incoming requests" />}
                    </button>
                </div>

                <button className="secondary btn" onClick={showFriendModal}>Add Friend</button>
            </div>

            <div className="friend-controls">
                <input
                    className="friend-search"
                    placeholder="Search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="friend-list">
                {loading && <div className="empty-state"><p>Loading…</p></div>}
                {!loading && error && <div className="empty-state"><p>{error}</p></div>}
                {!loading && !error && filtered.length === 0 && (
                    <div className="empty-state">
                        {filter === "incoming" ? (<p>No incoming friend requests.</p>) : (
                            <p>No friends to display.</p>
                        )}
                    </div>
                )}
                {!loading && !error && filtered.length > 0 && filtered.map(f =>
                (
                    <div key={filter === "incoming" ? f.requestId : f.id} data-friend-id={f.requestId} className="friend-card">
                        <img src={f.pfpUrl} alt={f.username} />
                        <div className="friend-meta">
                            <div className="friend-name">{f.displayName || f.username}</div>
                            <div className="friend-handle">@{f.username}</div>
                        </div>
                        <div className="friend-actions">
                            {filter === "incoming" ? (
                                <>
                                    <button className="secondary-btn" onClick={() => handleAccept(f.requestId)}>Accept</button>
                                    <button className="secondary-btn" onClick={() => handleDecline(f.requestId)}>Decline</button>
                                </>
                            ) : (
                                <>
                                    <button className="secondary btn" onClick={() => startChat(f.id)}>Message</button>
                                    <button className="secondary btn remove-btn" onClick={() => handleRemoveFriend(f.id)}>Remove</button>
                                </>
                            )}
                        </div>
                    </div>
                )
                )}
            </div>

            {isFriendModalOpen && <AddFriendModal onClose={() => setIsFriendModalOpen(false)} />}
        </div>
    );
}
