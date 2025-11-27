import { useEffect, useState } from "react";
import { api } from "../api/client";
import Post from "./Post";

function Posts() {
    const [posts, setPosts] = useState([]);
    const [state, setState] = useState("loading");

    useEffect(() => {
        api("/posts/published").then(response => response.json())
            .then(data => {
                setPosts(data);
                setState("ready");
            })
            .catch(error => {
                console.error("Error fetching posts:", error);
                setState("error");
            });
    }, []);

    return (
        <div>
            <div className="top">
                <h1 className="title">All Posts</h1>
            </div>

            <div className="posts">
                {state === "loading" && <p>Loading...</p>}
                {state === "error" && <p>Error loading posts.</p>}
                {posts.length === 0 && state === "ready" && <p>No posts available.</p>}
                {state === "ready" &&
                    posts.map(post => (
                        <Post key={post.id} post={post} />
                    ))
                }
            </div>
        </div>
    );
}

export default Posts;