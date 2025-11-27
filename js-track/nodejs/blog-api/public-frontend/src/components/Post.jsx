import { useNavigate } from "react-router-dom";

function Post({ post }) {
    const navigate = useNavigate();
    function openFullPost() {
        navigate(`/posts/${post.id}`);
    }

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
        </div>
    );
}

export default Post;