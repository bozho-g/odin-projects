import { PostsDashboard } from '../components/Posts/PostsDashboard/PostsDashboard';
import { useMemo } from "react";
import styles from "../pages/HomePage/HomePage.module.css";
import { CreatePostWrapper } from "./Posts/PostWrappers/CreatePostWrapper";
import { useNavigate, useMatch } from 'react-router-dom';

export function HomeFeed() {
    const navigate = useNavigate();
    const isAllMatch = useMatch('/all');
    const currentTab = isAllMatch ? 'all' : 'feed';

    const filter = useMemo(() => ({ user: null, feed: currentTab === 'feed' ? true : null }), [currentTab]);

    return (
        <>
            <div className={styles.tabButtons}>
                <button onClick={() => navigate('/')} className={currentTab === "feed" ? styles.active : ""}>Feed</button>
                <button onClick={() => navigate('/all')} className={currentTab === "all" ? styles.active : ""}>All Posts</button>
            </div>
            <CreatePostWrapper />
            <PostsDashboard filter={filter} />
        </>
    );
}