import { Comment } from '../Comment.jsx';
import styles from './CommentsDashboard.module.css';
import useComments from '../../../hooks/useComments.js';

export function CommentsDashboard({ postId }) {
    const { data: comments, isLoading, error } = useComments(postId);

    if (error) {
        return <p>Error loading comments: {error.message}</p>;
    }

    return (
        <div className={styles.dashboard}>
            {isLoading && <span className="loader"></span>}
            {!isLoading && comments.length === 0 && <p className={styles.noComments}>No comments yet.</p>}
            {!isLoading && comments.map((comment) => (
                <Comment key={comment.id} comment={comment} />
            ))}
        </div>
    );
}