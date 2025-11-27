import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import Comment from "./Comment";


function FullPost() {
    const { postId } = useParams();

    const [status, setStatus] = useState('loading');

    const [post, setPost] = useState(null);
    const [commentState, setCommentState] = useState(false);
    const [commentValue, setCommentValue] = useState("");

    async function fetchPost(postId) {
        const response = await api(`/posts/${postId}`);

        return response.json();
    }

    useEffect(() => {
        fetchPost(postId)
            .then((post) => {
                if (post?.message === "Post not found.") {
                    setStatus('not-found');
                    return;
                }

                setStatus('ready');
                setPost(post);
            }).catch(() => setStatus('error'));

    }, [postId]);

    function submitForm(e) {
        e.preventDefault();
        const content = commentValue.trim();
        if (content.length === 0) {
            return;
        }

        api(`/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        }).then(response => {
            if (!response.ok) {
                throw new Error('Failed to add comment');
            }

            fetchPost(postId).then(setPost).catch(error => console.error("Error fetching post:", error));
        })
            .catch(error => console.error("Error adding comment:", error));

        setCommentValue("");
        setCommentState(false);
    }

    function deleteComment(commentId) {
        api(`/posts/${postId}/comments/${commentId}`, {
            method: 'DELETE',
        }).then(() => {
            fetchPost(postId).then(setPost).catch(error => console.error("Error fetching post:", error));
        }).catch(err => {
            console.error('Failed to delete comment:', err);
        });
    }

    return (
        <div>
            <div className="full-post">
                {status === 'loading' ? <p>Loading…</p> :
                    status === 'not-found' ? <div className="not-found">Post not found.</div> :
                        status === 'error' ? <div className="error">We couldn't load this post.</div> :
                            (
                                <>
                                    <h1>{post ? post.title : "Loading..."}</h1>
                                    <div className="meta">
                                        <p>From: {post ? post.author.username : ""} - {post ? new Date(post.createdAt).toLocaleDateString() : ""}</p>
                                    </div>
                                    <p>{post ? post.content : ""}</p>

                                    <h2 className="comments-title">Comments</h2>
                                    <form className="comment-form" onSubmit={submitForm}>
                                        <textarea rows={3} placeholder="Write a comment..." minLength={1} onFocus={() => setCommentState(true)} value={commentValue} onChange={e => setCommentValue(e.target.value)}>
                                        </textarea>
                                        <div className={`comment-actions${commentState ? " show" : ""}`}>
                                            <button type="submit" className="secondary-btn">Add comment</button>
                                            <button type="button" className="transparent-btn" onClick={() => { setCommentState(false); setCommentValue(""); }}>Cancel</button>
                                        </div>
                                    </form>

                                    {post && post.comments.length > 0 ? (
                                        <ul className="comments-list">
                                            {post.comments.map(comment =>
                                                <Comment key={comment.id} comment={comment} deleteComment={() => deleteComment(comment.id)} />
                                            )}
                                        </ul>
                                    ) : (
                                        <p>No comments yet.</p>
                                    )}
                                </>
                            )}
            </div>
        </div>
    );
}

export default FullPost;