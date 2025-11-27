import { useNavigate } from "react-router-dom";
import { usePosts } from "../contexts/postsContext";

function Post({ post, onEdit }) {
    const { handleDelete, togglePublish } = usePosts();

    const navigate = useNavigate();
    function openFullPost() {
        navigate(`/posts/${post.id}`);
    }

    const stopPropagation = (handler) => (e) => {
        e.stopPropagation();
        handler();
    };

    return (
        <div key={post.id} className="post" onClick={openFullPost}>
            <div className="content">
                <h2>{post.title}</h2>
                <p>{post.content}</p>
            </div>
            <div className="info">
                <span>Author: {post.author.username}</span>
                <span>Date: {new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="actions">
                <button className="btn hover-bg-primary-90" onClick={stopPropagation(() => onEdit(post))}>Edit</button>
                <button className="btn delete hover-bg-destructive-90" onClick={stopPropagation(() => {
                    if (confirm('Are you sure you want to delete this post?')) {
                        handleDelete(post.id);
                    }
                })}>Delete</button>
                <button className="transparent-btn" onClick={stopPropagation(() => togglePublish(post))}>
                    {post.published ? 'Unpublish' : 'Publish'}
                </button>
            </div>
        </div>
    );
}

export default Post;