import { useEffect, useState } from "react";
import { api } from "../../util/api";
import { toast } from 'sonner';
import Modal from "../common/Modal";

export default function AddFriendModal({ onClose }) {
    const [query, setQuery] = useState("");
    const [sendingId, setSendingId] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (query.trim().length < 2 || sendingId) {
            setSuggestions([]);
            return;
        }

        setSearching(true);
        setSuggestions([]);
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const res = await api.get(`/friends/search?q=${encodeURIComponent(query.trim())}`, {
                    signal: controller.signal,
                });
                setSuggestions(res || []);
            } catch (err) {
                if (err.name !== "AbortError") {
                    toast.error('Failed to search users.', { duration: 4000 });
                }
            } finally {
                setSearching(false);
            }
        }, 250);
        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [query, sendingId]);

    const renderedSuggestions = suggestions.slice(0, 6);

    async function handleSubmit(e) {
        e.preventDefault();

        toast.loading('Sending friend request...');

        try {
            await api.post('/friends/send', { toUserId: sendingId });
            toast.dismiss();
            toast.success('Friend request sent!', { duration: 4000 });

            setQuery("");
            setSendingId(null);
            onClose();
        } catch (err) {
            toast.dismiss();
            toast.error(err?.message || 'Failed to send friend request.', { duration: 4000 });

            setQuery("");
            setSendingId(null);
        }
    }

    return (
        <Modal title="Add Friend" onClose={onClose}>
            <form className="form" onSubmit={handleSubmit}>
                <div className="input-box">
                    <input id="searchUser" value={query} onChange={e => {
                        setQuery(e.target.value);
                        setSendingId(null);
                    }}
                        type="text" placeholder="Search" required autoComplete="off" />
                    <svg onClick={() => setQuery("")} className={`clear-search${query.trim().length >= 1 ? " active" : ""}`} width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM15.36 14.3C15.65 14.59 15.65 15.07 15.36 15.36C15.21 15.51 15.02 15.58 14.83 15.58C14.64 15.58 14.45 15.51 14.3 15.36L12 13.06L9.7 15.36C9.55 15.51 9.36 15.58 9.17 15.58C8.98 15.58 8.79 15.51 8.64 15.36C8.35 15.07 8.35 14.59 8.64 14.3L10.94 12L8.64 9.7C8.35 9.41 8.35 8.93 8.64 8.64C8.93 8.35 9.41 8.35 9.7 8.64L12 10.94L14.3 8.64C14.59 8.35 15.07 8.35 15.36 8.64C15.65 8.93 15.65 9.41 15.36 9.7L13.06 12L15.36 14.3Z" fill="currentColor"></path> </g></svg>
                </div>

                {searching && <p className="muted-text">Searching…</p>}
                {renderedSuggestions.length === 0 && query.trim().length >= 2 && !searching && !sendingId && (
                    <p className="muted-text">No users found</p>
                )}
                {renderedSuggestions.length > 0 && (
                    <ul className="suggestions">
                        {renderedSuggestions.map((u) => (
                            <li className="suggestion" key={u.id}
                                onClick={() => {
                                    setSendingId(u.id);
                                    setQuery(u.username);
                                }}
                            >
                                <img src={u.pfpUrl} alt={u.username} className="suggestion-img" />
                                <div>
                                    <div className="suggestion-name">{u.displayName || u.username}</div>
                                    <div className="suggestion-handle">@{u.username}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="form-actions">
                    <button type="submit" className="primary btn" disabled={!sendingId}>Send Friend Request</button>
                    <button type="button" className="secondary-btn cancel-btn" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </Modal>
    );
}
