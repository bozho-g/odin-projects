import { useAuth } from '../../contexts/authContext';
import ChatsPanel from './ChatsPanel';
import AuthTabs from '../auth/AuthTabs';
import FriendsPanel from '../friends/FriendsPanel';
import { useState } from 'react';
import Profile from '../auth/Profile';
import MessagesPanel from './MessagesPanel';

function Home() {
    const { user, loading } = useAuth();
    const [leftTab, setLeftTab] = useState('chats');

    if (loading) {
        return <span className="loader"></span>;
    }

    if (!user) {
        return <AuthTabs />;
    }

    return (
        <div className="home-container">
            <aside className="left-panel">
                <div className="tabs">
                    <button onClick={() => setLeftTab('chats')} className={leftTab === 'chats' ? 'active' : ''}>Chats</button>
                    <button onClick={() => setLeftTab('friends')} className={leftTab === 'friends' ? 'active' : ''}>Friends</button>
                </div>
                {leftTab === 'chats' ? <ChatsPanel /> : <FriendsPanel />}
                <Profile />
            </aside>
            <main className="chat-window">
                <MessagesPanel />
            </main>
        </div>
    );
}

export default Home;