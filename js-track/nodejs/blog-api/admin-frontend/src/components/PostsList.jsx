import { api } from "../api/client";
import { usePosts } from "../contexts/postsContext";
import Post from "./Post";

function PostsList({ type }) {
    const { posts, setPosts, setEditingPost, setIsModalOpen } = usePosts();

    const filteredPosts = posts.filter(post => {
        if (type === "Published") return post.published;
        if (type === "Unpublished") return !post.published;
        return true;
    });

    async function toggleManyPublish() {
        const publish = type === "Unpublished" ? true : false;

        const response = await api(`/posts/toggle-all`,
            {
                method: 'POST',
                body: JSON.stringify({ publish }),
            });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to toggle publish status for posts');
        }

        setPosts(data);
    }

    return (
        <>
            <div className="posts-list-header">
                <h2>{type} Posts</h2>
                <button disabled={filteredPosts.length === 0} className="transparent-btn" onClick={toggleManyPublish}>{type.includes("Unpublished") ? "Publish All" : "Unpublish All"}</button>
            </div>

            {
                filteredPosts.map(post => (
                    <Post key={post.id} post={post} onEdit={() => {
                        setEditingPost(post);
                        setIsModalOpen(true);
                    }} />
                ))
            }
        </>
    );
}

export default PostsList;