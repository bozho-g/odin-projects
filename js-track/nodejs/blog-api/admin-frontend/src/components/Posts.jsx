import { useEffect, useState } from "react";
import { api } from "../api/client";
import Modal from "./Modal";
import PostsList from "./PostsList";
import { PostsProvider } from "../contexts/postsContext";

function Posts() {
    const [posts, setPosts] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api("/posts").then(response => response.json())
            .then(data => setPosts(data))
            .catch(error => console.error("Error fetching posts:", error));
    }, []);

    const isLoading = posts.length === 0;

    function submitForm(e) {
        e.preventDefault();

        const title = e.target.title.value;
        const content = e.target.content.value;
        const published = e.target.published.checked;

        const method = editingPost ? 'PUT' : 'POST';
        const endpoint = editingPost ? `/posts/${editingPost.id}` : '/posts';

        api(endpoint, {
            method,
            body: JSON.stringify({ title, content, published }),
        }).then(async response => {
            if (!response.ok) {
                const data = await response.json();

                throw new Error(data.errors ? data.errors.map(err => err.msg).join(', ') : 'Failed to save post');
            }

            return response.json();
        }).then(savedPost => {
            if (editingPost) {
                setPosts(posts.map(post => post.id === savedPost.id ? savedPost : post));
            } else {
                setPosts([savedPost, ...posts]);
            }
            closeModal();
        }).catch(error => {
            setError(error.message);
        });
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingPost(null);
        setError(null);
    }

    function handleDelete(postId) {
        api(`/posts/${postId}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete post');
                }
                setPosts(posts.filter(post => post.id !== postId));
            })
            .catch(error => {
                setError(error.message);
            });
    }

    function togglePublish(post) {
        api(`/posts/${post.id}/toggle`, { method: 'POST' })
            .then(async response => {
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to toggle publish status');
                }

                const updatedPost = await response.json();
                setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
            })
            .catch(error => {
                setError(error.message);
            });
    }

    const contextValue = {
        posts,
        setPosts,
        editingPost,
        setEditingPost,
        error,
        setError,
        isModalOpen,
        setIsModalOpen,
        handleDelete,
        submitForm,
        closeModal,
        togglePublish,
    };

    return (
        <PostsProvider value={contextValue}>
            <div>
                <div className="top">
                    <h1 className="title">All Posts</h1>
                    <button className="btn primary hover-bg-primary-90" onClick={() => setIsModalOpen(true)}>Add New Post</button>
                </div>

                <Modal>
                    <h2>{editingPost ? "Edit Post" : "Create New Post"}</h2>
                    <form className="form" action="" onSubmit={submitForm}>
                        <div className="input-box">
                            <label htmlFor="title">Title:</label>
                            <input type="text" id="title" name="title" minLength={5} defaultValue={editingPost ? editingPost.title : ''} required />
                        </div>
                        <div className="input-box">
                            <label htmlFor="content">Content:</label>
                            <textarea id="content" name="content" minLength={20} defaultValue={editingPost ? editingPost.content : ''} required></textarea>
                        </div>
                        <div className="input-box">
                            <label htmlFor="published">Published:
                                <input type="checkbox" id="published" name="published" defaultChecked={editingPost ? editingPost.published : false} />
                            </label>

                        </div>
                        <button type="submit" className="btn primary hover-bg-primary-90">{editingPost ? "Update Post" : "Create Post"}</button>
                    </form>
                    {error && error.split(', ').map((errMsg, idx) => (<p key={idx} className="error">{errMsg}</p>))}
                </Modal>

                <div className="posts">
                    {isLoading && <p>Loading...</p>}
                    {!isLoading &&
                        <>
                            <PostsList type="Unpublished" />
                            <PostsList type="Published" />
                        </>
                    }
                </div>
            </div>
        </PostsProvider>
    );
}

export default Posts;