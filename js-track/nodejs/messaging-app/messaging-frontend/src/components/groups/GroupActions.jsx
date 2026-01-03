import { useEffect, useMemo, useState } from "react";
import { api } from "../../util/api";
import { useGroupActions } from "../../hooks/useGroupActions";
import { toast } from "sonner";
import { useChat } from "../../contexts/chatContext";
import { useAuth } from "../../contexts/authContext";
import Modal from "../common/Modal";

export default function GroupActions() {
    const { user } = useAuth();
    const { currentChat } = useChat();
    const { addMembers, removeMember, leaveGroup, deleteGroup } = useGroupActions();
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedToAdd, setSelectedToAdd] = useState(new Set());
    const [confirm, setConfirm] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        api.get("/friends")
            .then((res) => { if (mounted) setFriends(res); })
            .catch(() => { if (mounted) toast.error("Failed to load friends"); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, []);

    const inChatIds = useMemo(() => new Set((currentChat.participants).map(p => p.id)), [currentChat.participants]);
    const availableFriends = useMemo(
        () => friends.filter(f => !inChatIds.has(f.id)),
        [friends, inChatIds]
    );

    const toggleSelect = (id) => {
        setSelectedToAdd((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleAdd = async () => {
        if (selectedToAdd.size === 0) return;
        const users = friends.filter(f => selectedToAdd.has(f.id));
        try {
            await addMembers(currentChat.id, users);
            toast.success("Members added");
            setSelectedToAdd(new Set());
        } catch (err) {
            toast.error(err.message || "Failed to add members");
        }
    };

    const handleConfirm = async () => {
        if (!confirm) {
            return;
        }

        try {
            if (confirm.type === "remove" && confirm.user) {
                await removeMember(currentChat.id, confirm.user.id);
                toast.success("Member removed");
            } else if (confirm.type === "leave") {
                await leaveGroup(currentChat.id);
                toast.success("You left the group");
            } else if (confirm.type === "delete") {
                await deleteGroup(currentChat.id);
                toast.success("Group deleted");
            }
        } catch (err) {
            toast.error(err.message || "Action failed");
        } finally {
            setConfirm(null);
        }
    };

    const isAdmin = useMemo(() => {
        return currentChat.participants.some(p => p.id === user?.id && p.role === "admin");
    }, [currentChat.participants, user]);

    return (
        <aside className="group-actions">
            <div>
                <div className="group-actions-title">Members</div>
                <div className="group-actions-members">
                    {(currentChat.participants).map((p) => (
                        <div key={p.id} className="group-member">
                            <img src={p.pfpUrl} alt={p.username} />
                            <div className="group-member-meta">
                                <div className="group-member-line">
                                    <span>{p.displayName || p.username}</span>
                                    {p.role === "admin" && (
                                        <svg className="crown" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <title>Admin</title>
                                            <path d="M5 17h14l-1-9-4 3-2-4-2 4-4-3-1 9Z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            {p.id !== user?.id && isAdmin && (
                                <button type="button" className="text-btn" onClick={() => setConfirm({ type: "remove", user: p })}>
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="group-actions-title">Add friends</div>
                {loading && <p className="muted">Loading friends...</p>}
                {!loading && availableFriends.length === 0 && (
                    <p className="muted">No friends to add.</p>
                )}
                {!loading && availableFriends.length > 0 && (
                    <div className="add-list">
                        {availableFriends.map((f) => (
                            <label key={f.id} className={`add-row ${selectedToAdd.has(f.id) ? "selected" : ""}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedToAdd.has(f.id)}
                                    onChange={() => toggleSelect(f.id)}
                                />
                                <img src={f.pfpUrl} alt={f.username} />
                                <span>{f.displayName || f.username}</span>
                            </label>
                        ))}
                        <button type="button" className="primary btn" onClick={handleAdd} disabled={selectedToAdd.size === 0}>
                            Add selected
                        </button>
                    </div>
                )}
            </div>

            <div className="group-actions-footer">
                <button type="button" className="secondary btn" onClick={() => setConfirm({ type: "leave" })}>Leave group</button>
                {
                    isAdmin &&
                    <button type="button" className="remove-btn btn" onClick={() => setConfirm({ type: "delete" })}>Delete group</button>
                }
            </div>

            {confirm && (
                <Modal onClose={() => setConfirm(null)} title={
                    confirm.type === "remove"
                        ? `Remove ${confirm.user?.displayName || confirm.user?.username}?`
                        : confirm.type === "leave"
                            ? "Leave group?"
                            : "Delete group?"
                }>
                    <p>
                        {confirm.type === "remove" && "They will be removed from this group."}
                        {confirm.type === "leave" && "You will exit this group."}
                        {confirm.type === "delete" && "This will delete the group for everyone."}
                    </p>
                    <div className="modal-actions">
                        <button className="secondary btn" type="button" onClick={() => setConfirm(null)}>Cancel</button>
                        <button className="remove-btn btn" type="button" onClick={handleConfirm}>Confirm</button>
                    </div>
                </Modal>
            )}
        </aside>
    );
}
