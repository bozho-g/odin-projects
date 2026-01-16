import usePosts from '../../../hooks/usePosts';
import { PostCard } from "../PostCard/PostCard";
import styles from './PostsDashboard.module.css';

export function PostsDashboard({ filter }) {
    const { data: posts, isLoading, error } = usePosts(filter);

    if (error) {
        return <p>Error loading posts: {error.message}</p>;
    }

    return (
        <div className={styles.postsDashboard}>
            {isLoading && <span className="loader"></span>}
            {!isLoading && posts.length === 0 && <p className={styles.noPosts}>No posts available.</p>}

            {!isLoading && posts.map(post => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}